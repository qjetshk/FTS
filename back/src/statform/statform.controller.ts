import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { StatformService } from './statform.service';
import { StatformCron } from './statform.cron';
import { CreateStatformDto } from './dto/create-statform.dto';
import { RunStatformDto } from './dto/run-statform.dto';
import { RunCallbackDto } from './dto/run-callback.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('statforms')
export class StatformController {
  constructor(
    private readonly statformService: StatformService,
    private readonly statformCron: StatformCron,
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

  // ── Коллбэки от n8n — обновить статус рана ───────────────────────────────
  @Post('internal/run/complete')
  @UseGuards(ApiKeyGuard)
  async completeRun(@Body() dto: RunCallbackDto) {
    await this.statformService.completeRun(dto.organizationId, dto.period);
    return { ok: true };
  }

  @Post('internal/run/failed')
  @UseGuards(ApiKeyGuard)
  async failRun(@Body() dto: RunCallbackDto) {
    await this.statformService.failRun(dto.organizationId, dto.period, dto.reason);
    return { ok: true };
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
    const xml = await this.statformService.getStatformXml(id, org.id);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="statform-${id}.xml"`);
    res.send(xml);
  }
}
