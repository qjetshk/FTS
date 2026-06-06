import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_EMAIL } from 'src/queue/queue.constants';
import { EmailProducerService } from './email-producer.service';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_EMAIL })],
  providers: [EmailProducerService],
  exports: [EmailProducerService],
})
export class EmailProducerModule {}
