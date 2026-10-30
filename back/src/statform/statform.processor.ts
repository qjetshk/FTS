import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_STATFORM, JOB_GENERATE_XML } from '../queue/queue.constants';
import { StatformJobData } from '../queue/queue.types';
import { RunEventsService } from './run-events.service';
import { StatformService, uploadedCsvKey } from './statform.service';
import { RedisService } from '../redis/redis.service';
import { decryptField } from '../utils/field-crypto.util';

@Injectable()
export class StatformProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StatformProcessor.name);
  private worker!: Worker;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly runEvents: RunEventsService,
    private readonly statformService: StatformService,
    private readonly redis: RedisService,
  ) {
    this.logger.log('StatformProcessor instantiated');
  }

  onModuleInit() {
    const connection = {
      host: this.config.getOrThrow<string>('REDIS_HOST'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD') || undefined,
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    };

    this.logger.log(`Starting worker → redis://${connection.host}:${connection.port}`);

    this.worker = new Worker(QUEUE_STATFORM, async (job) => {
      if (job.name !== JOB_GENERATE_XML) return;
      const { organizationId, period, source } = job.data as StatformJobData;
      // ключ и Client ID — актуальные из БД (юзер мог сменить ключ, пока задача ждала в очереди)
      const org = await this.prisma.organization.findUniqueOrThrow({
        where: { id: organizationId },
        select: { ozonClientId: true, ozonApiKey: true },
      });

      this.logger.log(`Job received: org=${organizationId} period=${period}`);

      // новый запуск: чистим итог прошлого (ошибка, файлы стран) — иначе старые страны смешаются с новыми
      const run = await this.prisma.statFormRun.upsert({
        where: { organizationId_period: { organizationId, period } },
        create: { organizationId, period, status: 'BUILDING', stage: 'STARTED' },
        update: { status: 'BUILDING', stage: 'STARTED', failureReason: null, completedAt: null },
      });
      await this.prisma.statForm.deleteMany({ where: { runId: run.id } });
      await this.runEvents.emit(run.id);

      // загруженный отчёт: n8n получает CSV в base64 и пропускает выгрузку из OZON
      let csvBase64: string | undefined;
      if (source === 'upload') {
        const csv = await this.redis.get(uploadedCsvKey(organizationId, period));
        if (!csv) {
          await this.statformService.failRun(organizationId, period, 'Загруженный отчёт не дождался обработки — загрузите его ещё раз.');
          return;
        }
        csvBase64 = Buffer.from(csv, 'utf-8').toString('base64');
      }

      const webhookUrl = this.config.getOrThrow<string>('N8N_STATFORM_WEBHOOK_URL');
      this.logger.log(`Calling n8n: ${webhookUrl}`);

      await axios.post(
        webhookUrl,
        { client_id: org.ozonClientId, api_key: decryptField(org.ozonApiKey), period, ...(csvBase64 && { csv_base64: csvBase64 }) },
        // файл в мегабайтах грузится дольше пустого запроса
        { timeout: csvBase64 ? 60_000 : 10_000, maxBodyLength: Infinity },
      );
      if (csvBase64) await this.redis.del(uploadedCsvKey(organizationId, period));

      this.logger.log(`n8n triggered: org=${organizationId} period=${period}`);
    }, {
      connection,
      concurrency: 3,
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
      // последняя попытка — n8n так и не запустили, иначе прогон навсегда останется «генерируется»
      if (!job || job.attemptsMade < (job.opts.attempts ?? 1)) return;
      const { organizationId, period } = job.data as StatformJobData;
      this.statformService
        .failRun(organizationId, period, 'Не удалось запустить генерацию — сервис формирования недоступен. Попробуйте позже.')
        .catch((e) => this.logger.error(`failRun after job failure: ${e.message}`));
    });

    this.worker.on('error', (err) => {
      this.logger.error(`Worker error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
