import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Injectable()
export class ProductService {


  constructor(
    private prisma: PrismaService
  ){}



  // lấy danh sách sản phẩm

  findAll(){

    return this.prisma.product.findMany({

      include:{
        category:true,
        details:true
      }

    });

  }




  // lấy chi tiết sản phẩm

  findOne(id: number) {
  return this.prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      details: {
        include: {
          owner: true,
        },
      },
    },
  });
}

async getDetails(id:number){


return this.prisma.productDetail.findMany({

where:{


productId:id,


status:"AVAILABLE"


}


});


}


  // tạo sản phẩm

  create(dto:CreateProductDto){

    return this.prisma.product.create({

      data:{


        name:dto.name,

        unit:dto.unit,

        // nếu schema có classification thì giữ
        classification:dto.classification,

        quantity:dto.quantity,

        storageLocation:dto.storageLocation,

        note:dto.note,


        category:{
          connect:{
            id:dto.categoryId
          }
        },


       details: dto.detail
?
{
  create:[
    dto.detail
  ]
}
:
undefined


      },


      include:{
        category:true,
        details:true
      }


    });


  }




  // cập nhật

  update(
    id:number,
    dto:UpdateProductDto
  ){


    return this.prisma.product.update({

      where:{
        id
      },


      data:{


        name:dto.name,

        unit:dto.unit,

        classification:dto.classification,

        quantity:dto.quantity,

        storageLocation:dto.storageLocation,

        note:dto.note,


      },


      include:{
        category:true,
        details:true
      }


    });


  }





  // xóa

  remove(id:number){


    return this.prisma.product.delete({

      where:{
        id
      }

    });


  }


}