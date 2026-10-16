// uuid распространяется как ESM — Jest без трансформации его не грузит; для теста id документа не важен
jest.mock('uuid', () => ({ v4: () => '00000000-0000-4000-8000-000000000000' }));

import type { Declarant, Document, Organization } from '@prisma/client';
import { buildStatFormXml, extractDocuments, mapOrdersToGoods, type N8nOrderItem } from './statform.builder';

const order = (over: Partial<N8nOrderItem> = {}): N8nOrderItem => ({
  shipment_number: '0123456789-0001-1',
  shipment_date: '2026-09-12 12:00:00',
  sku: 1800200300,
  quantity: 1,
  price: 1018,
  shipment_amount: 1018,
  weight: '0.20',
  ...over,
});
const tnvedMap = { 1800200300: { code: '6302600000', name: 'Белье туалетное из махровых тканей', unit: null } };

const org = {
  fullOrg: 'ИП Соколова & «Дом» <Тест>',
  fullOpf: 'Индивидуальный предприниматель',
  inn: '500100732259',
  ogrn: '321500100012345',
  kpp: null,
  okato5: '46483',
  postalCode: '141400',
  orgLang: 'RU',
  region: 'Московская область',
  city: 'Химки',
  street: 'ул. Лавочкина',
  house: '12',
  room: '45',
} as unknown as Organization;
const declarant = {
  name: 'Анна', surname: 'Соколова', patronymic: 'Викторовна', position: null, phone: '+79001234567', email: 'a@example.ru',
} as unknown as Declarant;
const doc = {
  typeCode: 'RU01001', typeShort: 'ПАСРФ', series: '4500', number: '000000', issuedBy: 'ГУ МВД', issuedAt: new Date('2015-04-12'),
} as unknown as Document;

describe('сборка статформы', () => {
  it('mapOrdersToGoods: пропускает товары без кода ТН ВЭД и пересчитывает стоимость в доллары', () => {
    const goods = mapOrdersToGoods([order(), order({ sku: 999 })], tnvedMap, 81.45);
    expect(goods).toHaveLength(1);
    expect(goods[0]).toMatchObject({ tnvedCode: '6302600000', statisticalCostRub: 1018, statisticalCostUsd: 12.5 });
  });

  it('extractDocuments: договор на 1-е число месяца и по одному счёту на отправление', () => {
    const docs = extractDocuments([order(), order(), order({ shipment_number: '0123456789-0002-1' })]);
    expect(docs[0]).toEqual({ name: 'Договор', number: 'б/н', date: '2026-09-01' });
    expect(docs.slice(1).map((d) => d.number)).toEqual(['0123456789-0001-1', '0123456789-0002-1']);
  });

  it('buildStatFormXml: XML по стране с кодом ТН ВЭД, суммой и экранированием спецсимволов', async () => {
    const xml = await buildStatFormXml({
      org, declarant, doc, countryCode: 'KZ', period: '2026-09', usdRate: 81.45,
      orders: [order(), order({ shipment_number: '0123456789-0002-1', shipment_amount: 500 })],
      tnvedMap, signingDate: '2026-10-01T10:00:00',
    });
    expect(xml.startsWith('<?xml')).toBe(true);
    expect(xml).toContain('<CountryCode>KZ</CountryCode>');
    expect(xml).toContain('<GoodsTNVEDCode>6302600000</GoodsTNVEDCode>');
    expect(xml).toContain('<CustCostTotalAmount>1518.00</CustCostTotalAmount>');
    expect(xml).toContain('<KZOrganizationFeatures');
    // название с & и < > не ломает XML
    expect(xml).toContain('ИП Соколова &amp; «Дом» &lt;Тест&gt;');
    // у ИП в блок организации попадает документ, удостоверяющий личность
    expect(xml).toContain('<IdentityCardNumber>000000</IdentityCardNumber>');
  });
});
