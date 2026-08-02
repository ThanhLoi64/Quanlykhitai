import { Injectable } from '@nestjs/common';
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

return this.prisma.category.create({

data:{
 name:dto.name,
 description:dto.description
}

});

}



// sửa

update(
  id:number,
  dto:UpdateCategoryDto
){

  return this.prisma.category.update({

    where:{
      id
    },

    data:{
      name:dto.name,
      description:dto.description
    }

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