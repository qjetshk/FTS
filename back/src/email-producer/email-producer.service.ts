import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { QUEUE_EMAIL } from 'src/queue/queue.constants';

// a***@gmail.com — адрес в логах без полного раскрытия
const maskEmail = (email: string) => email.replace(/^(.).*(@.*)$/, '$1***$2');

export type EnqueueResult = { jobId?: string; deduplicated: boolean };

@Injectable()
export class EmailProducerService {
  private readonly logger = new Logger(EmailProducerService.name);

  constructor(@InjectQueue(QUEUE_EMAIL) private readonly queue: Queue) {}

  async sendWelcome(to: string) {
    await this.enqueue('welcome', { to });
  }

  // код живёт 10 мин — долгие ретраи бессмысленны, поэтому свои attempts
  async sendLoginCode(to: string, code: string) {
    // код в данных задачи — не храним его в Redis дольше, чем нужно для отправки
    await this.enqueue('login-code', { to, code }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5_000 },
      removeOnComplete: true,
      removeOnFail: { age: 60 * 60 },
    });
  }

  // имя задачи = имя события = шаблон в email-worker
  async sendNotification(
    event: string,
    data: { to: string } & Record<string, unknown>,
    deduplication?: { id: string; ttl: number },
  ): Promise<EnqueueResult> {
    return this.enqueue(event, data, deduplication && { deduplication });
  }

  private async enqueue<T extends { to: string }>(name: string, data: T, opts?: JobsOptions): Promise<EnqueueResult> {
    const addedAt = Date.now();
    const job = await this.queue.add(name, data, opts);
    const to = maskEmail(data.to);

    // при совпадении deduplication.id BullMQ не создаёт задачу, а возвращает уже существующую
    if (opts?.deduplication && job.timestamp < addedAt) {
      this.logger.log(`Deduplicated: type=${name} to=${to} dedup=${opts.deduplication.id} — already queued as job id=${job.id}`);
      return { jobId: job.id, deduplicated: true };
    }

    const dedup = opts?.deduplication ? ` dedup=${opts.deduplication.id}` : '';
    this.logger.log(`Enqueued: id=${job.id} type=${name} to=${to}${dedup}`);
    return { jobId: job.id, deduplicated: false };
  }
}
