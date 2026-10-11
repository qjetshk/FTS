import { Module } from '@nestjs/common';
import { EmailProducerModule } from 'src/email-producer/email-producer.module';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [EmailProducerModule],
  controllers: [NotificationController],
  providers: [NotificationService, ApiKeyGuard],
  exports: [NotificationService],
})
export class NotificationModule {}
