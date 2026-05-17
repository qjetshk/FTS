import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { StatformProducer } from './statform.producer';
import { StatformJobData } from '../queue/queue.types';

function previousMonthPeriod(): string {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  return `${year}-${String(month).padStart(2, '0')}`;
}

@Injectable()
export class StatformCron {
  private readonly logger = new Logger(StatformCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: StatformProducer,
  ) {}

  @Cron('0 6 1 * *')
  async enqueueMonthlyStatforms(): Promise<void> {
    const period = previousMonthPeriod();
    this.logger.log(`Scheduling monthly statforms for period ${period}`);

    const orgs = await this.prisma.organization.findMany({
      select: { id: true, ozonClientId: true, ozonApiKey: true },
    });

    const jobs: StatformJobData[] = orgs.map((org) => ({
      organizationId: org.id,
      ozonClientId: org.ozonClientId,
      ozonApiKey: org.ozonApiKey,
      period,
      triggeredBy: 'cron',
    }));

    await this.producer.enqueueBulk(jobs);
    this.logger.log(`Enqueued ${jobs.length} statform jobs for period ${period}`);
  }
}
