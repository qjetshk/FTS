import { Injectable } from '@nestjs/common';
import { parse } from 'node-html-parser';

@Injectable()
export class CbrService {
  // date: 'DD.MM.YYYY'
  async getUsdRate(date: string): Promise<number> {
    /* const dateReq = date.replace(/\./g, '/'); // XML_daily ждёт DD/MM/YYYY
    const url = `https://cbr.ru/scripts/XML_daily.asp?date_req=${dateReq}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`ЦБ: HTTP ${res.status} для даты ${date}`);
    }

    // ЦБ отдаёт XML в windows-1251
    const buf = Buffer.from(await res.arrayBuffer());
    const xml = new TextDecoder('windows-1251').decode(buf);

    const root = parse(xml);

    // ВАЖНО: node-html-parser приводит теги и атрибуты к нижнему регистру,
    // поэтому селекторы строчными: valute[id=...], value, nominal
    const usdNode = root.querySelector('valute[id="R01235"]');
    if (!usdNode) {
      throw new Error(`ЦБ: USD не найден в ответе за ${date}`);
    }

    const nominalStr = usdNode.querySelector('nominal')?.text.trim() ?? '1';
    const valueStr = usdNode.querySelector('value')?.text.trim() ?? '';

    const nominal = parseInt(nominalStr, 10);
    const value = parseFloat(valueStr.replace(',', '.'));

    if (isNaN(value) || isNaN(nominal) || nominal === 0) {
      throw new Error(
        `ЦБ: не распарсить курс USD за ${date}: value="${valueStr}" nominal="${nominalStr}"`,
      );
    } */

    // курс за 1 единицу валюты (для USD nominal=1, но так надёжно для любой валюты)
    //return value / nominal;
    return 78.3;
  }
}