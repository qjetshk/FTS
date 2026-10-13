import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { Context } from 'grammy';
import { PrismaService } from 'src/prisma/prisma.service';
import { QUEUE_CLASSIFY, QUEUE_EMAIL, QUEUE_STATFORM } from 'src/queue/queue.constants';
import { TelegramService } from './telegram.service';
import { escapeHtml, formatPeriod } from './telegram.format';

const DAY = 24 * 60 * 60 * 1000;
const PROBLEM_RUNS_LIMIT = 10;

const fmtDate = (d: Date) =>
  d.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

// Команды только для чата TELEGRAM_ADMIN_CHAT_ID — туда же приходят алерты (alertAdmin)
@Injectable()
export class TelegramAdminService implements OnModuleInit {
  private readonly queues: Queue[];

  constructor(
    private telegram: TelegramService,
    private prisma: PrismaService,
    @InjectQueue(QUEUE_STATFORM) statformQueue: Queue,
    @InjectQueue(QUEUE_CLASSIFY) classifyQueue: Queue,
    @InjectQueue(QUEUE_EMAIL) emailQueue: Queue,
  ) {
    this.queues = [statformQueue, classifyQueue, emailQueue];
  }

  onModuleInit() {
    // чужим чатам команды не отвечают — для них как будто команды нет (уходит дальше, в общий ответ)
    const admin = this.telegram.handlers.filter((ctx) => String(ctx.chat?.id) === this.telegram.adminChatId);
    admin.command('stats', (ctx) => this.onStats(ctx));
    admin.command('runs', (ctx) => this.onRuns(ctx));
    admin.command('queues', (ctx) => this.onQueues(ctx));
  }

  private async onStats(ctx: Context) {
    const dayAgo = new Date(Date.now() - DAY);
    const [users, newUsers, tgUsers, tgOnly, orgs, runs] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
      this.prisma.user.count({ where: { telegramChatId: { not: null } } }),
      this.prisma.user.count({ where: { email: null } }),
      this.prisma.organization.count(),
      this.prisma.statFormRun.groupBy({ by: ['status'], where: { updatedAt: { gte: dayAgo } }, _count: true }),
    ]);
    const runsLine = runs.length ? runs.map((r) => `${r.status}: ${r._count}`).join(', ') : 'не было';
    await ctx.reply(
      `<b>Пользователи:</b> ${users} (+${newUsers} за сутки)\n` +
        `С Telegram: ${tgUsers}, без почты: ${tgOnly}\n` +
        `<b>Организации:</b> ${orgs}\n` +
        `<b>Прогоны за сутки:</b> ${runsLine}`,
      { parse_mode: 'HTML' },
    );
  }

  // упавшие, частичные, ждущие проверки и незавершённые — свежие сверху
  private async onRuns(ctx: Context) {
    const runs = await this.prisma.statFormRun.findMany({
      where: { status: { not: 'READY' } },
      orderBy: { updatedAt: 'desc' },
      take: PROBLEM_RUNS_LIMIT,
      select: {
        period: true,
        status: true,
        failureReason: true,
        updatedAt: true,
        organization: { select: { fullOrg: true, ozonClientId: true } },
      },
    });
    if (!runs.length) {
      await ctx.reply('Проблемных прогонов нет 👌');
      return;
    }
    const lines = runs.map((r) => {
      const reason = r.failureReason ? `\n   ${escapeHtml(r.failureReason.slice(0, 200))}` : '';
      return (
        `<b>${r.status}</b> · ${formatPeriod(r.period)} · ${fmtDate(r.updatedAt)}\n` +
        `   ${escapeHtml(r.organization.fullOrg)} (client ${r.organization.ozonClientId})${reason}`
      );
    });
    await ctx.reply(lines.join('\n\n'), { parse_mode: 'HTML' });
  }

  private async onQueues(ctx: Context) {
    const lines = await Promise.all(
      this.queues.map(async (q) => {
        const c = await q.getJobCounts('waiting', 'active', 'delayed', 'completed', 'failed');
        const warn = c.failed || c.waiting > 20 ? ' ⚠️' : '';
        return (
          `<b>${q.name}</b>${warn}\nждут ${c.waiting} · в работе ${c.active} · отложены ${c.delayed}\n` +
          `выполнены ${c.completed} · упали ${c.failed}`
        );
      }),
    );
    // счётчики ограничены DEFAULT_JOB_OPTIONS: выполненные хранятся 7 дней (до 1000), упавшие — 30 дней
    await ctx.reply(`${lines.join('\n\n')}\n\n<i>выполнены — за 7 дней, упали — за 30 дней</i>`, { parse_mode: 'HTML' });
  }
}
