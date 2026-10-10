import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_EMAIL } from 'src/queue/queue.constants';
import { EmailProducerService } from './email-producer.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_EMAIL,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 10_000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
  ],
  providers: [EmailProducerService],
  exports: [EmailProducerService],
})
export class EmailProducerModule {}
