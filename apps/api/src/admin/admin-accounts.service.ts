import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const manageableRoles = ['SYSADMIN', 'ADMIN', 'STAFF'] as const;
type ManageableRole = (typeof manageableRoles)[number];
type AdminActor = { id: number; username: string; tenantId: number };

@Injectable()
export class AdminAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  listTenants() {
    return this.prisma.runWithoutTenant(() =>
      this.prisma.tenant.findMany({
        select: { id: true, name: true, parentId: true },
        orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      }),
    );
  }

  listAccounts(
    page: number,
    filters: { search?: string; role?: string; status?: string; presence?: string },
  ) {
    return this.prisma.runWithoutTenant(async () => {
      const now = new Date();
      const onlineSince = new Date(now.getTime() - 2 * 60 * 1000);
      const conditions: Prisma.UserWhereInput[] = [];
      const search = filters.search?.trim();

      if (search) {
        conditions.push({
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { tenant: { is: { name: { contains: search, mode: 'insensitive' } } } },
          ],
        });
      }
      if (filters.role) conditions.push({ role: filters.role as Prisma.UserWhereInput['role'] });
      if (filters.status === 'active') conditions.push({ isActive: true });
      if (filters.status === 'inactive') conditions.push({ isActive: false });
      if (filters.presence === 'online') {
        conditions.push({
          isActive: true,
          lastActivityAt: { gte: onlineSince },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        });
      }
      if (filters.presence === 'offline') {
        conditions.push({
          OR: [
            { isActive: false },
            { expiresAt: { lte: now } },
            { lastActivityAt: null },
            { lastActivityAt: { lt: onlineSince } },
          ],
        });
      }

      const where: Prisma.UserWhereInput = conditions.length ? { AND: conditions } : {};
      const onlineWhere: Prisma.UserWhereInput = {
        isActive: true,
        lastActivityAt: { gte: onlineSince },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      };
      const [total, allAccounts, activeAccounts, onlineAccounts, accounts] = await Promise.all([
        this.prisma.user.count({ where }),
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: onlineWhere }),
        this.prisma.user.findMany({
          where,
          skip: (page - 1) * 10,
          take: 10,
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            expiresAt: true,
            lastLoginAt: true,
            lastActivityAt: true,
            createdAt: true,
            tenantId: true,
            tenant: { select: { name: true } },
          },
          orderBy: [{ role: 'asc' }, { username: 'asc' }],
        }),
      ]);

      return {
        accounts,
        total,
        page,
        pageSize: 10,
        summary: {
          total: allAccounts,
          active: activeAccounts,
          inactive: allAccounts - activeAccounts,
          online: onlineAccounts,
          offline: allAccounts - onlineAccounts,
        },
      };
    });
  }

  async getLoginHistory(id: number) {
    return this.prisma.runWithoutTenant(async () => {
      const account = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

      return this.prisma.appLog.findMany({
        where: {
          userId: id,
          action: { in: ['Đăng nhập thành công', 'Đăng nhập thất bại'] },
        },
        select: { id: true, action: true, detail: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  }

  async createAccount(actor: AdminActor, body: Record<string, unknown>) {
    const username = this.requiredText(body.username, 'Tên đăng nhập', 100);
    const fullName = this.requiredText(body.fullName, 'Họ và tên', 150);
    const password = this.passwordValue(body.password);
    const role = this.roleValue(body.role);
    const tenantId = this.tenantIdValue(body.tenantId);
    const expiresAt = this.dateValue(body.expiresAt);
    const mustChangePassword = body.mustChangePassword !== false;

    return this.prisma.runWithoutTenant(async () => {
      const [existing, tenant] = await Promise.all([
        this.prisma.user.findUnique({ where: { username }, select: { id: true } }),
        this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } }),
      ]);
      if (existing) throw new ConflictException('Tên đăng nhập đã tồn tại');
      if (!tenant) throw new BadRequestException('Đơn vị không tồn tại');
      this.validateExpiry(expiresAt);

      const created = await this.prisma.user.create({
        data: {
          username,
          fullName,
          password: await bcrypt.hash(password, 10),
          role: role as any,
          tenantId,
          expiresAt,
          mustChangePassword,
        },
        select: { id: true, username: true, fullName: true, role: true },
      });
      await this.audit(actor, 'Tạo tài khoản', `${created.username} (${role})`);
      return created;
    });
  }

  async updateAccount(actor: AdminActor, id: number, body: Record<string, unknown>) {
    return this.prisma.runWithoutTenant(async () => {
      const current = await this.prisma.user.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Không tìm thấy tài khoản');

      const data: Record<string, unknown> = {};
      if ('fullName' in body) data.fullName = this.requiredText(body.fullName, 'Họ và tên', 150);
      if ('role' in body) {
        data.role = body.role === 'USER' && current.role === 'USER'
          ? 'USER'
          : this.roleValue(body.role);
      }
      if ('isActive' in body) {
        if (typeof body.isActive !== 'boolean') throw new BadRequestException('Trạng thái tài khoản không hợp lệ');
        data.isActive = body.isActive;
      }
      if ('tenantId' in body) {
        const tenantId = this.tenantIdValue(body.tenantId);
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
        if (!tenant) throw new BadRequestException('Đơn vị không tồn tại');
        data.tenantId = tenantId;
      }
      if ('expiresAt' in body) {
        const expiresAt = this.dateValue(body.expiresAt);
        this.validateExpiry(expiresAt);
        data.expiresAt = expiresAt;
      }
      if ('mustChangePassword' in body) {
        if (typeof body.mustChangePassword !== 'boolean') throw new BadRequestException('Trạng thái đổi mật khẩu không hợp lệ');
        data.mustChangePassword = body.mustChangePassword;
      }
      if (Object.keys(data).length === 0) throw new BadRequestException('Không có thay đổi để lưu');

      const nextRole = (data.role as string | undefined) ?? current.role;
      const nextActive = (data.isActive as boolean | undefined) ?? current.isActive;
      const nextExpiry = ('expiresAt' in data ? data.expiresAt : current.expiresAt) as Date | null;
      await this.ensureSystemAdminRemains(actor, current, nextRole, nextActive, nextExpiry);

      const securityChange =
        (data.role !== undefined && data.role !== current.role) ||
        (data.isActive !== undefined && data.isActive !== current.isActive) ||
        (data.tenantId !== undefined && data.tenantId !== current.tenantId) ||
        (data.mustChangePassword !== undefined && data.mustChangePassword !== current.mustChangePassword) ||
        (data.expiresAt !== undefined &&
          (data.expiresAt as Date | null)?.getTime() !== current.expiresAt?.getTime());
      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          ...(securityChange ? { sessionVersion: { increment: 1 } } : {}),
        } as any,
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          expiresAt: true,
          lastLoginAt: true,
          lastActivityAt: true,
          tenantId: true,
          tenant: { select: { name: true } },
        },
      });
      await this.audit(actor, 'Cập nhật tài khoản', `${updated.username} (${Object.keys(data).join(', ')})`);
      return updated;
    });
  }

  async resetPassword(actor: AdminActor, id: number, passwordInput: unknown) {
    const password = this.passwordValue(passwordInput);
    return this.prisma.runWithoutTenant(async () => {
      const account = await this.prisma.user.findUnique({ where: { id }, select: { id: true, username: true } });
      if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

      await this.prisma.user.update({
        where: { id },
        data: {
          password: await bcrypt.hash(password, 10),
          mustChangePassword: true,
          sessionVersion: { increment: 1 },
        },
      });
      await this.audit(actor, 'Đặt lại mật khẩu', account.username);
      return { success: true, mustChangePassword: true };
    });
  }

  async revokeSessions(actor: AdminActor, id: number) {
    return this.prisma.runWithoutTenant(async () => {
      const account = await this.prisma.user.findUnique({ where: { id }, select: { id: true, username: true } });
      if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

      await this.prisma.user.update({ where: { id }, data: { sessionVersion: { increment: 1 } } });
      await this.audit(actor, 'Thu hồi phiên đăng nhập', account.username);
      return { success: true };
    });
  }

  private async ensureSystemAdminRemains(
    actor: AdminActor,
    current: { id: number; role: string; isActive: boolean },
    role: string,
    isActive: boolean,
    expiresAt: Date | null,
  ) {
    const isEligible = role === 'SYSADMIN' && isActive && (!expiresAt || expiresAt > new Date());
    if (current.id === actor.id && !isEligible) {
      throw new ForbiddenException('Không thể vô hiệu hóa, hết hạn hoặc hạ quyền tài khoản đang đăng nhập');
    }
    if (current.role === 'SYSADMIN' && current.isActive && !isEligible) {
      const otherAdmins = await this.prisma.user.count({
        where: {
          id: { not: current.id },
          role: 'SYSADMIN',
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (otherAdmins === 0) throw new ForbiddenException('Phải duy trì ít nhất một SYSADMIN đang hoạt động');
    }
  }

  private async audit(actor: AdminActor, action: string, detail: string) {
    try {
      await this.prisma.appLog.create({
        data: { userId: actor.id, username: actor.username, tenantId: actor.tenantId, action, detail },
      });
    } catch {
      // Account changes should not be reported as failed after they have committed.
    }
  }

  private requiredText(value: unknown, label: string, maxLength: number) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
      throw new BadRequestException(`${label} không hợp lệ`);
    }
    return value.trim();
  }

  private passwordValue(value: unknown) {
    if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
      throw new BadRequestException('Mật khẩu phải có từ 8 đến 128 ký tự');
    }
    return value;
  }

  private roleValue(value: unknown): ManageableRole {
    if (typeof value !== 'string' || !manageableRoles.includes(value as ManageableRole)) {
      throw new BadRequestException('Vai trò phải là SYSADMIN, ADMIN hoặc STAFF');
    }
    return value as ManageableRole;
  }

  private tenantIdValue(value: unknown) {
    const tenantId = typeof value === 'number' ? value : Number(value);
    if (!Number.isInteger(tenantId) || tenantId < 1) throw new BadRequestException('Đơn vị không hợp lệ');
    return tenantId;
  }

  private dateValue(value: unknown): Date | null {
    if (value == null || value === '') return null;
    if (typeof value !== 'string') throw new BadRequestException('Thời hạn tài khoản không hợp lệ');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Thời hạn tài khoản không hợp lệ');
    return date;
  }

  private validateExpiry(expiresAt: Date | null) {
    if (expiresAt && expiresAt <= new Date()) throw new BadRequestException('Thời hạn phải nằm trong tương lai');
  }
}