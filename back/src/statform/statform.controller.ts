import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  Sse,
  UseGuards,
  type MessageEvent,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { RunEventsService } from './run-events.service';
import { StatformService } from './statform.service';
import { StatformCron } from './statform.cron';
import { CreateStatformDto } from './dto/create-statform.dto';
import { RunStatformDto } from './dto/run-statform.dto';
import { RunCallbackDto, RunNeedsReviewDto, RunProgressDto } from './dto/run-callback.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('statforms')
export class StatformController {
  constructor(
    private readonly statformService: StatformService,
    private readonly statformCron: StatformCron,
    private readonly runEvents: RunEventsService,
  ) {}

  // ── Тест крона (удалить после проверки) ──────────────────────────────────
  @Post('cron-test')
  @UseGuards(ApiKeyGuard)
  async cronTest() {
    await this.statformCron.enqueueMonthlyStatforms();
    return { ok: true };
  }

  // ── Ручной запуск через очередь (async) ───────────────────────────────────
  @Post('run')
  @UseGuards(JwtAuthGuard)
  async runStatform(
    @Body() dto: RunStatformDto,
    @CurrentUser() user: { id: string },
  ) {
    const org = await this.statformService.getOrgByUserId(user.id);
    return this.statformService.runStatform(org, dto.period);
  }

  // ── Вызывается n8n — сохранить XML одной страны ───────────────────────────
  @Post('create-n8n')
  @UseGuards(ApiKeyGuard)
  async createStatformByN8N(@Body() dto: CreateStatformDto) {
    return this.statformService.createStatform(dto);
  }

  // ── Коллбэки от n8n — шаги и итог прогона ────────────────────────────────
  @Post('internal/run/progress')
  @UseGuards(ApiKeyGuard)
  async runProgress(@Body() dto: RunProgressDto) {
    const orgId = await this.statformService.resolveOrgId(dto);
    await this.statformService.setStage(orgId, dto.period, dto.stage);
    return { ok: true };
  }

  @Post('internal/run/complete')
  @UseGuards(ApiKeyGuard)
  async completeRun(@Body() dto: RunCallbackDto) {
    const orgId = await this.statformService.resolveOrgId(dto);
    await this.statformService.completeRun(orgId, dto.period);
    return { ok: true };
  }

  @Post('internal/run/failed')
  @UseGuards(ApiKeyGuard)
  async failRun(@Body() dto: RunCallbackDto) {
    const orgId = await this.statformService.resolveOrgId(dto);
    await this.statformService.failRun(orgId, dto.period, dto.reason);
    return { ok: true };
  }

  // ветка block: товары без кода / на проверку → статус NEEDS_REVIEW + письмо со списком
  @Post('internal/run/needs-review')
  @UseGuards(ApiKeyGuard)
  async needsReviewRun(@Body() dto: RunNeedsReviewDto) {
    const orgId = await this.statformService.resolveOrgId(dto);
    await this.statformService.needsReviewRun(orgId, dto.period, dto.products);
    return { ok: true };
  }

  // ── SSE: изменения прогонов текущего юзера в реальном времени ─────────────
  @Sse('events')
  @UseGuards(JwtAuthGuard)
  events(@CurrentUser() user: { id: string }): Observable<MessageEvent> {
    return this.runEvents.stream(user.id);
  }

  // ── Список ранов текущего пользователя ───────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard)
  async getStatforms(@CurrentUser() user: { id: string }) {
    const org = await this.statformService.getOrgByUserId(user.id);
    return this.statformService.getStatforms(org.id);
  }

  // ── Скачать XML файл ──────────────────────────────────────────────────────
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadStatform(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ) {
    const org = await this.statformService.getOrgByUserId(user.id);
    const { filename, content } = await this.statformService.getStatformFile(id, org.id);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  // ── Вызывается email-worker — XML для вложения в письмо «статформы готовы» ──
  @Get('internal/:id/file')
  @UseGuards(ApiKeyGuard)
  async getStatformFileInternal(@Param('id') id: string) {
    return this.statformService.getStatformFile(id);
  }
}
