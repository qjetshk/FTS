import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { QUEUE_EMAIL } from 'src/queue/queue.constants';

// a***@gmail.com — адрес в логах без полного раскрытия
const maskEmail = (email: string) => email.replace(/^(.).*(@.*)$/, '$1***$2');

@Injectable()
export class EmailProducerService {
  private readonly logger = new Logger(EmailProducerService.name);

  constructor(@InjectQueue(QUEUE_EMAIL) private readonly queue: Queue) {}

  async sendWelcome(to: string) {
    await this.enqueue('welcome', { to });
  }

  // код живёт 10 мин — долгие ретраи бессмысленны, поэтому свои attempts
  async sendLoginCode(to: string, code: string) {
    await this.enqueue('login-code', { to, code }, { attempts: 3, backoff: { type: 'fixed', delay: 5_000 } });
  }

  private async enqueue<T extends { to: string }>(name: string, data: T, opts?: JobsOptions) {
    const job = await this.queue.add(name, data, opts);
    this.logger.log(`Enqueued: id=${job.id} type=${name} to=${maskEmail(data.to)}`);
  }
}
