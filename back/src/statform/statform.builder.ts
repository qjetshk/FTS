import { v4 as uuidv4 } from 'uuid';
import { buildXmlString, XmlNode } from './xml/object-xml-streamer';
import {
  Organization,
  Declarant,
  Document as DeclarantDoc,
} from '@prisma/client';

// ─── Тип данных с n8n ─────────────────────────────────────────────────────────

export interface N8nOrderItem {
  shipment_number: string;
  shipment_date: string; // 'YYYY-MM-DD HH:mm:ss'
  sku: number; // products.sku в БД
  quantity: number;
  price: number;
  shipment_amount: number;
  weight: string; // '0.20'
}

// ─── Внутренние типы ──────────────────────────────────────────────────────────

interface AggregatedGood {
  tnvedCode: string;
  tnvedName: string;
  netWeight: number;
  invoicedCost: number;
  statisticalCostRub: number;
  statisticalCostUsd: number;
}

// ─── Константы ────────────────────────────────────────────────────────────────

const NS = {
  CAT: 'urn:customs.ru:CommonAggregateTypes:5.24.0',
  RUS: 'urn:customs.ru:RUSCommonAggregateTypes:5.24.0',
  CUST: 'urn:customs.ru:CUESADCommonAggregateTypesCust:5.24.0',
};

const COUNTRY_NAME: Record<string, string> = {
  BY: 'БЕЛАРУСЬ',
  KZ: 'КАЗАХСТАН',
  AM: 'АРМЕНИЯ',
  KG: 'КЫРГЫЗСТАН',
};

// Пустой тег организации контрагента — у каждой страны свой тег в XSD
const COUNTRY_FEATURES_TAG: Record<string, string> = {
  BY: 'BYOrganizationFeatures',
  KZ: 'KZOrganizationFeatures',
  AM: 'AMOrganizationFeatures',
  KG: 'KGOrganizationFeatures',
};

// ─── Хелпер namespace ────────────────────────────────────────────────────────

function ns(namespace: string, content: Record<string, unknown> = {}): XmlNode {
  return { '@xmlns': namespace, ...content } as XmlNode;
}

// ─── Агрегация заказов ────────────────────────────────────────────────────────
// Схлопываем строки с одинаковым артикулом в одну GoodsInfo.
// tnvedCode и description берём из БД (products), поэтому передаём маппинг.

export function aggregateOrders(
  orders: N8nOrderItem[],
  tnvedMap: Record<number, { code: string; name: string }>,
  usdRate: number,
): AggregatedGood[] {
  // каждый заказ = отдельная строка GoodsInfo
  // НЕ агрегируем, просто маппируем
  return orders
    .map((order) => {
      const tnved = tnvedMap[Number(order.sku)];
      if (!tnved) return null;

      const weight = parseFloat(
        (parseFloat(order.weight) * order.quantity).toFixed(4),
      );
      const costRub = order.shipment_amount;

      return {
        tnvedCode: tnved.code,
        tnvedName: tnved.name,
        netWeight: weight,
        invoicedCost: costRub,
        statisticalCostRub: costRub,
        statisticalCostUsd: parseFloat((costRub / usdRate).toFixed(2)),
      };
    })
    .filter(Boolean) as AggregatedGood[];
}

// ─── Уникальные документы (счета-фактуры) ────────────────────────────────────

export function extractDocuments(orders: N8nOrderItem[]) {
  // Первый документ — договор (фиксированный)
  const contract = {
    name: 'Договор',
    number: 'б/н',
    // Дата — первое число отчётного месяца
    date: orders[0].shipment_date.slice(0, 7) + '-01',
  };

  // Остальные — уникальные счета-фактуры из shipment_number
  const seen = new Set<string>();
  const invoices = orders
    .filter((o) => {
      if (seen.has(o.shipment_number)) return false;
      seen.add(o.shipment_number);
      return true;
    })
    .map((o) => ({
      name: 'Счет-фактура (инвойс)',
      number: o.shipment_number,
      date: o.shipment_date.slice(0, 10), // 'YYYY-MM-DD'
    }));

  return [contract, ...invoices];
}

// ─── Блок организации (Consignor / FinancialAdjustingResponsiblePerson) ───────

function buildOrgBlock(
  org: Organization,
  declarant: Declarant,
  doc: DeclarantDoc,
): XmlNode {
  const isIP = !org.kpp; // ИП не имеют КПП

  return {
    OrganizationName: ns(NS.CAT, { '#text': org.fullOrg }),
    RFOrganizationFeatures: ns(NS.CAT, {
      OGRN: org.ogrn,
      INN: org.inn,
      ...(org.kpp ? { KPP: org.kpp } : {}),
    }),
    BusinessEntityTypeName: ns(NS.RUS, {
      '#text': isIP ? 'Индивидуальный предприниматель' : org.fullOpf,
    }),
    ...(isIP
      ? {
          IdentityCard: ns(NS.RUS, {
            IdentityCardCode: doc.typeCode,
            IdentityCardName: doc.typeShort,
            IdentityCardSeries: doc.series ?? null,
            IdentityCardNumber: doc.number,
            IdentityCardDate: doc.issuedAt.toISOString().slice(0, 10),
            OrganizationName: doc.issuedBy,
          }),
        }
      : {}),
    SubjectAddressDetails: ns(NS.RUS, {
      PostalCode: org.postalCode,
      CountryCode: org.orgLang,
      CounryName: 'РОССИЯ', // намеренная опечатка — так в XSD ФТС
      Region: org.region,
      City: org.city,
      StreetHouse: org.street ?? null,
      OKATO: org.okato5,
    }),
  } as XmlNode;
}

// ─── Блок производителя внутри GoodsInfo ────────────────────────────────────

