import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, type EmailJobName, type EmailJobData } from './email.types';
import { EmailService } from './email.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData<EmailJobName>, void, EmailJobName>): Promise<void> {
    this.logger.debug(`processing job "${job.name}" id=${job.id}`);
    try {
      await this.emailService.send(job.name, job.data);
    } catch (err) {
      this.logger.error(`job "${job.name}" id=${job.id} failed: ${(err as Error).message}`);
      throw err;
    }
  }
}
