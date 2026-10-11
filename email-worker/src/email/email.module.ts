import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './email.types';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';
import { BackApiClient } from './back-api.client';

@Module({
  imports: [
    BullModule.registerQueue({ name: EMAIL_QUEUE }),
  ],
  providers: [EmailProcessor, EmailService, BackApiClient],
})
export class EmailModule {}
