import { Module } from '@nestjs/common';
import { AmmunitionController } from './ammunition.controller';
import { AmmunitionService } from './ammunition.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AmmunitionController],
  providers: [AmmunitionService],
})
export class AmmunitionModule {}
