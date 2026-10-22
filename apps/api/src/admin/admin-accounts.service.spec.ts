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
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        count: jest.fn(),
      },
      tenant: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback: (transaction: any) => unknown) =>
        callback({
          tenant: { create: prisma.tenant.create },
          user: { create: prisma.user.create },
        }),
      ),
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

  it('returns at most ten accounts for a page and global summary counts', async () => {
    const pageAccounts = Array.from({ length: 10 }, (_, index) => ({ id: index + 1 }));
    prisma.user.findMany.mockImplementation(() => ({
      then(resolve: (accounts: typeof pageAccounts) => unknown) {
        resolve(tenantStorage.getStore() === null ? pageAccounts : pageAccounts.slice(0, 1));
      },
    }));
    prisma.user.count.mockResolvedValue(12);
    tenantStorage.enterWith(1);

    const result = await service.listAccounts(2, {});

    expect(result.accounts).toHaveLength(10);
    expect(result.total).toBe(12);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
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

  it('creates a new child tenant and assigns it to each new account', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.tenant.create.mockResolvedValue({ id: 42 });
    prisma.user.create.mockResolvedValue({
      id: 3,
      username: 'new-admin',
      fullName: 'New Admin',
      role: 'ADMIN',
    });

    const created = await service.createAccount(
      { id: 1, username: 'root', tenantId: 1 },
      {
        username: 'new-admin',
        fullName: 'New Admin',
        password: 'initial-password',
        role: 'ADMIN',
      },
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.tenant.create).toHaveBeenCalledWith({
      data: {
        name: expect.stringMatching(/^new-admin tenant /),
        parentId: 1,
      },
      select: { id: true },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 42 }),
      }),
    );
    expect(created).toMatchObject({ username: 'new-admin', role: 'ADMIN' });
  });
});