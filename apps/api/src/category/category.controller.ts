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

import { CategoryService } from './category.service';
import { LogService } from '../log/log.service';

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
    private readonly categoryService: CategoryService,
    private readonly logService: LogService,
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
@Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
async create(
  @Req() req:any,
  @Body() dto:CreateCategoryDto
){
  const created = await this.categoryService.create(dto);

  await this.logService.create(req.user, 'Thêm danh mục', `Tên: ${dto.name}`);

  return created;

}





  // Chỉ ADMIN sửa

 @Patch(':id')
@UseGuards(
  JwtAuthGuard,
  RolesGuard
)
@Roles('SYSADMIN', 'ADMIN', 'STAFF', 'USER')
async update(

  @Req() req:any,
  @Param('id') id:string,

  @Body() dto:UpdateCategoryDto

){

  const updated = await this.categoryService.update(
    Number(id),
    dto
  );

  await this.logService.create(req.user, 'Cập nhật danh mục', `id: ${id} | Tên: ${dto.name}`);

  return updated;

}





  // Chỉ ADMIN xóa

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
    const removed = await this.categoryService.remove(
      Number(id)
    );

    await this.logService.create(req.user, 'Xóa danh mục', `Tên: ${removed.name}`);

    return removed;

  }


}