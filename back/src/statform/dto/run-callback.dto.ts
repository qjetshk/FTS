import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  ReviewProductItem,
  STATFORM_FAIL_CAUSES,
  type StatformFailCause,
} from '../../notification/notification.events';

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

  // известная причина сбоя (run/failed) — от неё зависит текст письма и куда ведёт кнопка
  @IsOptional()
  @IsIn(STATFORM_FAIL_CAUSES)
  cause?: StatformFailCause;
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

export class FailedCountryItem {
  @IsIn(['BY', 'KZ', 'AM', 'KG'])
  country!: string;

  // причина на русском — видна юзеру в письме, если не собралась ни одна страна
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// итоговый колбэк после Create XML по всем странам: какие не собрались (собравшиеся бэк уже знает из create-n8n)
export class RunCompleteDto extends RunCallbackDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FailedCountryItem)
  failedCountries?: FailedCountryItem[];

  // за месяц не нашлось отправлений в ЕАЭС — статформы не нужны
  @IsOptional()
  @IsBoolean()
  noSales?: boolean;
}
