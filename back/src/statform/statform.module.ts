import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { StatformService } from './statform.service';
import { StatformController } from './statform.controller';
import { StatformProducer } from './statform.producer';
import { StatformProcessor } from './statform.processor';
import { StatformCron } from './statform.cron';
import { CbrService } from './cbr.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { QUEUE_STATFORM } from '../queue/queue.constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_STATFORM })],
  controllers: [StatformController],
  providers: [StatformService, StatformProducer, StatformProcessor, StatformCron, CbrService, ApiKeyGuard, JwtAuthGuard],
})
export class StatformModule {}
