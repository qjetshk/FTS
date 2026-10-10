import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, type EmailJobName, type EmailJobData } from './email.types';
import { EmailService } from './email.service';
import { maskEmail } from './mask-email.util';

type EmailJob = Job<EmailJobData<EmailJobName>, void, EmailJobName>;

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: EmailJob): Promise<void> {
    const to = maskEmail(job.data.to);
    const attempt = `${job.attemptsMade + 1}/${job.opts.attempts ?? 1}`;

    this.logger.log(`Job received: id=${job.id} type=${job.name} to=${to} attempt=${attempt}`);
    await job.log(`attempt ${attempt}: sending "${job.name}" to ${to}`);

    const resendId = await this.emailService.send(job.name, job.data);

    this.logger.log(`Sent: id=${job.id} type=${job.name} to=${to} resendId=${resendId}`);
    await job.log(`sent, resend id=${resendId}`);
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.logger.log(`Worker ready, listening queue "${EMAIL_QUEUE}"`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: EmailJob | undefined, err: Error) {
    if (!job) {
      this.logger.error(`Job failed: ${err.message}`);
      return;
    }
    const attempts = job.opts.attempts ?? 1;
    const willRetry = job.attemptsMade < attempts;
    const msg = `Failed: id=${job.id} type=${job.name} to=${maskEmail(job.data.to)} attempt=${job.attemptsMade}/${attempts} — ${err.message}`;

    if (willRetry) this.logger.warn(`${msg} (will retry)`);
    else this.logger.error(`${msg} (giving up)`);
    await job.log(`attempt ${job.attemptsMade}/${attempts} failed: ${err.message}`);
  }

  @OnWorkerEvent('error')
  onError(err: Error) {
    this.logger.error(`Worker error: ${err.message}`);
  }
}
