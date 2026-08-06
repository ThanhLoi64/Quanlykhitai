import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LogController } from './log.controller';
import { LogService } from './log.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
