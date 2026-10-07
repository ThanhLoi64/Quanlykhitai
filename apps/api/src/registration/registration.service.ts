import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  // danh sách cấp phát

  async findAll(page = 1, limit = 10) {
    const currentPage = Math.max(1, page);
    const pageSize = Math.min(100, Math.max(1, limit));
    const [items, total] = await Promise.all([
      this.prisma.registration.findMany({
        select: {
          id: true,
          ownerId: true,
          detailId: true,
          registeredAt: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              rank: true,
              position: true,
              department: true,
            },
          },
          detail: {
            select: {
              id: true,
              productId: true,
              serialNumber: true,
              status: true,
              accessory: true,
              equipment: true,
              militaryEquipment: true,
              product: { select: { name: true } },
            },
          },
        },
        orderBy: { id: 'desc' },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.registration.count(),
    ]);

    return { items, total, page: currentPage, pageSize };
  }

  async findFormOptions() {
    const [owners, products, inventories] = await Promise.all([
      this.prisma.owner.findMany({
        select: { id: true, fullName: true, position: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.product.findMany({
        select: { id: true, name: true },
      }),
      this.prisma.productDetail.findMany({
        where: { status: 'IN_STOCK' },
        select: {
          id: true,
          productId: true,
          serialNumber: true,
          status: true,
        },
        orderBy: { id: 'desc' },
      }),
    ]);

    return { owners, products, inventories };
  }

  // đăng ký cấp phát

  async create(dto: CreateRegistrationDto) {
    // tạo phiếu cấp phát

    const registration = await this.prisma.registration.create({
      data: {
        owner: {
          connect: {
            id: dto.ownerId,
          },
        },

        detail: {
          connect: {
            id: dto.detailId,
          },
        },
      },

      include: {
        owner: true,

        detail: {
          include: {
            product: true,
          },
        },
      },
    });

    // đổi trạng thái khẩu súng

    await this.prisma.productDetail.update({
      where: {
        id: dto.detailId,
      },

      data: {
        status: 'ISSUED',
        ownerId: dto.ownerId,
        accessory: dto.accessory ?? null,
        equipment: dto.equipment ?? null,
        militaryEquipment: dto.militaryEquipment ?? null,
      },
    });

    return registration;
  }

  async update(id: number, dto: Partial<CreateRegistrationDto>) {
    const existing = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        detail: true,
      },
    });

    if (!existing) {
      throw new Error('Registration not found');
    }

    const ownerId = dto.ownerId ?? existing.ownerId;
    const detailId = dto.detailId ?? existing.detailId;

    return this.prisma.$transaction(async (tx) => {
      if (existing.detailId !== detailId) {
        await tx.productDetail.update({
          where: { id: existing.detailId },
          data: {
            status: 'IN_STOCK',
            ownerId: null,
          },
        });
      }

      await tx.productDetail.update({
        where: { id: detailId },
        data: {
          status: 'ISSUED',
          ownerId,
          accessory: dto.accessory ?? null,
          equipment: dto.equipment ?? null,
          militaryEquipment: dto.militaryEquipment ?? null,
        },
      });

      return tx.registration.update({
        where: { id },
        data: {
          ownerId,
          detailId,
        },
        include: {
          owner: true,
          detail: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        detail: true,
      },
    });

    if (!existing) {
      throw new Error('Registration not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.productDetail.update({
        where: { id: existing.detailId },
        data: {
          status: 'IN_STOCK',
          ownerId: null,
        },
      });

      return tx.registration.delete({
        where: { id },
      });
    });
  }
}
