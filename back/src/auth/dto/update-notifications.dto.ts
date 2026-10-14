import { IsEnum } from 'class-validator';
import { NOTIFICATION_CHANNEL } from '@prisma/client';

export class UpdateNotificationsDto {
  @IsEnum(NOTIFICATION_CHANNEL, { message: 'channel: EMAIL, TELEGRAM или BOTH' })
  channel!: NOTIFICATION_CHANNEL;
}
