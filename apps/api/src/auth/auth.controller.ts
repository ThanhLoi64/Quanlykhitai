import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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

}