import {
Controller,
Get,
Post,
Patch,
Delete,
Body,
Param,
UseGuards
} from '@nestjs/common';


import { ProductService } from './product.service';

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
private productService:ProductService
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
@Roles('ADMIN')
create(
@Body() dto:CreateProductDto
){

return this.productService.create(dto);

}




@Patch(':id')
@UseGuards(
JwtAuthGuard,
RolesGuard
)
@Roles('ADMIN')
update(

@Param('id') id:string,

@Body() dto:UpdateProductDto

){

return this.productService.update(
Number(id),
dto
);

}




@Delete(':id')
@UseGuards(
JwtAuthGuard,
RolesGuard
)
@Roles('ADMIN')
remove(
@Param('id') id:string
){

return this.productService.remove(
Number(id)
);

}

@Get("test")
test(){
 return {
   server:"OK"
 }
}
}