import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // n8n → уведомление владельцу организации (email, позже telegram)
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(ApiKeyGuard)
  async send(@Body() dto: SendNotificationDto) {
    return this.notificationService.notifyExternal(dto);
  }
}
