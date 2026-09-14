import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';

@Injectable()
export class RepairService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tenantId = this.prisma.getCurrentTenantId();
    const orphanDetails = await this.prisma.productDetail.findMany({
      where: {
        status: 'REPAIR',
        repairRecords: { none: {} },
      },
      select: { id: true },
    });

    if (orphanDetails.length > 0) {
      await this.prisma.repairRecord.createMany({
        data: orphanDetails.map((detail) => ({
          productDetailId: detail.id,
          tenantId: tenantId ?? 1,
        })),
      });
    }

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

  async create(dto: CreateRepairDto, image?: any) {
    const tenantId = this.prisma.getCurrentTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant không hợp lệ');
    }

    const productDetailId = Number(dto.productDetailId);
    if (!Number.isInteger(productDetailId)) {
      throw new BadRequestException('Mã chi tiết kho không hợp lệ');
    }

    const detail = await this.prisma.productDetail.findUnique({
      where: {
        id: productDetailId,
      },
      include: {
        product: true,
      },
    });

    if (!detail) {
      throw new BadRequestException('Chi tiết kho không tồn tại');
    }

    const uploadedImage = image ? await this.uploadImage(image) : undefined;

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.repairRecord.create({
        data: {
          tenantId,
          productDetail: {
            connect: {
              id: productDetailId,
            },
          },
          damageStatus: dto.damageStatus ?? null,
          cause: dto.cause ?? null,
          repairStartDate: dto.repairStartDate
            ? new Date(dto.repairStartDate)
            : null,
          severity: dto.severity ?? null,
          repairUnit: dto.repairUnit ?? null,
          receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : null,
          note: dto.note ?? null,
          image: uploadedImage?.url,
          imageFileId: uploadedImage?.fileId,
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
          id: productDetailId,
        },
        data: {
          status: 'REPAIR',
        },
      });

      return created;
    });
  }

  async update(id: number, dto: UpdateRepairDto, image?: any) {
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

    const productDetailId =
      dto.productDetailId !== undefined
        ? Number(dto.productDetailId)
        : existing.productDetailId;

    if (!Number.isInteger(productDetailId)) {
      throw new BadRequestException('Mã chi tiết kho không hợp lệ');
    }

    if (
      productDetailId !== existing.productDetailId
    ) {
      const newDetail = await this.prisma.productDetail.findUnique({
        where: {
          id: productDetailId,
        },
      });

      if (!newDetail) {
        throw new BadRequestException('Chi tiết kho mới không tồn tại');
      }
    }

    const uploadedImage = image ? await this.uploadImage(image) : undefined;

    return this.prisma.$transaction(async (tx) => {
      if (
        productDetailId !== existing.productDetailId
      ) {
        await tx.productDetail.update({
          where: {
            id: existing.productDetailId,
          },
          data: {
            status:
              existing.productDetail.status === 'REPAIR'
                ? 'IN_STOCK'
                : existing.productDetail.status,
          },
        });

        await tx.productDetail.update({
          where: {
            id: productDetailId,
          },
          data: {
            status: 'REPAIR',
          },
        });
      }

      const data: any = {
        damageStatus: dto.damageStatus,
        cause: dto.cause,
        repairStartDate: dto.repairStartDate
          ? new Date(dto.repairStartDate)
          : undefined,
        severity: dto.severity,
        repairUnit: dto.repairUnit,
        receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : undefined,
        note: dto.note,
        ...(uploadedImage
          ? { image: uploadedImage.url, imageFileId: uploadedImage.fileId }
          : {}),
      };

      if (productDetailId !== existing.productDetailId) {
        data.productDetail = {
          connect: {
            id: productDetailId,
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

  private async uploadImage(image: any): Promise<{ url: string; fileId: string }> {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) throw new BadRequestException('IMAGEKIT_PRIVATE_KEY chưa được cấu hình');

    const form = new FormData();
    form.append('file', new Blob([image.buffer], { type: image.mimetype }), image.originalname);
    form.append('fileName', `${Date.now()}-${image.originalname}`);
    form.append('folder', '/quan-ly-khi-tai/repairs');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new BadRequestException(`ImageKit upload failed: ${await response.text()}`);
    }

    const result = await response.json() as { url: string; fileId: string };
    return { url: result.url, fileId: result.fileId };
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
