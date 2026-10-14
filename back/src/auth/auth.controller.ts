import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TelegramPollDto } from './dto/telegram-poll.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { TelegramLoginService } from './telegram-login.service';
import type { JwtPayload } from './interfaces/jwt.interface';
import { JwtAuthGuard, JwtRefreshGuard } from 'src/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramLogin: TelegramLoginService,
  ) {}

  @Post('email/request-code')
  @HttpCode(HttpStatus.OK)
  async requestCode(@Body() dto: RequestCodeDto, @Req() req: Request) {
    return this.authService.requestCode(dto, req.ip);
  }

  @Post('email/verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(
    @Body() dto: VerifyCodeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyCode(dto, res, req.headers['user-agent'], req.ip);
  }

  // ─── Вход через Telegram: start → юзер подтверждает в боте → poll отдаёт сессию ───

  @Post('telegram/start')
  @HttpCode(HttpStatus.OK)
  async telegramStart(@Req() req: Request) {
    return this.telegramLogin.start(req.headers['user-agent'], req.ip);
  }

  @Post('telegram/poll')
  @HttpCode(HttpStatus.OK)
  async telegramPoll(
    @Body() dto: TelegramPollDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.telegramLogin.poll(dto.token, res, req.headers['user-agent'], req.ip);
  }

  // ─── Привязка почты (для вошедших через Telegram) ──────────────────────────

  @Post('email/link/request-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async requestEmailLinkCode(@CurrentUser() user: JwtPayload, @Body() dto: RequestCodeDto, @Req() req: Request) {
    return this.authService.requestEmailLinkCode(user.id, dto.email, req.ip);
  }

  @Post('email/link/verify-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async verifyEmailLink(@CurrentUser() user: JwtPayload, @Body() dto: VerifyCodeDto) {
    return this.authService.verifyEmailLink(user.id, dto.email, dto.code);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { userId, refreshToken } = req.user as {
      userId: string;
      refreshToken: string;
    };
    return this.authService.logout(userId, refreshToken, res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, refreshToken } = req.user as {
      userId: string;
      refreshToken: string;
    };
    return this.authService.refresh(userId, refreshToken, res, req.headers['user-agent'], req.ip);
  }

  @Get('@me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.id);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  // куда слать уведомления: почта, Telegram или оба
  @Patch('notifications')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateNotifications(@CurrentUser() user: JwtPayload, @Body() dto: UpdateNotificationsDto) {
    return this.authService.updateNotificationChannel(user.id, dto.channel);
  }

  @Post('complete-onboarding')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(@CurrentUser() user: JwtPayload) {
    return this.authService.completeOnboarding(user.id);
  }

  @Post('reset-onboarding')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async resetOnboarding(@CurrentUser() user: JwtPayload) {
    return this.authService.resetOnboarding(user.id);
  }

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getSessions(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const currentToken = (req as any).cookies?.['refresh_token'] ?? '';
    return this.authService.getSessions(user.id, currentToken);
  }

  @Post('sessions/revoke-others')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async revokeOtherSessions(@Req() req: Request) {
    const { userId, refreshToken } = req['user'] as {
      userId: string;
      refreshToken: string;
    };
    return this.authService.revokeOtherSessions(userId, refreshToken);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getStats(@CurrentUser() user: JwtPayload) {
    return this.authService.getStats(user.id);
  }
}
