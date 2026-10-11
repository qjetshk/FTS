import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'node-html-parser';
import { RedisService } from 'src/redis/redis.service';

const USD_ID = 'R01235';
const CACHE_TTL = 365 * 24 * 60 * 60; // курс ЦБ на прошедшую дату не меняется
const CBR_ATTEMPTS = 3;
const MIRROR_LOOKBACK_DAYS = 7; // в выходные/праздники курс не устанавливается — берём последний рабочий день
const TIMEOUT = 10_000;

// Курс не получен ни из ЦБ, ни из зеркала — генерацию нужно остановить и попросить юзера повторить позже
export class CbrUnavailableError extends Error {
  constructor(date: string, cause: string) {
    super(`Курс USD ЦБ РФ на ${date} недоступен: ${cause}`);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class CbrService {
  private readonly logger = new Logger(CbrService.name);

  constructor(private readonly redis: RedisService) {}

  // date: 'DD.MM.YYYY' → курс USD за 1 единицу.
  // Порядок: кэш Redis → ЦБ XML_daily (ретраи) → зеркало cbr-xml-daily.ru (те же официальные курсы ЦБ)
  async getUsdRate(date: string): Promise<number> {
    const cacheKey = `cbr:usd:${date}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return Number(cached);

    const errors: string[] = [];
    let rate: number | null = null;

    for (let attempt = 1; attempt <= CBR_ATTEMPTS && rate === null; attempt++) {
      try {
        rate = await this.fromCbr(date);
        this.logger.log(`USD ${date} = ${rate} (cbr.ru, attempt ${attempt})`);
      } catch (e) {
        const msg = (e as Error & { cause?: { code?: string } }).cause?.code ?? (e as Error).message;
        errors.push(`cbr#${attempt}: ${msg}`);
        this.logger.warn(`cbr.ru attempt ${attempt}/${CBR_ATTEMPTS} for ${date} failed: ${msg}`);
        if (attempt < CBR_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
      }
    }

    if (rate === null) {
      try {
        rate = await this.fromMirror(date);
        this.logger.warn(`USD ${date} = ${rate} (fallback cbr-xml-daily.ru)`);
      } catch (e) {
        errors.push(`mirror: ${(e as Error).message}`);
        this.logger.error(`Mirror failed for ${date}: ${(e as Error).message}`);
      }
    }

    if (rate === null) throw new CbrUnavailableError(date, errors.join('; '));

    await this.redis.set(cacheKey, String(rate), CACHE_TTL);
    return rate;
  }

  private async fromCbr(date: string): Promise<number> {
    const dateReq = date.replace(/\./g, '/'); // XML_daily ждёт DD/MM/YYYY
    const res = await fetch(`https://cbr.ru/scripts/XML_daily.asp?date_req=${dateReq}`, {
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // ЦБ отдаёт XML в windows-1251
    const xml = new TextDecoder('windows-1251').decode(Buffer.from(await res.arrayBuffer()));
    // node-html-parser приводит теги и атрибуты к нижнему регистру → селекторы строчными
    const usd = parse(xml).querySelector(`valute[id="${USD_ID}"]`);
    if (!usd) throw new Error('USD нет в ответе');

    return this.toRate(usd.querySelector('value')?.text, usd.querySelector('nominal')?.text);
  }

  private async fromMirror(date: string): Promise<number> {
    const [dd, mm, yyyy] = date.split('.').map(Number);
    const day = new Date(Date.UTC(yyyy, mm - 1, dd));

    for (let back = 0; back <= MIRROR_LOOKBACK_DAYS; back++) {
      const d = new Date(day.getTime() - back * 86_400_000);
      const path = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}`;
      const res = await fetch(`https://www.cbr-xml-daily.ru/archive/${path}/daily_json.js`, {
        signal: AbortSignal.timeout(TIMEOUT),
      });
      if (res.status === 404) continue; // нерабочий день — курса на эту дату нет
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as { Valute?: { USD?: { Value: number; Nominal: number } } };
      const usd = json.Valute?.USD;
      if (!usd) throw new Error('USD нет в ответе');
      return this.toRate(String(usd.Value), String(usd.Nominal));
    }
    throw new Error(`нет курса за ${MIRROR_LOOKBACK_DAYS} дней до ${date}`);
  }

  // курс за 1 единицу валюты (для USD nominal=1, но так надёжно для любой валюты)
  private toRate(valueStr?: string, nominalStr?: string): number {
    const value = parseFloat((valueStr ?? '').trim().replace(',', '.'));
    const nominal = parseInt((nominalStr ?? '1').trim(), 10);
    if (!Number.isFinite(value) || !nominal) throw new Error(`не распарсить курс: value="${valueStr}" nominal="${nominalStr}"`);
    return value / nominal;
  }
}
