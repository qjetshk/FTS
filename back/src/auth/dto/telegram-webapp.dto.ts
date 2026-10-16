import { IsString, Length } from 'class-validator';

export class TelegramWebAppDto {
  // initData Mini App — строка query-параметров, подписанная Telegram
  @IsString()
  @Length(1, 4096, { message: 'Некорректные данные Telegram' })
  initData!: string;
}
