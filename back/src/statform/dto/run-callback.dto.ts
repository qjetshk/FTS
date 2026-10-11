import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ReviewProductItem } from '../../notification/notification.events';

// Колбэки n8n по прогону. Организацию можно указать organizationId или clientId (в вебхуке n8n есть только client_id).
export class RunCallbackDto {
  @ValidateIf((o: RunCallbackDto) => !o.clientId)
  @IsString({ message: 'нужен organizationId или clientId' })
  organizationId?: string;

  @ValidateIf((o: RunCallbackDto) => !o.organizationId)
  @IsInt({ message: 'нужен organizationId или clientId' })
  clientId?: number;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM' })
  period!: string;

  // причина ошибки на русском — показывается юзеру на странице и в письме
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

// шаги, которые присылает n8n (STARTED и FILLING бэк ставит сам)
export const N8N_RUN_STAGES = ['REQUESTING_REPORT', 'REPORT_RECEIVED'] as const;

export class RunProgressDto extends RunCallbackDto {
  @IsIn(N8N_RUN_STAGES)
  stage!: (typeof N8N_RUN_STAGES)[number];
}

export class RunNeedsReviewDto extends RunCallbackDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReviewProductItem)
  products!: ReviewProductItem[];
}
