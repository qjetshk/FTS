import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { QUEUE_CLASSIFY, QUEUE_EMAIL, QUEUE_STATFORM } from 'src/queue/queue.constants';
import { TelegramService } from './telegram.service';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramAdminService } from './telegram-admin.service';
import { TelegramController } from './telegram.controller';

@Module({
  // очереди — только для админской команды /queues
  imports: [BullModule.registerQueue({ name: QUEUE_STATFORM }, { name: QUEUE_CLASSIFY }, { name: QUEUE_EMAIL })],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramLinkService, TelegramAdminService, ApiKeyGuard],
  exports: [TelegramService],
})
export class TelegramModule {}
