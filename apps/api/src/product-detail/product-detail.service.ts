import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class ProductDetailService {


constructor(
 private prisma:PrismaService
){}



findAll(){

return this.prisma.productDetail.findMany({

where:{
 status:"AVAILABLE"
},


include:{


product:true


},


orderBy:{
 id:"desc"
}


});


}



}