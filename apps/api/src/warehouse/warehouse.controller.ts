import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogService } from '../log/log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiBearerAuth()
@ApiTags('Warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouses')
export class WarehouseController {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly logService: LogService,
  ) {}

  @Get()
  findAll() {
    return this.warehouseService.findAll();
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateWarehouseDto) {
    const created = await this.warehouseService.create(dto);
    await this.logService.create(req.user, 'Thêm kho', `Tên kho: ${created.name}`);
    return created;
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    const updated = await this.warehouseService.update(Number(id), dto);
    await this.logService.create(req.user, 'Cập nhật kho', `ID kho: ${id}`);
    return updated;
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const removed = await this.warehouseService.remove(Number(id));
    await this.logService.create(req.user, 'Xóa kho', `ID kho: ${id}`);
    return removed;
  }
}