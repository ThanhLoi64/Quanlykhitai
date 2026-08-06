import { Controller, Post, Get, Body, Patch, Delete, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';

import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogService } from '../log/log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';


@ApiBearerAuth()
@ApiTags('Registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('registrations')
export class RegistrationController {
  constructor(
    private readonly service: RegistrationService,
    private readonly logService: LogService,
  ) {}


@Get()
findAll(){

return this.service.findAll();

}



@Post()
async create(
  @Req() req: any,
  @Body() dto: CreateRegistrationDto
){
  const created = await this.service.create(dto);
  await this.logService.create(req.user, 'Thêm đăng ký', `Owner ID: ${dto.ownerId}`);
  return created;
}

@Patch(':id')
async update(
  @Req() req: any,
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: Partial<CreateRegistrationDto>,
) {
  const updated = await this.service.update(id, dto);
  await this.logService.create(req.user, 'Cập nhật đăng ký', `ID đăng ký: ${id}`);
  return updated;
}

@Delete(':id')
async remove(
  @Req() req: any,
  @Param('id', ParseIntPipe) id: number,
) {
  const removed = await this.service.remove(id);
  await this.logService.create(req.user, 'Xóa đăng ký', `ID đăng ký: ${id}`);
  return removed;
}


}