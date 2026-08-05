import { Module } from '@nestjs/common';

import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { RegistrationModule } from './registration/registration.module';
import { OwnerModule } from './owner/owner.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductDetailModule } from './product-detail/product-detail.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { RepairModule } from './repair/repair.module';



@Module({
  imports: [
    AuthModule,
    PrismaModule,
    CategoryModule,
    ProductModule,
    RegistrationModule,
    OwnerModule,
    InventoryModule,
    ProductDetailModule,
    WarehouseModule,
    RepairModule
  ],

  controllers: [],

  providers: [
    AppService,
  ],
})
export class AppModule {}