import { Body, Controller, Delete, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramService } from './telegram.service';
import { AdminAlertDto } from './dto/admin-alert.dto';
import { escapeHtml } from './telegram.format';

@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly link: TelegramLinkService,
    private readonly telegram: TelegramService,
  ) {}

  // ссылка t.me/<bot>?start=<token>, живёт 10 минут
  @Post('link')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  createLink(@CurrentUser() user: JwtPayload) {
    return this.link.createLink(user.id);
  }

  @Delete('link')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  unlink(@CurrentUser() user: JwtPayload) {
    return this.link.unlink(user.id);
  }

  @Post('admin-alert')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(ApiKeyGuard)
  async adminAlert(@Body() dto: AdminAlertDto) {
    const link = dto.url ? `\n\n<a href="${escapeHtml(dto.url)}">Открыть выполнение</a>` : '';
    await this.telegram.alertAdmin(`⚠️ <b>${escapeHtml(dto.source)}</b>\n\n${escapeHtml(dto.message)}${link}`);
    return { ok: true };
  }
}
