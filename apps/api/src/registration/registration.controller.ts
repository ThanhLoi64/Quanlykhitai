import { Controller, Post, Get, Body, Patch, Delete, Param, ParseIntPipe } from '@nestjs/common';

import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()
@ApiTags("Registrations")
@Controller('registrations')
export class RegistrationController {


constructor(
private readonly service: RegistrationService
){}



@Get()
findAll(){

return this.service.findAll();

}



@Post()
create(
@Body() dto:CreateRegistrationDto
){

return this.service.create(dto);

}

@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: Partial<CreateRegistrationDto>,
) {
  return this.service.update(id, dto);
}

@Delete(':id')
remove(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.service.remove(id);
}


}