import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter, interval, map, merge } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

const HEARTBEAT_MS = 25_000; // держим соединение живым через ngrok / reverse-proxy

// тот же вид прогона, что отдаёт GET /statforms — фронт кладёт его в кэш как есть
export const RUN_VIEW = {
  statForms: {
    select: { id: true, country: true, status: true, itemsCount: true, completedAt: true },
  },
} as const;

type RunEvent = { userId: string; run: unknown };

// Шина изменений прогонов статформ → SSE владельцу организации.
// In-memory: работает при одном инстансе бэка; при масштабировании — заменить Subject на Redis pub/sub.
@Injectable()
export class RunEventsService {
  private readonly logger = new Logger(RunEventsService.name);
  private readonly events$ = new Subject<RunEvent>();

  constructor(private readonly prisma: PrismaService) {}

  // перечитывает прогон и рассылает его актуальное состояние; ошибки не пробрасываем — это побочный эффект
  async emit(runId: string): Promise<void> {
    try {
      const run = await this.prisma.statFormRun.findUnique({
        where: { id: runId },
        include: { ...RUN_VIEW, organization: { select: { userId: true } } },
      });
      if (!run) return;
      const { organization, ...view } = run;
      this.events$.next({ userId: organization.userId, run: view });
    } catch (e) {
      this.logger.error(`emit run ${runId} failed: ${(e as Error).message}`);
    }
  }

  stream(userId: string): Observable<MessageEvent> {
    const runs$ = this.events$.pipe(
      filter((e) => e.userId === userId),
      map((e): MessageEvent => ({ type: 'run', data: e.run as object })),
    );
    const heartbeat$ = interval(HEARTBEAT_MS).pipe(map((): MessageEvent => ({ type: 'ping', data: {} })));
    return merge(runs$, heartbeat$);
  }
}
