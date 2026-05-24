export type Plan = {
  name: string;
  blurb: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  featured: boolean;
};

export const PLANS: Plan[] = [
  {
    name: "Старт",
    blurb: "Для микро-каталога",
    monthlyPrice: 990,
    yearlyPrice: 9900,
    features: [
      "До 100 уникальных SKU",
      "1 организация",
      "Авто-генерация XML каждый месяц",
      "История статформ и превью",
      "Поддержка в Telegram",
      "Email-уведомления о дедлайнах",
    ],
    featured: false,
  },
  {
    name: "Бизнес",
    blurb: "Для большинства Ozon-продавцов",
    monthlyPrice: 1490,
    yearlyPrice: 14900,
    features: [
      "До 1 000 уникальных SKU",
      "До 3 организаций",
      "Всё из тарифа Старт",
    ],
    featured: true,
  },
  {
    name: "Про",
    blurb: "Для крупных и мультимагазинов",
    monthlyPrice: 2990,
    yearlyPrice: 29900,
    features: [
      "Безлимит SKU",
      "Безлимит организаций",
      "Всё из тарифа Бизнес",
      "Приоритетная поддержка (час ответа в рабочее время)",
      "Ранний доступ к новым фичам",
    ],
    featured: false,
  },
];

export function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU") + " ₽";
}