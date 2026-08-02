import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateRegistrationDto } from './registration/dto/create-registration.dto';
import { RegistrationService } from './registration/registration.service';

@Controller('registrations')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
  ) {}

  @Get()
  findAll() {
    return this.registrationService.findAll();
  }

  @Post()
  create(@Body() dto: CreateRegistrationDto) {
    return this.registrationService.create(dto);
  }
}
