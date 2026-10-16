import { deliveryTargets } from './delivery-targets';

const user = (channel: 'EMAIL' | 'TELEGRAM' | 'BOTH', email: string | null, chat: bigint | null) => ({
  notificationChannel: channel,
  email,
  telegramChatId: chat,
});

describe('deliveryTargets — куда отправить уведомление', () => {
  it('BOTH: и почта, и Telegram', () => {
    expect(deliveryTargets(user('BOTH', 'a@example.ru', 42n))).toEqual({ email: 'a@example.ru', chatId: 42n });
  });

  it('EMAIL: только почта, даже если Telegram привязан', () => {
    expect(deliveryTargets(user('EMAIL', 'a@example.ru', 42n))).toEqual({ email: 'a@example.ru', chatId: null });
  });

  it('TELEGRAM: только Telegram', () => {
    expect(deliveryTargets(user('TELEGRAM', 'a@example.ru', 42n))).toEqual({ email: null, chatId: 42n });
  });

  it('TELEGRAM без привязанного Telegram: уходит на почту, а не теряется', () => {
    expect(deliveryTargets(user('TELEGRAM', 'a@example.ru', null))).toEqual({ email: 'a@example.ru', chatId: null });
  });

  it('EMAIL без почты (вход через Telegram): уходит в Telegram', () => {
    expect(deliveryTargets(user('EMAIL', null, 42n))).toEqual({ email: null, chatId: 42n });
  });

  it('нет ни почты, ни Telegram: отправлять некуда', () => {
    expect(deliveryTargets(user('BOTH', null, null))).toEqual({ email: null, chatId: null });
  });
});
