import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";

@Injectable()
export class InventoryService {
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

  create(dto: CreateInventoryDto) {
  return this.prisma.productDetail.create({
    data: {
      serialNumber: dto.serialNumber,

      status: dto.status || "IN_STOCK",

      accessory: dto.accessory,

      equipment: dto.equipment,

      militaryEquipment: dto.militaryEquipment,

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

  update(id: number, dto: UpdateInventoryDto) {
    const data: any = {
      serialNumber: dto.serialNumber,
      accessory: dto.accessory,
      equipment: dto.equipment,
      militaryEquipment: dto.militaryEquipment,
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