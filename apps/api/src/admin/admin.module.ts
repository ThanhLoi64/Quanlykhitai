import { Module } from '@nestjs/common';
import { AdminAccountsService } from './admin-accounts.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminAccountsService],
})
export class AdminModule {}