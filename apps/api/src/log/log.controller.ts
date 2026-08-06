import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { LogService } from './log.service';

@ApiBearerAuth()
@ApiTags('Logs')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Req() req: any) {
    return this.logService.findAll();
  }
}
