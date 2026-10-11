import { IsIn, IsInt, IsObject, IsOptional, Matches, MaxLength } from 'class-validator';
import { NOTIFICATION_EVENTS, type NotificationEvent } from '../notification.events';

// Вызывается из n8n. payload проверяется отдельно — по классу для конкретного event.
export class SendNotificationDto {
  @IsIn(NOTIFICATION_EVENTS, { message: `event must be one of: ${NOTIFICATION_EVENTS.join(', ')}` })
  event!: NotificationEvent;

  @IsInt()
  clientId!: number;

  @IsObject()
  payload!: Record<string, unknown>;

  // ключ дедупликации: одинаковый у повторов одного события (ретраи n8n) → письмо уйдёт один раз
  @IsOptional()
  @MaxLength(200)
  @Matches(/^[\w.-]+$/, { message: 'idempotencyKey: только буквы, цифры, _ . -' })
  idempotencyKey?: string;
}
