import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { ImportInventoryItemDto } from "./dto/import-inventory.dto";
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class InventoryService {
  async incomingTransfers() {
    const tenantId = this.prisma.getCurrentTenantId();
    if (!tenantId) throw new BadRequestException('Tenant không hợp lệ');

    return this.prisma.runWithoutTenant(() =>
      this.prisma.transfer.findMany({
        where: { toTenantId: tenantId, status: 'PENDING' },
        include: {
          product: { select: { name: true } },
          productDetail: { select: { serialNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }).then(async (transfers) => {
        const senders = await this.prisma.user.findMany({
          where: { tenantId: { in: [...new Set(transfers.map((transfer) => transfer.fromTenantId))] } },
          select: { tenantId: true, username: true },
        });
        return transfers.map((transfer) => ({
          ...transfer,
          fromUsername: senders.find((sender) => sender.tenantId === transfer.fromTenantId)?.username,
        }));
      }),
    );
  }

  async respondToTransfer(id: number, accepted: boolean) {
    const tenantId = this.prisma.getCurrentTenantId();
    if (!tenantId) throw new BadRequestException('Tenant không hợp lệ');

    return this.prisma.runWithoutTenant(() =>
      this.prisma.$transaction(async (tx: any) => {
        const transfer = await tx.transfer.findFirst({
          where: { id, toTenantId: tenantId, status: 'PENDING' },
        });
        if (!transfer) throw new BadRequestException('Phiếu chuyển không tồn tại hoặc đã xử lý');

        if (!accepted) {
          return tx.transfer.update({ where: { id }, data: { status: 'REJECTED' } });
        }

        const sourceProduct = await tx.product.findUnique({
          where: { id: transfer.productId },
          include: { category: true },
        });
        if (!sourceProduct) throw new BadRequestException('Sản phẩm nguồn không tồn tại');

        let targetCategory = await tx.category.findFirst({
          where: {
            tenantId,
            name: { equals: sourceProduct.category.name, mode: 'insensitive' },
          },
        });
        if (!targetCategory) {
          targetCategory = await tx.category.create({
            data: {
              name: sourceProduct.category.name,
              description: sourceProduct.category.description,
              tenantId,
            },
          });
        }

        let targetProduct = await tx.product.findFirst({
          where: { tenantId, name: sourceProduct.name, categoryId: targetCategory.id },
        });
        if (!targetProduct) {
          targetProduct = await tx.product.create({
            data: {
              name: sourceProduct.name,
              unit: sourceProduct.unit,
              classification: sourceProduct.classification,
              quantity: sourceProduct.quantity,
              storageLocation: sourceProduct.storageLocation,
              note: sourceProduct.note,
              categoryId: targetCategory.id,
              tenantId,
            },
          });
        }

        await tx.productDetail.update({
          where: { id: transfer.productDetailId },
          data: {
            tenantId,
            productId: targetProduct.id,
            warehouseId: transfer.toWarehouseId,
          },
        });
        return tx.transfer.update({ where: { id }, data: { status: 'ACCEPTED' } });
      }),
    );
  }

  async transferOptions() {
    return this.prisma.runWithoutTenant(async () => {
      const [users, warehouses] = await Promise.all([
        this.prisma.user.findMany({
          where: { isActive: true },
          select: { tenantId: true, username: true, fullName: true },
          orderBy: { username: 'asc' },
        }),
        this.prisma.warehouse.findMany({
          select: { id: true, name: true, tenantId: true },
          orderBy: { name: 'asc' },
        }),
      ]);

      return users.map((user) => ({
        tenantId: user.tenantId,
        username: user.username,
        fullName: user.fullName,
        warehouses: warehouses.filter((warehouse) => warehouse.tenantId === user.tenantId),
      }));
    });
  }

  async createTransfer(dto: CreateTransferDto) {
    const sourceTenantId = this.prisma.getCurrentTenantId();
    if (!sourceTenantId) throw new BadRequestException('Tenant không hợp lệ');

    const detail = await this.prisma.productDetail.findUnique({
      where: { id: dto.productDetailId },
      select: { id: true, productId: true, status: true },
    });
    if (!detail) throw new BadRequestException('Khí tài không thuộc đơn vị hiện tại');
    if (detail.status !== 'IN_STOCK') throw new BadRequestException('Chỉ được xuất khí tài đang trong kho');

    const destinationRows = await this.prisma.$queryRawUnsafe(
      'SELECT id, "tenantId" FROM "Warehouse" WHERE id = $1 LIMIT 1',
      dto.toWarehouseId,
    ) as Array<{ id: number; tenantId: number }>;
    const destination = destinationRows[0];
    console.log('[TRANSFER DEBUG]', {
      sourceTenantId,
      productDetailId: dto.productDetailId,
      requestedWarehouseId: dto.toWarehouseId,
      destination,
    });
    if (!destination) throw new BadRequestException('Kho nhận không thuộc tài khoản đích');
    if (destination.tenantId === sourceTenantId) {
      throw new BadRequestException('Đơn vị nhận phải khác đơn vị hiện tại');
    }

    const pending = await this.prisma.transfer.findFirst({
      where: { productDetailId: dto.productDetailId, status: 'PENDING' },
    });
    if (pending) throw new BadRequestException('Khí tài này đã có phiếu chuyển đang chờ');

    return this.prisma.transfer.create({
      data: {
        productId: detail.productId,
        productDetailId: detail.id,
        fromTenantId: sourceTenantId,
        toTenantId: destination.tenantId,
        toWarehouseId: dto.toWarehouseId,
        tenantId: sourceTenantId,
      },
    });
  }
  async warehouseSummary() {
  const data = await this.prisma.productDetail.groupBy({
    by: ["warehouseId"],
    _count: {
      id: true,
    },
  });

  const warehouses = await this.prisma.warehouse.findMany();

  return data.map((item) => {
    const warehouse = warehouses.find(
      (w) => w.id === item.warehouseId,
    );

    return {
      warehouseId: item.warehouseId,
      warehouseName: warehouse?.name,
      total: item._count.id,
    };
  });
}
  constructor(private prisma: PrismaService) {}

  findAll() {
  return this.prisma.productDetail.findMany({
    include: {
      product: true,
      owner: true,
      warehouse: true,
    },
    orderBy: {
      id: "desc",
    },
  });
}

  async create(dto: CreateInventoryDto) {
    const existing = await this.prisma.productDetail.findFirst({
      where: {
        productId: dto.productId,
        serialNumber: dto.serialNumber,
      },
    });

    if (existing) {
      throw new BadRequestException("Số hiệu đã tồn tại vui lòng nhập lại");
    }

    return this.prisma.productDetail.create({
      data: {
        serialNumber: dto.serialNumber,

        status: dto.status || "IN_STOCK",

        accessory: dto.accessory,

        equipment: dto.equipment,

        militaryEquipment: dto.militaryEquipment,

        importOrder: dto.importOrder,

        product: {
          connect: {
            id: dto.productId,
          },
        },

        warehouse: {
          connect: {
            id: dto.warehouseId,
          },
        },
      },
    });
  }

  async importFromExcel(rows: ImportInventoryItemDto[]) {
    const results: any[] = [];

    for (const row of rows) {
      if (!row.serialNumber) {
        continue;
      }

      let productId = row.productId;
      if (!productId && row.productName) {
        const product = await this.prisma.product.findFirst({
          where: { name: { equals: row.productName, mode: "insensitive" } },
        });
        productId = product?.id;
      }

      let warehouseId = row.warehouseId;
      if (!warehouseId && row.warehouseName) {
        const warehouse = await this.prisma.warehouse.findFirst({
          where: { name: { equals: row.warehouseName, mode: "insensitive" } },
        });
        warehouseId = warehouse?.id;
      }

      if (!productId || !warehouseId) {
        continue;
      }

      const created = await this.prisma.productDetail.create({
        data: {
          serialNumber: row.serialNumber,
          accessory: row.accessory,
          equipment: row.equipment,
          militaryEquipment: row.militaryEquipment,
          importOrder: row.importOrder,
          status: row.status || "IN_STOCK",
          product: { connect: { id: productId } },
          warehouse: { connect: { id: warehouseId } },
        },
      });

      results.push(created);
    }

    return results;
  }

  async update(id: number, dto: UpdateInventoryDto) {
    const existingRecord = await this.prisma.productDetail.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new BadRequestException("Bản ghi không tồn tại");
    }

    const productId = dto.productId ?? existingRecord.productId;
    const serialNumber = dto.serialNumber ?? existingRecord.serialNumber;

    if (productId && serialNumber) {
      const duplicate = await this.prisma.productDetail.findFirst({
        where: {
          productId,
          serialNumber,
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        throw new BadRequestException("Số hiệu đã tồn tại vui lòng nhập lại");
      }
    }

    const data: any = {
      serialNumber: dto.serialNumber,
      accessory: dto.accessory,
      equipment: dto.equipment,
      militaryEquipment: dto.militaryEquipment,
      importOrder: dto.importOrder,
      status: dto.status,
    };

    if (dto.productId !== undefined) {
      data.product = {
        connect: {
          id: dto.productId,
        },
      };
    }

    if (dto.warehouseId !== undefined) {
      data.warehouse = {
        connect: {
          id: dto.warehouseId,
        },
      };
    }

    return this.prisma.productDetail.update({
      where: { id },
      data,
      include: {
        product: true,
        owner: true,
        warehouse: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.productDetail.delete({
      where: {
        id,
      },
    });
  }
}