import { Body, Controller, Post, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateChildAccountDto } from './dto/create-child-account.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags("Auth")
@ApiBearerAuth()
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) {}


  @Post('login')
  login(
    @Body() dto: LoginDto
  ) {
    return this.authService.login(
      dto.username,
      dto.password
    );

  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: any,
    @Body() body: { currentPassword?: unknown; newPassword?: unknown },
  ) {
    return this.authService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Get('child-weapon-summary')
  @UseGuards(JwtAuthGuard)
  childWeaponSummary(@Req() req: any) {
    return this.authService.getChildWeaponSummary(req.user);
  }

  @Patch('child-weapon-summary/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSADMIN')
  reorderChildWeaponSummary(@Req() req: any, @Body() body: { tenantIds: number[] }) {
    return this.authService.reorderChildTenants(req.user, body?.tenantIds);
  }

  @Get('child-accounts')
  @UseGuards(JwtAuthGuard)
  childAccounts(@Req() req: any) {
    return this.authService.getChildAccounts(req.user);
  }

  @Post('child-accounts')
  @UseGuards(JwtAuthGuard)
  createChildAccount(@Req() req: any, @Body() dto: CreateChildAccountDto) {
    return this.authService.createChildAccount(req.user, dto);
  }

}