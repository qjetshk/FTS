import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { StatformService } from './statform.service';
import { StatformFileService } from './statform-file.service';
import { StatformController } from './statform.controller';
import { StatformProducer } from './statform.producer';
import { StatformProcessor } from './statform.processor';
import { StatformCron } from './statform.cron';
import { CbrService } from './cbr.service';
import { RunEventsService } from './run-events.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { QUEUE_STATFORM } from '../queue/queue.constants';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_STATFORM }), NotificationModule],
  controllers: [StatformController],
  providers: [
    StatformService,
    StatformFileService,
    StatformProducer,
    StatformProcessor,
    StatformCron,
    CbrService,
    RunEventsService,
    ApiKeyGuard,
    JwtAuthGuard,
  ],
})
export class StatformModule {}
