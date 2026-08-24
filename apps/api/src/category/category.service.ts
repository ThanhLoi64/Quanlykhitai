import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Injectable()
export class CategoryService {


constructor(
 private prisma: PrismaService
){}



// lấy danh sách

findAll(){

return this.prisma.category.findMany({

orderBy:{
 id:'desc'
}

});

}



// lấy một

findOne(id:number){

return this.prisma.category.findUnique({

where:{
 id
}

});

}



// tạo

create(
dto:CreateCategoryDto
){
const name = dto.name.trim();

return this.prisma.category.findFirst({
  where: {
    name: { equals: name, mode: 'insensitive' },
  },
}).then((existing) => {
  if (existing) return existing;

  return this.prisma.category.create({

    data:{
      name,
      description:dto.description
    }

  });
});

}



// sửa

update(
  id:number,
  dto:UpdateCategoryDto
){
const name = dto.name?.trim();

return this.prisma.category.findFirst({
  where: {
    name: name ? { equals: name, mode: 'insensitive' } : undefined,
    NOT: { id },
  },
}).then((existing) => {
  if (existing) {
    throw new ConflictException('Tên danh mục đã tồn tại (không phân biệt hoa thường)');
  }

  return this.prisma.category.update({

    where:{
      id
    },

    data:{
      name,
      description:dto.description
    }

  });
});

}



// xóa

remove(id:number){

return this.prisma.category.delete({

where:{
 id
}

});

}


}