function buildManufacturer(org: Organization): XmlNode {
  return {
    ShortName: ns(NS.CAT, { '#text': org.fullOrg }),
    RFOrganizationFeatures: ns(NS.CAT, {
      OGRN: org.ogrn,
      INN: org.inn,
    }),
    Address: ns(NS.CUST, {
      OKATO: org.okato5,
    }),
  } as XmlNode;
}

// ─── Главная функция ──────────────────────────────────────────────────────────

export interface BuildStatFormParams {
  org: Organization;
  declarant: Declarant;
  doc: DeclarantDoc;
  countryCode: string; // 'BY' | 'KZ' | 'AM' | 'KG'
  period: string; // 'YYYY-MM'
  usdRate: number; // курс ЦБ на 1-е число месяца
  orders: N8nOrderItem[]; // только заказы этой страны
  tnvedMap: Record<string, { code: string; name: string }>;
  signingDate: string; // ISO: '2026-04-01T10:00:00'
}

export async function buildStatFormXml(
  params: BuildStatFormParams,
): Promise<string> {
  const {
    org,
    declarant,
    doc,
    countryCode,
    period,
    usdRate,
    orders,
    tnvedMap,
    signingDate,
  } = params;

  const countryName = COUNTRY_NAME[countryCode] ?? countryCode;
  const featureTag =
    COUNTRY_FEATURES_TAG[countryCode] ?? 'BYOrganizationFeatures';
  const goods = aggregateOrders(orders, tnvedMap, usdRate);
  const documents = extractDocuments(orders);
  const totalAmountRub = goods.reduce((sum, g) => sum + g.invoicedCost, 0);
  const orgBlock = buildOrgBlock(org, declarant, doc);
  const isIP = !org.kpp;

  const obj: XmlNode = {
    StaticForm: {
      '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@DocumentModeID': '1006124E',
      '@xmlns': 'urn:customs.ru:Information:CustomsDocuments:StaticForm:5.24.0',

      DocumentID: ns(NS.CAT, { '#text': uuidv4() }),
      CustomsProcedure: 'ЭК',
      TransportModeCode: '30',
      TransportName:
        'Автодорожный транспорт, за исключением транспортных средств, указанных под кодами 31, 32',
      ReportingDate: period,
      NSF: 'отсутствует',

      Consignor: orgBlock,
      Consignee: {
        OrganizationName: ns(NS.CAT, { '#text': 'Физические лица' }),
        [featureTag]: ns(NS.CAT), // пустой тег — требует XSD
        SubjectAddressDetails: ns(NS.RUS, {
          CountryCode: countryCode,
          CounryName: countryName,
        }),
      },
      FinancialAdjustingResponsiblePerson: orgBlock,

      TradeCountry: { CountryName: countryName, CountryCode: countryCode },
      DispatchCountry: { CountryName: 'РОССИЯ', CountryCode: 'RU' },
      DestinationCountry: {
        CountryName: countryName,
        CountryCode: countryCode,
      },

      CustCostCurrencyCode: 'RUB',
      CustCostTotalAmount: totalAmountRub.toFixed(2),

      Documents: documents.map((d) => ({
        PrDocumentName: ns(NS.CAT, { '#text': d.name }),
        PrDocumentNumber: ns(NS.CAT, { '#text': d.number }),
        PrDocumentDate: ns(NS.CAT, { '#text': d.date }),
      })),

      GoodsInfo: goods.map((g, i) => ({
        GoodsNumeric: i + 1,
        GoodsTNVEDCode: g.tnvedCode,
        GoodsDescription: g.tnvedName,
        Manufacturer: buildManufacturer(org),
        AdditionalInformationCode: '07',
        AdditionalInformation:
          'товары, вывозимые в рамках интернет-торговли в адрес физических лиц',
        NetWeightQuantity: g.netWeight,
        InvoicedCost: g.invoicedCost,
        StatisticalCostRUB: g.statisticalCostRub,
        StatisticalCostUSD: g.statisticalCostUsd,
        OriginCountry: { CountryName: 'РОССИЯ', CountryCode: 'RU' },
      })),

      ProvidePerson: {
        PersonSurname: ns(NS.CAT, { '#text': declarant.surname }),
        PersonName: ns(NS.CAT, { '#text': declarant.name }),
        PersonMiddleName: ns(NS.CAT, { '#text': declarant.patronymic }),
        PersonPost: ns(NS.CAT, {
          '#text':
            declarant.position ??
            (isIP ? 'Индивидуальный предприниматель' : 'Генеральный директор'),
        }),
        CommunicationDetails: ns(NS.RUS, {
          Phone: ns(NS.CAT, { '#text': declarant.phone }),
          E_mail: ns(NS.CAT, { '#text': declarant.email }),
        }),
        SigningDate: ns(NS.RUS, { '#text': signingDate }),
        Organization: {
          OrganizationName: ns(NS.CAT, { '#text': org.fullOrg }),
          OrganizationLanguage: ns(NS.CAT, { '#text': org.orgLang }),
          RFOrganizationFeatures: ns(NS.CAT, { OGRN: org.ogrn, INN: org.inn }),
          SubjectAddressDetails: ns(NS.RUS, {
            AddressKindCode: '1',
            PostalCode: org.postalCode,
            CountryCode: org.orgLang,
            CounryName: 'РОССИЯ',
            Region: org.region,
            City: org.city,
            StreetHouse: org.street ?? null,
            House: org.house ?? null,
            Room: org.room ?? null,
            AddressText: [
              org.postalCode,
              'РОССИЯ',
              org.region,
              org.city,
              org.street,
              org.house,
              org.room,
            ]
              .filter(Boolean)
              .join(', '),
          }),
        },
      },
    },
  };

  return buildXmlString(obj);
}
