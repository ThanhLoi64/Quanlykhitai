import { Module } from '@nestjs/common';
import { RepairService } from './repair.service';
import { RepairController } from './repair.controller';

@Module({
  controllers: [RepairController],
  providers: [RepairService],
})
export class RepairModule {}
