import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateChildAccountDto } from './dto/create-child-account.dto';

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

    console.log("LOGIN CONTROLLER:", dto);

    return this.authService.login(
      dto.username,
      dto.password
    );

  }

  @Get('child-weapon-summary')
  @UseGuards(JwtAuthGuard)
  childWeaponSummary(@Req() req: any) {
    return this.authService.getChildWeaponSummary(req.user);
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