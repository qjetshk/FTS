import { Matches } from 'class-validator';

export class TelegramPollDto {
  @Matches(/^[\w-]{32}$/, { message: 'Некорректный токен входа' })
  token!: string;
}
