import { IsOptional, IsString, MaxLength } from 'class-validator';

// n8n (Error Workflow) → алерт админу о технической ошибке
export class AdminAlertDto {
  // откуда ошибка: имя воркфлоу / ноды
  @IsString()
  @MaxLength(200)
  source!: string;

  @IsString()
  @MaxLength(3000)
  message!: string;

  // ссылка на выполнение в n8n
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;
}
