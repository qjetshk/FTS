import { countryName, escapeHtml, formatPeriod, plural } from 'src/telegram/telegram.format';
import type { TelegramButton } from 'src/telegram/telegram.service';
import type { NotificationEvent, NotificationPayload } from './notification.events';

const MAX_LISTED = 10;

type Ctx = { orgName: string; actionUrl: string };
export type TelegramMessage = { html: string; buttons: TelegramButton[] };

// Тексты уведомлений в Telegram — короче писем, по смыслу совпадают с шаблонами email-worker
export const TELEGRAM_MESSAGES: {
  [E in NotificationEvent]: (p: NotificationPayload<E>, ctx: Ctx) => TelegramMessage;
} = {
  'statform.ready': (p, { orgName, actionUrl }) => {
    const countries = p.countries.map(countryName).join(', ');
    const partial = p.partial ? '\n\n⚠️ Не по всем странам — подробности в личном кабинете.' : '';
    return {
      html:
        `✅ <b>Статформы за ${formatPeriod(p.period)} готовы</b>\n` +
        `${escapeHtml(orgName)}\n\nСтраны: ${countries}. XML-файлы — ниже.${partial}`,
      buttons: [{ text: 'Открыть статформы', url: actionUrl }],
    };
  },

  'statform.failed': (p, { orgName, actionUrl }) => {
    const period = formatPeriod(p.period);
    const head = `❌ <b>Статформы за ${period} не сформированы</b>\n${escapeHtml(orgName)}\n\n`;
    if (p.cause === 'ozon_auth') {
      return {
        html: head + 'OZON отклонил API-ключ — скорее всего, он отозван или истёк. Укажите новый ключ в настройках организации и запустите формирование заново.',
        buttons: [{ text: 'Обновить API-ключ', url: actionUrl }],
      };
    }
    if (p.cause === 'rate_unavailable') {
      return {
        html: head + 'Сервис ЦБ РФ с курсом доллара временно недоступен. Подождите несколько часов и запустите формирование заново.',
        buttons: [{ text: 'Запустить заново', url: actionUrl }],
      };
    }
    const reason = p.reason ? `Причина: ${escapeHtml(p.reason)}\n\n` : '';
    return {
      html: head + reason + 'Попробуйте запустить формирование заново. Если ошибка повторится — напишите нам.',
      buttons: [{ text: 'Запустить заново', url: actionUrl }],
    };
  },

  'statform.no-sales': (p, { orgName, actionUrl }) => ({
    html:
      `ℹ️ <b>За ${formatPeriod(p.period)} статформа не нужна</b>
${escapeHtml(orgName)}

` +
      'В этом месяце не было отгрузок в страны ЕАЭС, по которым статформу подаёт продавец. Ничего делать не нужно.',
    buttons: [{ text: 'Открыть статформы', url: actionUrl }],
  }),

  'products.need-review': (p, { orgName, actionUrl }) => {
    const listed = p.products.slice(0, MAX_LISTED).map((x) => `• ${escapeHtml(x.name)} — SKU ${x.sku}`);
    const rest = p.products.length - listed.length;
    if (rest > 0) listed.push(`и ещё ${rest}`);
    return {
      html:
        `🔎 <b>Нужна проверка ТН ВЭД: ${plural(p.products.length, ['товар', 'товара', 'товаров'])}</b>\n` +
        `${escapeHtml(orgName)}\n\nСтатформы за ${formatPeriod(p.period)} не сформированы — проверьте коды:\n` +
        `${listed.join('\n')}\n\nПосле проверки запустите формирование заново вручную.`,
      buttons: [{ text: 'Проверить товары', url: actionUrl }],
    };
  },

  'ozon.api-error': (_p, { orgName, actionUrl }) => ({
    html:
      `⚠️ <b>Не удалось получить данные из OZON</b>\n${escapeHtml(orgName)}\n\n` +
      'Проверьте API-ключ в настройках организации — возможно, он отозван или у него не хватает прав.',
    buttons: [{ text: 'Открыть организацию', url: actionUrl }],
  }),
};
