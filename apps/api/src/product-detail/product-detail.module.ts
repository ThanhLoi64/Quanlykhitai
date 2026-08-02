import { Module } from '@nestjs/common';
import { ProductDetailController } from './product-detail.controller';
import { ProductDetailService } from './product-detail.service';
import { PrismaService } from '../prisma/prisma.service';


@Module({

controllers:[
 ProductDetailController
],


providers:[
 ProductDetailService,
 PrismaService
]


})
export class ProductDetailModule{}