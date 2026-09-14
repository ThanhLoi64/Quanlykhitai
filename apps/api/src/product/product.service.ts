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

  async create(dto:CreateProductDto, image?: any){
    const uploadedImage = image ? await this.uploadImage(image) : undefined;

    return this.prisma.product.create({

      data:{


        name:dto.name,

        unit:dto.unit,

        // nếu schema có classification thì giữ
        classification:dto.classification,

        quantity: 0,

        storageLocation:dto.storageLocation,

        note:dto.note,

        origin:dto.origin,
        usageHistory:dto.usageHistory,
        documents:dto.documents,

        image: uploadedImage?.url,
        imageFileId: uploadedImage?.fileId,


        category:{
          connect:{
            id:Number(dto.categoryId)
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
    dto:UpdateProductDto,
    image?: any,
  ){
    return this.updateWithImage(id, dto, image);
  }

  private async updateWithImage(id: number, dto: UpdateProductDto, image?: any) {
    const uploadedImage = image ? await this.uploadImage(image) : undefined;

    return this.prisma.product.update({

      where:{
        id
      },


      data:{


        name:dto.name,

        unit:dto.unit,

        classification:dto.classification,

        storageLocation:dto.storageLocation,

        note:dto.note,

        origin:dto.origin,
        usageHistory:dto.usageHistory,
        documents:dto.documents,

        ...(uploadedImage
          ? { image: uploadedImage.url, imageFileId: uploadedImage.fileId }
          : {}),


      },


      include:{
        category:true,
        details:true
      }


    });


  }

  private async uploadImage(image: any): Promise<{ url: string; fileId: string }> {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) throw new Error('IMAGEKIT_PRIVATE_KEY chưa được cấu hình');

    const form = new FormData();
    form.append('file', new Blob([image.buffer], { type: image.mimetype }), image.originalname);
    form.append('fileName', `${Date.now()}-${image.originalname}`);
    form.append('folder', '/quan-ly-khi-tai/products');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`ImageKit upload failed: ${await response.text()}`);
    }

    const result = await response.json() as { url: string; fileId: string };
    return { url: result.url, fileId: result.fileId };
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