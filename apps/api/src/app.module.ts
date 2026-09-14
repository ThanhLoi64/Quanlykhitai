import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

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
import { LogModule } from './log/log.module';
import { AmmunitionModule } from './ammunition/ammunition.module';
import { TenantContextInterceptor } from './prisma/tenant-context.interceptor';



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
    RepairModule,
    LogModule,
    AmmunitionModule
  ],

  controllers: [],

  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule {}