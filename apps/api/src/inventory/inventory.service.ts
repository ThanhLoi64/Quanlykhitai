import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { ImportInventoryItemDto } from "./dto/import-inventory.dto";
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class InventoryService {
  async incomingTransfers(user: { id: number }) {
    const tenantId = this.prisma.getCurrentTenantId();
    if (!tenantId) throw new BadRequestException('Tenant không hợp lệ');

    return this.prisma.runWithoutTenant(() =>
      this.prisma.transfer.findMany({
        where: { approvalUserId: user.id, status: 'PENDING' },
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
        const recipients = await this.prisma.user.findMany({
          where: { tenantId: { in: [...new Set(transfers.map((transfer) => transfer.toTenantId))] } },
          select: { id: true, username: true },
        });
        return transfers.map((transfer) => ({
          ...transfer,
          fromUsername: senders.find((sender) => sender.tenantId === transfer.fromTenantId)?.username,
          toUsername: recipients.find((recipient) => recipient.id === (transfer as typeof transfer & { toUserId?: number }).toUserId)?.username,
        }));
      }),
    );
  }

  async outgoingTransfers() {
    const tenantId = this.prisma.getCurrentTenantId();
    if (!tenantId) throw new BadRequestException('Tenant không hợp lệ');

    const transfers = await this.prisma.transfer.findMany({
      where: { fromTenantId: tenantId },
      include: {
        product: { select: { name: true, unit: true } },
        productDetail: { select: { serialNumber: true, warehouse: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.prisma.runWithoutTenant(async () => {
      const userIds = transfers.flatMap((transfer) => {
        const transferData = transfer as typeof transfer & { approvalUserId: number; toUserId?: number };
        return [transferData.approvalUserId, transferData.toUserId];
      }).filter(Boolean) as number[];
      const warehouseIds = transfers.map((transfer) => transfer.toWarehouseId);
      const [users, warehouses, sourceUser] = await Promise.all([
        this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, username: true } }),
        this.prisma.warehouse.findMany({ where: { id: { in: warehouseIds } }, select: { id: true, name: true } }),
        this.prisma.user.findFirst({ where: { tenantId, role: { not: UserRole.SYSADMIN } }, select: { username: true }, orderBy: { id: 'asc' } }),
      ]);
      return transfers.map((transfer) => ({
        ...transfer,
        fromUsername: sourceUser?.username,
        toUsername: users.find((user) => user.id === (transfer as typeof transfer & { toUserId?: number }).toUserId)?.username,
        approvalUsername: users.find((user) => user.id === (transfer as typeof transfer & { approvalUserId: number }).approvalUserId)?.username,
        fromWarehouseName: transfer.productDetail.warehouse?.name,
        toWarehouseName: warehouses.find((warehouse) => warehouse.id === transfer.toWarehouseId)?.name,
      }));
    });
  }

  async respondToTransfer(user: { id: number; tenantId: number }, id: number, accepted: boolean) {
    const tenantId = this.prisma.getCurrentTenantId();
    if (!tenantId) throw new BadRequestException('Tenant không hợp lệ');

    return this.prisma.runWithoutTenant(() =>
      this.prisma.$transaction(async (tx: any) => {
        const transfer = await tx.transfer.findFirst({
          where: { id, approvalUserId: user.id, approvalTenantId: tenantId, status: 'PENDING' },
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

        const destinationTenantId = transfer.toTenantId;

        let targetCategory = await tx.category.findFirst({
          where: {
            tenantId: destinationTenantId,
            name: { equals: sourceProduct.category.name, mode: 'insensitive' },
          },
        });
        if (!targetCategory) {
          targetCategory = await tx.category.create({
            data: {
              name: sourceProduct.category.name,
              description: sourceProduct.category.description,
              tenantId: destinationTenantId,
            },
          });
        }

        let targetProduct = await tx.product.findFirst({
          where: { tenantId: destinationTenantId, name: sourceProduct.name, categoryId: targetCategory.id },
        });
        if (!targetProduct) {
          targetProduct = await tx.product.create({
            data: {
              name: sourceProduct.name,
              unit: sourceProduct.unit,
              classification: sourceProduct.classification,
              quantity: 0,
              storageLocation: sourceProduct.storageLocation,
              note: sourceProduct.note,
              categoryId: targetCategory.id,
              tenantId: destinationTenantId,
            },
          });
        }

        await tx.productDetail.update({
          where: { id: transfer.productDetailId },
          data: {
            tenantId: destinationTenantId,
            productId: targetProduct.id,
            warehouseId: transfer.toWarehouseId,
          },
        });
        await tx.product.update({
          where: { id: transfer.productId },
          data: { quantity: { decrement: 1 } },
        });
        await tx.product.update({
          where: { id: targetProduct.id },
          data: { quantity: { increment: 1 } },
        });
        return tx.transfer.update({ where: { id }, data: { status: 'ACCEPTED' } });
      }),
    );
  }

  async deleteTransfer(user: { tenantId: number }, id: number) {
    const tenantId = this.prisma.getCurrentTenantId();
    if (!tenantId || tenantId !== user.tenantId) throw new BadRequestException('Tenant không hợp lệ');

    const transfer = await this.prisma.transfer.findFirst({
      where: { id, fromTenantId: tenantId },
      select: { id: true, status: true },
    });
    if (!transfer) throw new BadRequestException('Phiếu xuất kho không tồn tại');
    if (transfer.status === 'ACCEPTED') {
      throw new BadRequestException('Không thể xóa phiếu đã phê duyệt');
    }

    return this.prisma.transfer.delete({ where: { id } });
  }

  async transferOptions(user: { role: string }) {
    const sourceTenantId = this.prisma.getCurrentTenantId();
    if (!sourceTenantId) throw new BadRequestException('Tenant không hợp lệ');

    return this.prisma.runWithoutTenant(async () => {
      const approverRoles: Record<string, UserRole[]> = {
        ADMIN: [UserRole.SYSADMIN],
        STAFF: [UserRole.ADMIN],
        USER: [UserRole.STAFF],
      };
      const [users, warehouses, approvers] = await Promise.all([
        this.prisma.user.findMany({
          where: { isActive: true, tenantId: { not: sourceTenantId } },
          select: { id: true, tenantId: true, username: true, fullName: true },
          orderBy: { username: 'asc' },
        }),
        this.prisma.warehouse.findMany({
          select: { id: true, name: true, tenantId: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.user.findMany({
          where: { isActive: true, role: { in: approverRoles[user.role] || [] } },
          select: { id: true, tenantId: true, username: true, fullName: true, role: true },
          orderBy: { username: 'asc' },
        }),
      ]);

      return {
        recipients: users.map((user) => ({
          userId: user.id,
          tenantId: user.tenantId,
          username: user.username,
          fullName: user.fullName,
          warehouses: warehouses.filter((warehouse) => warehouse.tenantId === user.tenantId),
        })),
        approvers,
      };
    });
  }

  async createTransfer(user: { role: string }, dto: CreateTransferDto) {
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

    const approverRoles: Record<string, UserRole[]> = {
      ADMIN: [UserRole.SYSADMIN],
      STAFF: [UserRole.ADMIN],
      USER: [UserRole.STAFF],
    };
    const [recipient, approver] = await this.prisma.runWithoutTenant(() => Promise.all([
      this.prisma.user.findFirst({ where: { id: dto.toUserId, tenantId: destination.tenantId, isActive: true } }),
      this.prisma.user.findFirst({ where: { id: dto.approvalUserId, role: { in: approverRoles[user.role] || [] }, isActive: true } }),
    ]));
    if (!recipient) throw new BadRequestException('Tài khoản nhận không hợp lệ');
    if (!approver) throw new BadRequestException('Tài khoản phê duyệt phải thuộc cấp trên trực tiếp');

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
        toUserId: recipient.id,
        toWarehouseId: dto.toWarehouseId,
        approvalTenantId: approver.tenantId,
        approvalUserId: approver.id,
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
    const tenantId = this.prisma.getCurrentTenantId();
    if (!tenantId) throw new BadRequestException("Tenant không hợp lệ");

    const [product, warehouse] = await Promise.all([
      this.prisma.product.findUnique({ where: { id: dto.productId }, select: { id: true, tenantId: true } }),
      this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId }, select: { id: true, tenantId: true } }),
    ]);
    if (product?.tenantId !== tenantId) {
      throw new BadRequestException("Loại khí tài không thuộc đơn vị hiện tại");
    }
    if (warehouse?.tenantId !== tenantId) {
      throw new BadRequestException("Kho không thuộc đơn vị hiện tại");
    }

    const existing = await this.prisma.productDetail.findFirst({
      where: {
        productId: dto.productId,
        serialNumber: dto.serialNumber,
      },
    });

    if (existing) {
      throw new BadRequestException("Số hiệu đã tồn tại vui lòng nhập lại");
    }

    return this.prisma.$transaction(async (tx: any) => {
      const created = await tx.productDetail.create({
        data: {
        tenantId,
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
      await tx.product.update({
        where: { id: dto.productId },
        data: { quantity: { increment: 1 } },
      });
      return created;
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

      const tenantId = this.prisma.getCurrentTenantId();
      if (!tenantId) continue;
      const [product, warehouse] = await Promise.all([
        this.prisma.product.findUnique({ where: { id: productId }, select: { tenantId: true } }),
        this.prisma.warehouse.findUnique({ where: { id: warehouseId }, select: { tenantId: true } }),
      ]);
      if (product?.tenantId !== tenantId || warehouse?.tenantId !== tenantId) continue;

      const created = await this.prisma.productDetail.create({
        data: {
          tenantId,
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

      await this.prisma.product.update({
        where: { id: productId },
        data: { quantity: { increment: 1 } },
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

    const updated = await this.prisma.productDetail.update({
      where: { id },
      data,
      include: {
        product: true,
        owner: true,
        warehouse: true,
      },
    });

    if (dto.productId !== undefined && dto.productId !== existingRecord.productId) {
      await this.prisma.product.update({
        where: { id: existingRecord.productId },
        data: { quantity: { decrement: 1 } },
      });
      await this.prisma.product.update({
        where: { id: dto.productId },
        data: { quantity: { increment: 1 } },
      });
    }

    return updated;
  }

  async remove(id: number) {
    const detail = await this.prisma.productDetail.findUnique({
      where: { id },
      select: { productId: true },
    });
    if (!detail) throw new BadRequestException("Bản ghi không tồn tại");

    const removed = await this.prisma.productDetail.delete({
      where: {
        id,
      },
    });
    await this.prisma.product.update({
      where: { id: detail.productId },
      data: { quantity: { decrement: 1 } },
    });
    return removed;
  }
}