import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmmunitionDto } from './dto/create-ammunition.dto';
import { UpdateAmmunitionDto } from './dto/update-ammunition.dto';

@Injectable()
export class AmmunitionService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.ammunition.findMany({
      include: { product: { include: { category: true } }, warehouse: true },
      orderBy: { id: 'desc' },
    });
  }

  private validateNumbers(dto: CreateAmmunitionDto | UpdateAmmunitionDto) {
    if (dto.quantity !== undefined && (!Number.isInteger(Number(dto.quantity)) || Number(dto.quantity) < 0)) {
      throw new BadRequestException('Số lượng đạn phải là số nguyên không âm');
    }
    if (dto.productionYear !== undefined && (!Number.isInteger(Number(dto.productionYear)) || Number(dto.productionYear) < 1900)) {
      throw new BadRequestException('Năm sản xuất không hợp lệ');
    }
  }

  private async ensureProduct(productId: number) {
    const product = await this.prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) throw new BadRequestException('Loại đạn không tồn tại trong danh sách thống kê vũ khí');
    return product;
  }

  private async ensureWarehouse(warehouseId?: number) {
    if (warehouseId === undefined || warehouseId === null) return;
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: Number(warehouseId) } });
    if (!warehouse) throw new BadRequestException('Đầu mối không tồn tại');
  }

  async create(dto: CreateAmmunitionDto) {
    this.validateNumbers(dto);
    await this.ensureProduct(dto.productId);
    await this.ensureWarehouse(dto.warehouseId);
    return this.prisma.ammunition.create({
      data: {
        productId: Number(dto.productId),
        warehouseId: dto.warehouseId ? Number(dto.warehouseId) : null,
        batch: dto.batch.trim(),
        unit: dto.unit.trim(),
        quantity: Number(dto.quantity),
        productionYear: Number(dto.productionYear),
      },
      include: { product: true },
    });
  }

  async update(id: number, dto: UpdateAmmunitionDto) {
    this.validateNumbers(dto);
    if (dto.productId !== undefined) await this.ensureProduct(dto.productId);
    if (dto.warehouseId !== undefined) await this.ensureWarehouse(dto.warehouseId);
    return this.prisma.ammunition.update({
      where: { id },
      data: {
        ...(dto.productId !== undefined ? { productId: Number(dto.productId) } : {}),
        ...(dto.warehouseId !== undefined ? { warehouseId: dto.warehouseId ? Number(dto.warehouseId) : null } : {}),
        ...(dto.batch !== undefined ? { batch: dto.batch.trim() } : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit.trim() } : {}),
        ...(dto.quantity !== undefined ? { quantity: Number(dto.quantity) } : {}),
        ...(dto.productionYear !== undefined ? { productionYear: Number(dto.productionYear) } : {}),
      },
      include: { product: true, warehouse: true },
    });
  }

  async exportQuantity(id: number, quantity: number) {
    const requestedQuantity = Number(quantity);
    if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
      throw new BadRequestException('Số lượng xuất phải là số nguyên lớn hơn 0');
    }

    const item = await this.prisma.ammunition.findUnique({ where: { id } });
    if (!item) throw new BadRequestException('Lô đạn không tồn tại');
    if (item.quantity < requestedQuantity) {
      throw new BadRequestException(`Tồn kho chỉ còn ${item.quantity} ${item.unit}`);
    }

    return this.prisma.ammunition.update({
      where: { id },
      data: { quantity: { decrement: requestedQuantity } },
      include: { product: true },
    });
  }

  remove(id: number) {
    return this.prisma.ammunition.delete({ where: { id } });
  }
}
