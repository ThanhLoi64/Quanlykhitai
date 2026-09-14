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
  transferOptions(@Req() req: any) {
    return this.service.transferOptions(req.user);
  }

  @Get('transfer/incoming')
  incomingTransfers(@Req() req: any) {
    return this.service.incomingTransfers(req.user);
  }

  @Get('transfer/outgoing')
  outgoingTransfers() {
    return this.service.outgoingTransfers();
  }

  @Post('transfer')
  async createTransfer(@Req() req: any, @Body() dto: CreateTransferDto) {
    const transfer = await this.service.createTransfer(req.user, dto);
    await this.logService.create(req.user, 'Tạo phiếu xuất kho', {
      productDetailId: dto.productDetailId,
      toWarehouseId: dto.toWarehouseId,
    });
    return transfer;
  }

  @Patch('transfer/:id/respond')
  respondToTransfer(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { accepted?: boolean },
  ) {
    return this.service.respondToTransfer(req.user, Number(id), body.accepted === true);
  }

  @Delete('transfer/:id')
  deleteTransfer(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteTransfer(req.user, Number(id));
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateInventoryDto) {
    const created = await this.service.create(dto);
    const createdItems = Array.isArray(created) ? created : [created];
    await this.logService.create(req.user, 'Nhập kho', {
      productId: createdItems[0]?.productId,
      serialNumbers: createdItems.map((item: any) => item.serialNumber),
      warehouseId: createdItems[0]?.warehouseId,

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
