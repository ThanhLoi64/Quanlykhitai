import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  // danh sách cấp phát

  findAll() {
    return this.prisma.registration.findMany({
      include: {
        owner: true,

        detail: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        id: 'desc',
      },
    });
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
