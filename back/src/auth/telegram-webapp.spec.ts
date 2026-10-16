import { createHmac } from 'crypto';
import { verifyWebAppInitData, WEBAPP_INIT_DATA_TTL } from './telegram-webapp';

const BOT_TOKEN = '123456:TEST-bot-token';
const NOW = 1_792_000_000;
const USER = JSON.stringify({ id: 4242, first_name: 'Анна', last_name: 'Соколова', username: 'anna_home_shop' });

// подписываем так же, как Telegram
function sign(fields: Record<string, string>, token = BOT_TOKEN) {
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}

const fields = { auth_date: String(NOW - 60), query_id: 'AAE', user: USER };

describe('verifyWebAppInitData — вход из Telegram Mini App', () => {
  it('принимает данные, подписанные токеном бота', () => {
    expect(verifyWebAppInitData(sign(fields), BOT_TOKEN, NOW)).toEqual({
      chatId: 4242n,
      username: 'anna_home_shop',
      name: 'Анна Соколова',
    });
  });

  it('отклоняет подпись чужого бота', () => {
    expect(verifyWebAppInitData(sign(fields, '999:other'), BOT_TOKEN, NOW)).toBeNull();
  });

  it('отклоняет подменённого пользователя', () => {
    const forged = sign(fields).replace(encodeURIComponent('4242'), encodeURIComponent('1'));
    expect(verifyWebAppInitData(forged, BOT_TOKEN, NOW)).toBeNull();
  });

  it('отклоняет данные старше суток', () => {
    const old = sign({ ...fields, auth_date: String(NOW - WEBAPP_INIT_DATA_TTL - 1) });
    expect(verifyWebAppInitData(old, BOT_TOKEN, NOW)).toBeNull();
  });

  it('отклоняет строку без hash и пустую строку', () => {
    expect(verifyWebAppInitData(new URLSearchParams(fields).toString(), BOT_TOKEN, NOW)).toBeNull();
    expect(verifyWebAppInitData('', BOT_TOKEN, NOW)).toBeNull();
  });
});
