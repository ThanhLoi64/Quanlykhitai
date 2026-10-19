import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAccountsService } from './admin-accounts.service';

@ApiBearerAuth()
@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSADMIN')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: AdminAccountsService,
  ) {}

  @Get('accounts')
  listAccounts() {
    return this.accounts.listAccounts();
  }

  @Get('tenants')
  listTenants() {
    return this.accounts.listTenants();
  }

  @Get('accounts/:id/login-history')
  loginHistory(@Param('id') id: string) {
    return this.accounts.getLoginHistory(this.parseId(id));
  }

  @Post('accounts')
  createAccount(@Req() request: any, @Body() body: Record<string, unknown>) {
    return this.accounts.createAccount(request.user, body);
  }

  @Patch('accounts/:id')
  updateAccount(
    @Req() request: any,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.accounts.updateAccount(request.user, this.parseId(id), body);
  }

  @Patch('accounts/:id/password')
  resetPassword(
    @Req() request: any,
    @Param('id') id: string,
    @Body() body: { password?: unknown },
  ) {
    return this.accounts.resetPassword(request.user, this.parseId(id), body.password);
  }

  @Post('accounts/:id/revoke-sessions')
  revokeSessions(@Req() request: any, @Param('id') id: string) {
    return this.accounts.revokeSessions(request.user, this.parseId(id));
  }

  @Get('dashboard')
  getDashboard() {
    return this.prisma.runWithoutTenant(async () => {
      let database: Array<{ bytes: string; pretty: string }>;
      try {
        database = await this.prisma.$queryRaw<
          Array<{ bytes: string; pretty: string }>
        >`
          SELECT pg_database_size(current_database())::text AS "bytes",
                 pg_size_pretty(pg_database_size(current_database())) AS "pretty"
        `;
      } catch {
        return {
          metrics: {
            totalAccounts: null,
            activeAccounts: null,
            lockedAccounts: null,
            totalEquipment: null,
            totalCategories: null,
            businessRecords: null,
          },
          system: {
            api: 'online',
            database: 'disconnected',
            databaseSizeBytes: null,
            databaseSizeLabel: null,
          },
          recentActivity: [],
        };
      }

      const [
        totalAccounts,
        activeAccounts,
        totalEquipment,
        totalCategories,
        registrations,
        transfers,
        repairs,
        recentActivity,
        securityEvents,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.productDetail.count(),
        this.prisma.category.count(),
        this.prisma.registration.count(),
        this.prisma.transfer.count(),
        this.prisma.repairRecord.count(),
        this.prisma.appLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 12,
        }),
        this.prisma.appLog.findMany({
          where: { action: { in: ['Đăng nhập thành công', 'Đăng nhập thất bại'] } },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]);

      return {
        metrics: {
          totalAccounts,
          activeAccounts,
          lockedAccounts: totalAccounts - activeAccounts,
          totalEquipment,
          totalCategories,
          businessRecords: registrations + transfers + repairs,
        },
        system: {
          api: 'online',
          database: 'connected',
          databaseSizeBytes: database[0]?.bytes ?? null,
          databaseSizeLabel: database[0]?.pretty ?? null,
        },
        recentActivity,
        securityEvents,
      };
    });
  }

  private parseId(value: string) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id < 1) {
      throw new BadRequestException('Mã tài khoản không hợp lệ');
    }
    return id;
  }
}