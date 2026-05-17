import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_STATFORM, JOB_GENERATE_XML } from '../queue/queue.constants';
import { StatformJobData } from '../queue/queue.types';

@Injectable()
export class StatformProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StatformProcessor.name);
  private worker!: Worker;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.logger.log('StatformProcessor instantiated');
  }

  onModuleInit() {
    const connection = {
      host: this.config.getOrThrow<string>('REDIS_HOST'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    };

    this.logger.log(`Starting worker → redis://${connection.host}:${connection.port}`);

    this.worker = new Worker(QUEUE_STATFORM, async (job) => {
      if (job.name !== JOB_GENERATE_XML) return;
      const { organizationId, period, ozonClientId, ozonApiKey } = job.data as StatformJobData;

      this.logger.log(`Job received: org=${organizationId} period=${period}`);

      await this.prisma.statFormRun.upsert({
        where: { organizationId_period: { organizationId, period } },
        create: { organizationId, period, status: 'BUILDING' },
        update: { status: 'BUILDING' },
      });

      const webhookUrl = this.config.getOrThrow<string>('N8N_STATFORM_WEBHOOK_URL');
      this.logger.log(`Calling n8n: ${webhookUrl}`);

      await axios.post(
        webhookUrl,
        { client_id: ozonClientId, api_key: ozonApiKey, period },
        { timeout: 10_000 },
      );

      this.logger.log(`n8n triggered: org=${organizationId} period=${period}`);
    }, {
      connection,
      concurrency: 3,
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });

    this.worker.on('error', (err) => {
      this.logger.error(`Worker error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
