import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OwnerService } from './owner.service';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogService } from '../log/log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';


@ApiBearerAuth()
@ApiTags('Owners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('owners')
export class OwnerController {
  constructor(
    private readonly service: OwnerService,
    private readonly logService: LogService,
  ) {}



@Get()
findAll(){

return this.service.findAll();

}



@Post()
async create(
  @Req() req: any,
  @Body() body: any,
){
  const created = await this.service.create(body);
  await this.logService.create(req.user, 'Thêm quân nhân', `Họ tên: ${created.fullName}`);
  return created;
}

@Delete(':id')
async remove(
  @Req() req: any,
  @Param('id') id:string
){
  const removed = await this.service.remove(
    Number(id)
  );
  await this.logService.create(req.user, 'Xóa quân nhân', `ID: ${removed.id} - ${removed.fullName}`);
  return removed;
}

@Patch(":id")
async update(
  @Req() req: any,
  @Param("id") id:string,
  @Body() dto:UpdateOwnerDto
){
  const updated = await this.service.update(
    Number(id),
    dto
  );
  await this.logService.create(req.user, 'Cập nhật quân nhân', `Họ tên: ${updated.fullName}`);
  return updated;
}

@Post("import")
async import(
  @Req() req: any,
  @Body() owners: CreateOwnerDto[]
){
  const result = await this.service.import(owners);
  await this.logService.create(req.user, 'Import quân nhân', `Số lượng: ${owners.length}`);
  return result;
}

}