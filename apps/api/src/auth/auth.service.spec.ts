import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await bcrypt.hash('password', 4);
    prisma = {
      runWithoutTenant: jest.fn((callback: () => unknown) => callback()),
      user: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      appLog: { create: jest.fn().mockResolvedValue({}) },
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects an inactive account after validating its password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 4,
      username: 'staff1',
      password: passwordHash,
      isActive: false,
      expiresAt: null,
      tenantId: 2,
    });
    await expect(service.login('staff1', 'password')).rejects.toMatchObject({
      response: 'Tài khoản đã bị khóa',
      status: 423,
    } satisfies Partial<HttpException>);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('includes the session version and password-change requirement in login', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 4,
      username: 'staff1',
      password: passwordHash,
      fullName: 'Staff One',
      role: 'STAFF',
      tenantId: 2,
      isActive: true,
      expiresAt: null,
      sessionVersion: 3,
      mustChangePassword: true,
    });
    const result = await service.login('staff1', 'password');

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sessionVersion: 3 }),
    );
    expect(result.user.mustChangePassword).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lastLoginAt: expect.any(Date) }) }),
    );
    expect(prisma.appLog.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'Đăng nhập thành công' }),
      }),
    );
  });

  it('records successful logins for sysadmin accounts', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'sysadmin',
      password: passwordHash,
      fullName: 'System Administrator',
      role: 'SYSADMIN',
      tenantId: 1,
      isActive: true,
      expiresAt: null,
      sessionVersion: 1,
      mustChangePassword: false,
    });

    await service.login('sysadmin', 'password');

    expect(prisma.appLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: 'sysadmin',
          action: 'Đăng nhập thành công',
        }),
      }),
    );
  });
});
