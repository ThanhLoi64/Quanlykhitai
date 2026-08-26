import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantContextInterceptor } from './tenant-context.interceptor';

@Global()
@Module({
  providers: [PrismaService, TenantContextInterceptor],
  exports: [PrismaService],
})
export class PrismaModule {}