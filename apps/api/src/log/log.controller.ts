import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
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

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteAll(
    @Req() req: any,
    @Body() body: { confirmationText?: string; password?: string },
  ) {
    const confirmationText = body?.confirmationText?.trim().toLowerCase();

    if (confirmationText !== 'xác nhận xóa nhật ký') {
      throw new BadRequestException('Vui lòng nhập đúng dòng xác nhận');
    }

    return this.logService.deleteAllWithPassword(req.user.username, body.password ?? '');
  }
}
