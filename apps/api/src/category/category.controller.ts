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

import { CategoryService } from './category.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()
@ApiTags("Categories")
@Controller('categories')
export class CategoryController {


  constructor(
    private readonly categoryService: CategoryService
  ){}



  // ADMIN + STAFF xem danh sách

  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  findAll(){

    return this.categoryService.findAll();

  }




  // Chỉ ADMIN tạo

@Post()
@UseGuards(
  JwtAuthGuard,
  RolesGuard
)
@Roles('ADMIN')
create(
  @Body() dto:CreateCategoryDto
){

  console.log("BODY NHAN DUOC:", dto);

  return this.categoryService.create(dto);

}





  // Chỉ ADMIN sửa

 @Patch(':id')
@UseGuards(
  JwtAuthGuard,
  RolesGuard
)
@Roles('ADMIN')
update(

  @Param('id') id:string,

  @Body() dto:UpdateCategoryDto

){

  console.log("UPDATE ID:", id);
  console.log("UPDATE BODY:", dto);

  return this.categoryService.update(
    Number(id),
    dto
  );

}





  // Chỉ ADMIN xóa

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  @Roles('ADMIN')
  remove(
    @Param('id') id:string
  ){

    return this.categoryService.remove(
      Number(id)
    );

  }


}