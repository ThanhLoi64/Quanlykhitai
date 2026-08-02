import {
Controller,
Get,
Post,
Delete,
Body,
Param,
Patch
} from '@nestjs/common';

import { OwnerService } from './owner.service';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()
@ApiTags("Owners")
@Controller('owners')
export class OwnerController {


constructor(
private readonly service:OwnerService
){}



@Get()
findAll(){

return this.service.findAll();

}



@Post()
create(
@Body() body:any
){

return this.service.create(body);

}
@Delete(':id')
remove(
 @Param('id') id:string
){

 return this.service.remove(
   Number(id)
 );

}
@Patch(":id")
update(
  @Param("id") id:string,
  @Body() dto:UpdateOwnerDto
){

  return this.service.update(
    Number(id),
    dto
  );

}
  @Post("import")
  import(
    @Body() owners: CreateOwnerDto[]
  ){

    return this.service.import(owners);

  }

}