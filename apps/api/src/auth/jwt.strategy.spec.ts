import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      runWithoutTenant: (callback: () => unknown) => callback(),
      user: {
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    strategy = new JwtStrategy(prisma);
  });

  it('rejects a token whose session was revoked', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 7,
      username: 'operator',
      role: 'STAFF',
      tenantId: 2,
      isActive: true,
      expiresAt: null,
      sessionVersion: 4,
      mustChangePassword: false,
      lastActivityAt: new Date(),
    });

    await expect(
      strategy.validate({ userId: 7, sessionVersion: 3 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('uses the current database role and tenant for a valid session', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 7,
      username: 'operator',
      role: 'ADMIN',
      tenantId: 5,
      isActive: true,
      expiresAt: null,
      sessionVersion: 4,
      mustChangePassword: false,
      lastActivityAt: new Date(),
    });

    await expect(
      strategy.validate({ userId: 7, sessionVersion: 4, role: 'STAFF', tenantId: 2 }),
    ).resolves.toMatchObject({ role: 'ADMIN', tenantId: 5 });
  });
});