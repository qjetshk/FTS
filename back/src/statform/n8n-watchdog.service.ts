import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { StatformService } from './statform.service';

type N8nExecution = { id: string; status: string; startedAt: string; stoppedAt: string | null };
type N8nExecutionFull = N8nExecution & {
  data?: { resultData?: { runData?: Record<string, { data?: { main?: { json?: { body?: Record<string, unknown> } }[][] } }[]> } };
};

// какие исходы n8n не доносят до бэка сами: отмена (Error Workflow на неё не срабатывает)
// и ошибки, после которых Error Workflow не запустился (бывает при обрыве соединения)
const FAILED_STATUSES = new Set(['canceled', 'error', 'crashed']);
const LOOKBACK_MS = 30 * 60 * 1000;
const SEEN_TTL = 24 * 60 * 60;
const REASONS: Record<string, string> = {
  canceled: 'Генерация остановлена вручную в сервисе формирования. Запустите генерацию заново.',
  error: 'Генерация прервалась из-за ошибки сервиса формирования. Запустите генерацию заново.',
  crashed: 'Генерация прервалась из-за сбоя сервиса формирования. Запустите генерацию заново.',
};

// Сторож прогонов статформ: раз в минуту смотрит упавшие/отменённые выполнения воркфлоу FTS в n8n
// и сразу роняет их прогон — юзер видит ошибку за минуту, а не через STALE_RUN_MS.
// Без N8N_API_KEY выключен: тогда прогон снимет только failStaleRuns по таймауту.
@Injectable()
export class N8nWatchdogService {
  private readonly logger = new Logger(N8nWatchdogService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
    private statformService: StatformService,
  ) {}

  private async api<T>(path: string): Promise<T> {
    const res = await fetch(`${this.config.getOrThrow<string>('N8N_URL')}/api/v1${path}`, {
      headers: { 'X-N8N-API-KEY': this.config.getOrThrow<string>('N8N_API_KEY') },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`n8n api ${path} -> ${res.status}`);
    return (await res.json()) as T;
  }

  @Cron('* * * * *')
  async check(): Promise<void> {
    const workflowId = this.config.get<string>('N8N_STATFORM_WORKFLOW_ID');
    if (!this.config.get<string>('N8N_API_KEY') || !workflowId) return;

    // нет активных прогонов — n8n не дёргаем
    const active = await this.prisma.statFormRun.count({ where: { status: { in: ['PENDING', 'BUILDING'] } } });
    if (!active) return;

    try {
      const { data } = await this.api<{ data: N8nExecution[] }>(`/executions?workflowId=${workflowId}&limit=20`);
      const since = Date.now() - LOOKBACK_MS;
      for (const ex of data) {
        if (!FAILED_STATUSES.has(ex.status) || !ex.stoppedAt || new Date(ex.stoppedAt).getTime() < since) continue;
        // каждое выполнение разбираем один раз
        if (!(await this.redis.setIfAbsent(`n8n:exec-seen:${ex.id}`, '1', SEEN_TTL))) continue;
        await this.handle(ex);
      }
    } catch (e) {
      this.logger.warn(`n8n watchdog: ${(e as Error).message}`);
    }
  }

  private async handle(ex: N8nExecution) {
    const full = await this.api<N8nExecutionFull>(`/executions/${ex.id}?includeData=true`);
    const body = full.data?.resultData?.runData?.['XML Generate']?.[0]?.data?.main?.[0]?.[0]?.json?.body;
    const clientId = Number(body?.client_id);
    const period = typeof body?.period === 'string' ? body.period : null;
    if (!clientId || !period) return;

    const run = await this.prisma.statFormRun.findFirst({
      where: { period, organization: { ozonClientId: clientId }, status: { in: ['PENDING', 'BUILDING'] } },
      select: { organizationId: true, updatedAt: true },
    });
    // прогон обновлялся уже после конца этого выполнения — его перезапустили, старый сбой не про него
    if (!run || run.updatedAt.getTime() > new Date(ex.stoppedAt!).getTime() + 5_000) return;

    this.logger.warn(`n8n execution ${ex.id} ${ex.status}: fail run client=${clientId} period=${period}`);
    await this.statformService.failRun(run.organizationId, period, REASONS[ex.status] ?? REASONS.error);
  }
}
