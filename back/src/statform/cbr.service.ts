import { Injectable } from '@nestjs/common';
import { parse } from 'node-html-parser';

@Injectable()
export class CbrService {
  async getUsdRate(date: string): Promise<number> {
    // date: 'DD.MM.YYYY'
    const url =
      `https://cbr.ru/currency_base/dynamics/?UniDbQuery.Posted=True` +
      `&UniDbQuery.so=1&UniDbQuery.mode=1` +
      `&UniDbQuery.VAL_NM_RQ=R01235` +
      `&UniDbQuery.From=${date}&UniDbQuery.To=${date}`;

    const res = await fetch(url);
    const html = await res.text();
    const root = parse(html);

    // table.data содержит 3 tr: заголовок валюты, шапка столбцов, строка с курсом
    const rows = root.querySelectorAll('table.data tr');
    // нас интересует последний tr — там дата + единиц + курс
    const dataRow = rows[rows.length - 1];
    if (!dataRow) throw new Error(`ЦБ: таблица не найдена для даты ${date}`);

    const cells = dataRow.querySelectorAll('td');
    // td[0] = дата, td[1] = единиц, td[2] = курс
    const rateStr = cells[2]?.text.trim().replace(',', '.');
    const rate = parseFloat(rateStr);

    if (isNaN(rate)) throw new Error(`ЦБ: не удалось распарсить курс: "${rateStr}"`);
    return rate;
  }
}