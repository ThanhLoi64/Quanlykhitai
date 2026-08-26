import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateChildAccountDto } from './dto/create-child-account.dto';


@Injectable()
export class AuthService {


constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
) {
}

async login(
  username: string,
  password: string,
) {
  const user = await this.prisma.user.findUnique({
    where: {
      username,
    },
  });


  if (!user) {
    throw new UnauthorizedException(
      'Sai tài khoản hoặc mật khẩu'
    );
  }


  const checkPassword = await bcrypt.compare(
    password,
    user.password,
  );


  if (!checkPassword) {
    throw new UnauthorizedException(
      'Sai tài khoản hoặc mật khẩu'
    );
  }


  // dữ liệu đưa vào token
  const payload = {
    sub: user.id,
    userId: user.id,
    username: user.username,
    role: user.role,
    tenantId: user.tenantId,
  };


  // tạo JWT
  const accessToken =
    await this.jwtService.signAsync(payload);



  return {

    accessToken,


    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
    },

  };

}

async getChildWeaponSummary(user: { tenantId: number; role: string }) {
  const visibleRoles: Record<string, string[]> = {
    SYSADMIN: ['ADMIN', 'STAFF', 'USER'],
    ADMIN: ['STAFF', 'USER'],
    STAFF: ['USER'],
  };
  const roles = visibleRoles[user.role];
  if (!roles) return [];

  return this.prisma.runWithoutTenant(async () => {
    const tenants = await this.prisma.tenant.findMany({
      select: { id: true, name: true, parentId: true },
    });
    const [childUsers, products] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: { in: roles as any } },
        select: { username: true, fullName: true, role: true, tenantId: true },
      }),
      this.prisma.product.findMany({
        include: { category: true, details: true },
      }),
    ]);

    const childIds = [...new Set(childUsers.map((account) => account.tenantId))];

    return childIds.map((tenantId) => {
      const tenant = tenants.find((item) => item.id === tenantId)!;
      return {
        tenantId,
        tenantName: tenant.name,
        accounts: childUsers.filter((item) => item.tenantId === tenantId),
        totalWeapons: products
          .filter((item) => item.tenantId === tenantId)
          .reduce((total, item) => total + item.details.length, 0),
        products: products.filter((item) => item.tenantId === tenantId),
      };
    });
  });
}

async getChildAccounts(user: { tenantId: number; role: string }) {
  const visibleRoles: Record<string, string[]> = {
    SYSADMIN: ['ADMIN', 'STAFF', 'USER'],
    ADMIN: ['STAFF', 'USER'],
    STAFF: ['USER'],
  };
  const roles = visibleRoles[user.role];
  if (!roles) return [];

  return this.prisma.runWithoutTenant(async () => {
    const tenants = await this.prisma.tenant.findMany({
      select: { id: true, name: true, parentId: true },
    });

    const accounts = await this.prisma.user.findMany({
      where: { role: { in: roles as any } },
      select: { id: true, username: true, fullName: true, role: true, tenantId: true, isActive: true },
      orderBy: { username: 'asc' },
    });

    return accounts.map((account) => ({
      ...account,
      tenantName: tenants.find((tenant) => tenant.id === account.tenantId)?.name,
    }));
  });
}

async createChildAccount(user: { tenantId: number; role: string }, dto: CreateChildAccountDto) {
  const childRole = ({ SYSADMIN: 'ADMIN', ADMIN: 'STAFF', STAFF: 'USER' } as Record<string, string>)[user.role];
  if (!childRole) throw new ForbiddenException('Tài khoản này không được tạo tài khoản con');

  return this.prisma.runWithoutTenant(async () => {
    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) throw new ConflictException('Tên tài khoản đã tồn tại');

    const tenant = await this.prisma.tenant.create({
      data: { name: `${dto.username} tenant`, parentId: user.tenantId },
    });
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        username: dto.username,
        password,
        fullName: dto.fullName,
        role: childRole as any,
        tenantId: tenant.id,
      },
      select: { id: true, username: true, fullName: true, role: true, tenantId: true, isActive: true },
    });
  });
}
}