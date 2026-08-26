import {
Controller,
Get,
Post,
Patch,
Delete,
Body,
Param,
Req,
UseGuards
} from '@nestjs/common';


import { ProductService } from './product.service';
import { LogService } from '../log/log.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';




@ApiBearerAuth()
@ApiTags("Products")
@Controller('products')
export class ProductController {


constructor(
private productService:ProductService,
private readonly logService: LogService,
){}



@Get()
@UseGuards(
JwtAuthGuard,
RolesGuard
)
findAll(){

return this.productService.findAll();

}




@Get(':id')
@UseGuards(
JwtAuthGuard,
RolesGuard
)
findOne(
@Param('id') id:string
){

return this.productService.findOne(
Number(id)
);

}


@Get(':id/details')
getDetails(
 @Param('id') id:string
){

 return this.productService.getDetails(
   Number(id)
 );

}

@Post()
@UseGuards(
JwtAuthGuard,
RolesGuard
)
@Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
async create(
@Req() req:any,
@Body() dto:CreateProductDto
){
  const created = await this.productService.create(dto);
  await this.logService.create(req.user, 'Thêm vũ khí mới', {
    id: created.id,
    name: dto.name,
    unit: dto.unit,
  });
  return created;
}




@Patch(':id')
@UseGuards(
JwtAuthGuard,
RolesGuard
)
@Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
async update(
@Req() req:any,
@Param('id') id:string,

@Body() dto:UpdateProductDto

){
  const updated = await this.productService.update(
    Number(id),
    dto,
  );
  await this.logService.create(req.user, 'Cập nhật vũ khí', {
    id: updated.id,
    field: dto.name ? 'name' : 'other',
    value: dto.name || updated.name,
    unit: updated.unit,
  });
  return updated;
}




@Delete(':id')
@UseGuards(
  JwtAuthGuard,
  RolesGuard
)
@Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
async remove(
  @Req() req:any,
  @Param('id') id:string
){
  const removed = await this.productService.remove(
    Number(id)
  );
  await this.logService.create(req.user, 'Xóa vũ khí', {
    id: Number(id),
    name: removed.name,
  });
  return removed;
}

@Get('test')
test(){
 return {
   server:'OK'
 }
}
}