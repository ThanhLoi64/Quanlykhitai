import * as bcrypt from 'bcrypt';
import { LogService } from './log.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('LogService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('formats object detail into readable log text', async () => {
    const appLogCreate = jest.fn().mockResolvedValue({ id: 1 });
    const prisma = {
      appLog: {
        create: appLogCreate,
      },
    } as any;

    const service = new LogService(prisma);

    await service.create({ id: 1, username: 'admin' }, 'Cập nhật vũ khí', {
      field: 'name',
      value: 'M16',
    } as any);

    expect(appLogCreate).toHaveBeenCalledWith({
      data: {
        userId: 1,
        username: 'admin',
        action: 'Cập nhật vũ khí',
        detail: 'field: name | value: M16',
      },
    });
  });

  it('deletes all logs when the password matches the current user', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const deleteMany = jest.fn().mockResolvedValue({ count: 3 });
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          username: 'admin',
          password: 'hashed-password',
        }),
      },
      appLog: {
        deleteMany,
      },
    } as any;

    const service = new LogService(prisma);

    await expect(service.deleteAllWithPassword('admin', '123456')).resolves.toEqual({ count: 3 });
    expect(deleteMany).toHaveBeenCalledWith({});
  });

  it('rejects deletion when the password is incorrect', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          username: 'admin',
          password: 'hashed-password',
        }),
      },
      appLog: {
        deleteMany: jest.fn(),
      },
    } as any;

    const service = new LogService(prisma);

    await expect(service.deleteAllWithPassword('admin', 'wrong-password')).rejects.toThrow(
      'Mật khẩu không đúng',
    );
  });
});
