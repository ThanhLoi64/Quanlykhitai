import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AmmunitionService } from './ammunition.service';
import { CreateAmmunitionDto } from './dto/create-ammunition.dto';
import { UpdateAmmunitionDto } from './dto/update-ammunition.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('Ammunition')
@Controller('ammunition')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AmmunitionController {
  constructor(private readonly service: AmmunitionService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
  create(@Body() dto: CreateAmmunitionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
  update(@Param('id') id: string, @Body() dto: UpdateAmmunitionDto) {
    return this.service.update(Number(id), dto);
  }

  @Post(':id/export')
  @Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
  exportQuantity(@Param('id') id: string, @Body() body: { quantity?: number }) {
    return this.service.exportQuantity(Number(id), Number(body.quantity));
  }

  @Delete(':id')
  @Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
