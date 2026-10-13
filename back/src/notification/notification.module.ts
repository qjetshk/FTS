import { Module } from '@nestjs/common';
import { EmailProducerModule } from 'src/email-producer/email-producer.module';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TelegramModule } from 'src/telegram/telegram.module';
import { StatformFileService } from 'src/statform/statform-file.service';

@Module({
  imports: [EmailProducerModule, TelegramModule],
  controllers: [NotificationController],
  providers: [NotificationService, StatformFileService, ApiKeyGuard],
  exports: [NotificationService],
})
export class NotificationModule {}
