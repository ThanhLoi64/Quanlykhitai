import { LogService } from './log.service';

describe('LogService', () => {
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
});
