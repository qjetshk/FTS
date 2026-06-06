import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_EMAIL } from 'src/queue/queue.constants';

@Injectable()
export class EmailProducerService {
  constructor(@InjectQueue(QUEUE_EMAIL) private readonly queue: Queue) {}

  async sendWelcome(to: string, name: string) {
    await this.queue.add('welcome', { to, name });
  }

  async sendVerifyEmail(to: string, name: string, verifyUrl: string) {
    await this.queue.add('verify-email', { to, name, verifyUrl });
  }

  async sendResetPassword(to: string, name: string, resetUrl: string) {
    await this.queue.add('reset-password', { to, name, resetUrl });
  }
}
