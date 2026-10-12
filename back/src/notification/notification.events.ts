import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type, type ClassConstructor } from 'class-transformer';

const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;
const COUNTRIES = ['BY', 'KZ', 'AM', 'KG'];

// ── Payload каждого события ─────────────────────────────────────────────────
// Новое событие = класс payload + строка в NOTIFICATION_PAYLOADS + шаблон в email-worker

export class StatformReadyPayload {
  @Matches(PERIOD, { message: 'period must be YYYY-MM' })
  period!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(COUNTRIES, { each: true })
  countries!: string[];

  // готовые формы — email-worker прикладывает их XML к письму
  @IsArray()
  @IsString({ each: true })
  statformIds!: string[];

  // часть стран не сформировалась
  @IsBoolean()
  partial!: boolean;
}

// известные причины сбоя — от них зависит текст письма; без cause — общая ошибка
// ozon_auth — OZON отклонил API-ключ (401/403), кнопка в письме ведёт в настройки организации
export const STATFORM_FAIL_CAUSES = ['rate_unavailable', 'ozon_auth'] as const;
export type StatformFailCause = (typeof STATFORM_FAIL_CAUSES)[number];

export class StatformFailedPayload {
  @Matches(PERIOD, { message: 'period must be YYYY-MM' })
  period!: string;

  @IsOptional()
  @IsIn(STATFORM_FAIL_CAUSES)
  cause?: StatformFailCause;

  // причина на русском из колбэка n8n — показывается в письме
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// формат = items из ноды «Check NEEDS_REVIEW» воркфлоу статформ в n8n
export class ReviewProductItem {
  @IsNumberString({}, { message: 'sku must be a numeric string' })
  sku!: string;

  @IsString()
  @MaxLength(500)
  name!: string;

  // почему заблокирован (из Code-ноды n8n) — в письмо не идёт, видно в истории задачи
  @IsOptional()
  @IsIn(['not_synced', 'no_code', 'not_classified', 'needs_review'])
  reason?: string;
}

// генерация статформ остановлена: у товаров из отправок ТН ВЭД в статусе NEEDS_REVIEW
export class ProductsNeedReviewPayload {
  @Matches(PERIOD, { message: 'period must be YYYY-MM' })
  period!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => ReviewProductItem)
  products!: ReviewProductItem[];
}

export class OzonApiErrorPayload {
  // техническая причина — только для логов/истории задачи, юзеру не показывается
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export const NOTIFICATION_PAYLOADS = {
  'statform.ready': StatformReadyPayload,
  'statform.failed': StatformFailedPayload,
  'products.need-review': ProductsNeedReviewPayload,
  'ozon.api-error': OzonApiErrorPayload,
} satisfies Record<string, ClassConstructor<object>>;

export type NotificationEvent = keyof typeof NOTIFICATION_PAYLOADS;
export type NotificationPayload<E extends NotificationEvent> = InstanceType<(typeof NOTIFICATION_PAYLOADS)[E]>;
export const NOTIFICATION_EVENTS = Object.keys(NOTIFICATION_PAYLOADS) as NotificationEvent[];

// куда ведёт кнопка в письме (путь на фронте); функция — если путь зависит от payload
export const NOTIFICATION_ACTION_PATH: {
  [E in NotificationEvent]: string | ((payload: NotificationPayload<E>) => string);
} = {
  'statform.ready': '/dashboard/statforms',
  'statform.failed': (p) => (p.cause === 'ozon_auth' ? '/dashboard/organizations' : '/dashboard/statforms'),
  'products.need-review': '/dashboard/products',
  'ozon.api-error': '/dashboard/organizations',
};
