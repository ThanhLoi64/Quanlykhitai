import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RepairService } from './repair.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { LogService } from '../log/log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiBearerAuth()
@ApiTags('Repair')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('repairs')
export class RepairController {
  constructor(
    private readonly service: RepairService,
    private readonly logService: LogService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateRepairDto) {
    const created = await this.service.create(dto);
    await this.logService.create(req.user, 'Thêm sự cố sửa chữa', {
      productDetailId: created.productDetailId,
      productName: created.productDetail?.product?.name || null,
      cause: dto.cause || 'Không có',
      repairUnit: dto.repairUnit || null,
    });
    return created;
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRepairDto,
  ) {
    const updated = await this.service.update(id, dto);
    await this.logService.create(req.user, 'Cập nhật sửa chữa', {
      id,
      productDetailId: updated.productDetailId,
      productName: updated.productDetail?.product?.name || null,
      cause: updated.cause || null,
      repairUnit: updated.repairUnit || null,
    });
    return updated;
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const removed = await this.service.remove(id);
    await this.logService.create(req.user, 'Xóa sửa chữa', {
      id,
      productDetailId: removed?.productDetailId ?? null,
    });
    return removed;
  }
}
