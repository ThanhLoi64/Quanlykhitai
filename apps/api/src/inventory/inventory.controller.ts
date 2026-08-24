import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ImportInventoryItemDto } from './dto/import-inventory.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogService } from '../log/log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTransferDto } from './dto/create-transfer.dto';

@ApiBearerAuth()
@ApiTags('Inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly service: InventoryService,
    private readonly logService: LogService,
  ) {}

  @Get('warehouse-summary')
  warehouseSummary() {
    return this.service.warehouseSummary();
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('transfer/options')
  transferOptions() {
    return this.service.transferOptions();
  }

  @Get('transfer/incoming')
  incomingTransfers() {
    return this.service.incomingTransfers();
  }

  @Post('transfer')
  async createTransfer(@Req() req: any, @Body() dto: CreateTransferDto) {
    const transfer = await this.service.createTransfer(dto);
    await this.logService.create(req.user, 'Tạo phiếu xuất kho', {
      productDetailId: dto.productDetailId,
      toWarehouseId: dto.toWarehouseId,
    });
    return transfer;
  }

  @Patch('transfer/:id/respond')
  respondToTransfer(
    @Param('id') id: string,
    @Body() body: { accepted?: boolean },
  ) {
    return this.service.respondToTransfer(Number(id), body.accepted === true);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateInventoryDto) {
    const created = await this.service.create(dto);
    await this.logService.create(req.user, 'Nhập kho', {
      productId: created.productId,
      serialNumber: created.serialNumber,
      warehouseId: created.warehouseId,

    });
    return created;
  }

  @Post('import')
  async import(@Req() req: any, @Body() rows: ImportInventoryItemDto[]) {
    const result = await this.service.importFromExcel(rows);
    await this.logService.create(req.user, 'Import kho', {
      count: rows.length,
      createdIds: result.map((item: any) => item.id),
    });
    return result;
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    const updated = await this.service.update(+id, dto);

    await this.logService.create(
      req.user,
      'Cập nhật kho',
      `Sản phẩm: "${updated.product.name}" | Serial: "${updated.serialNumber}" | Kho: "${updated.warehouse?.name ?? 'Chưa có'}"`,
    );
    return updated;
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const removed = await this.service.remove(+id);
    await this.logService.create(req.user, 'Xóa kho', `ID kho: ${id}`);
    return removed;
  }
}
