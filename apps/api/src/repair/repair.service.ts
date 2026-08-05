import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';

@Injectable()
export class RepairService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.repairRecord.findMany({
      include: {
        productDetail: {
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

  async create(dto: CreateRepairDto) {
    const detail = await this.prisma.productDetail.findUnique({
      where: {
        id: dto.productDetailId,
      },
      include: {
        product: true,
      },
    });

    if (!detail) {
      throw new BadRequestException('Chi tiết kho không tồn tại');
    }

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.repairRecord.create({
        data: {
          productDetail: {
            connect: {
              id: dto.productDetailId,
            },
          },
          damageStatus: dto.damageStatus ?? null,
          cause: dto.cause ?? null,
          repairStartDate: dto.repairStartDate ?? null,
          severity: dto.severity ?? null,
          repairUnit: dto.repairUnit ?? null,
          receivedDate: dto.receivedDate ?? null,
          note: dto.note ?? null,
        },
        include: {
          productDetail: {
            include: {
              product: true,
            },
          },
        },
      });

      await tx.productDetail.update({
        where: {
          id: dto.productDetailId,
        },
        data: {
          status: 'REPAIR',
        },
      });

      return created;
    });
  }

  async update(id: number, dto: UpdateRepairDto) {
    const existing = await this.prisma.repairRecord.findUnique({
      where: {
        id,
      },
      include: {
        productDetail: true,
      },
    });

    if (!existing) {
      throw new BadRequestException('Bản ghi sửa chữa không tồn tại');
    }

    const productDetailId = dto.productDetailId ?? existing.productDetailId;

    if (dto.productDetailId && dto.productDetailId !== existing.productDetailId) {
      const newDetail = await this.prisma.productDetail.findUnique({
        where: {
          id: dto.productDetailId,
        },
      });

      if (!newDetail) {
        throw new BadRequestException('Chi tiết kho mới không tồn tại');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.productDetailId && dto.productDetailId !== existing.productDetailId) {
        await tx.productDetail.update({
          where: {
            id: existing.productDetailId,
          },
          data: {
            status: existing.productDetail.status === 'REPAIR' ? 'IN_STOCK' : existing.productDetail.status,
          },
        });

        await tx.productDetail.update({
          where: {
            id: dto.productDetailId,
          },
          data: {
            status: 'REPAIR',
          },
        });
      }

      const data: any = {
        damageStatus: dto.damageStatus,
        cause: dto.cause,
        repairStartDate: dto.repairStartDate,
        severity: dto.severity,
        repairUnit: dto.repairUnit,
        receivedDate: dto.receivedDate,
        note: dto.note,
      };

      if (dto.productDetailId !== undefined) {
        data.productDetail = {
          connect: {
            id: dto.productDetailId,
          },
        };
      }

      return tx.repairRecord.update({
        where: {
          id,
        },
        data,
        include: {
          productDetail: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.repairRecord.findUnique({
      where: {
        id,
      },
      include: {
        productDetail: true,
      },
    });

    if (!existing) {
      throw new BadRequestException('Bản ghi sửa chữa không tồn tại');
    }

    return this.prisma.$transaction(async (tx) => {
      if (existing.productDetail.status === 'REPAIR') {
        await tx.productDetail.update({
          where: {
            id: existing.productDetailId,
          },
          data: {
            status: 'IN_STOCK',
          },
        });
      }

      return tx.repairRecord.delete({
        where: {
          id,
        },
      });
    });
  }
}
