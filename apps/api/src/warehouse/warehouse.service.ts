import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.warehouse.findMany({
      orderBy: {
        id: "desc",
      },
    });
  }

  create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: dto,
    });
  }

  update(id: number, dto: UpdateWarehouseDto) {
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.warehouse.delete({
      where: { id },
    });
  }
}