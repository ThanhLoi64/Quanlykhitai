import { AsyncLocalStorage } from 'node:async_hooks';
import { ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminAccountsService } from './admin-accounts.service';

describe('AdminAccountsService', () => {
  let service: AdminAccountsService;
  let prisma: any;
  let tenantStorage: AsyncLocalStorage<number | null>;

  beforeEach(() => {
    tenantStorage = new AsyncLocalStorage<number | null>();
    prisma = {
      runWithoutTenant: (callback: () => unknown) => tenantStorage.run(null, callback),
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        count: jest.fn(),
      },
      appLog: { create: jest.fn().mockResolvedValue({}) },
    };
    service = new AdminAccountsService(prisma);
  });

  it('does not allow disabling the last active SYSADMIN', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 2,
      role: 'SYSADMIN',
      isActive: true,
      expiresAt: null,
    });
    prisma.user.count.mockResolvedValue(0);

    await expect(
      service.updateAccount(
        { id: 1, username: 'root', tenantId: 1 },
        2,
        { isActive: false },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('loads every account before leaving the unscoped tenant context', async () => {
    const allAccounts = Array.from({ length: 10 }, (_, index) => ({ id: index + 1 }));
    prisma.user.findMany.mockImplementation(() => ({
      then(resolve: (accounts: typeof allAccounts) => unknown) {
        resolve(tenantStorage.getStore() === null ? allAccounts : allAccounts.slice(0, 1));
      },
    }));
    tenantStorage.enterWith(1);

    const accounts = await service.listAccounts();

    expect(accounts).toHaveLength(10);
  });

  it('resets a password, requires a change, and revokes existing sessions', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 2, username: 'operator' });

    await service.resetPassword(
      { id: 1, username: 'root', tenantId: 1 },
      2,
      'initial-password',
    );

    const update = prisma.user.update.mock.calls[0][0];
    expect(update.data).toMatchObject({
      mustChangePassword: true,
      sessionVersion: { increment: 1 },
    });
    expect(update.data.password).not.toBe('initial-password');
    expect(await bcrypt.compare('initial-password', update.data.password)).toBe(true);
  });
});