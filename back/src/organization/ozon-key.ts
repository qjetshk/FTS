// Проверка пары Client ID + API-ключ OZON до создания организации и на странице организации.
// /v1/roles — лёгкий метод «роли и методы ключа»: 200 = ключ рабочий, иначе разбираем код ответа.
const OZON_ROLES_URL = 'https://api-seller.ozon.ru/v1/roles';
const TIMEOUT_MS = 10_000;

export type OzonKeyCheck = { valid: true; expiresAt: string | null } | { valid: false; error: string };

// тексты для юзера: что случилось и что сделать
// реальные ответы: 400/401 «Invalid Api-Key…», 400 «Client-Id header value should be positive integer», 403 «Offer not signed»
function describe(status: number, message: string): string {
  if (/client-id/i.test(message)) return 'Client ID должен быть числом — скопируйте его из личного кабинета OZON.';
  if (status === 401) return 'Ключ не подходит к этому Client ID — проверьте оба значения в личном кабинете OZON.';
  if (/invalid api-key/i.test(message)) return 'Неверный API-ключ — проверьте, что скопировали его полностью, без пробелов.';
  if (status === 403 && /offer/i.test(message)) {
    return 'В личном кабинете OZON не принята оферта — примите её, и доступ к API откроется.';
  }
  if (status === 403) return 'Ключ отозван или у него недостаточно прав — создайте новый ключ в личном кабинете OZON.';
  if (status === 400) return 'OZON не принял данные — проверьте, что Client ID указан цифрами, а ключ скопирован без пробелов.';
  if (status === 429) return 'Слишком много запросов к OZON — подождите минуту и проверьте снова.';
  return 'OZON сейчас не отвечает — попробуйте чуть позже.';
}

export async function checkOzonKey(clientId: string | number, apiKey: string): Promise<OzonKeyCheck> {
  try {
    const res = await fetch(OZON_ROLES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Client-Id': String(clientId), 'Api-Key': apiKey.trim() },
      body: '{}',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) {
      const body = (await res.json().catch(() => ({}))) as { expires_at?: string };
      return { valid: true, expiresAt: body.expires_at ?? null };
    }
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    return { valid: false, error: describe(res.status, body.message ?? '') };
  } catch {
    return { valid: false, error: 'Не удалось связаться с OZON — проверьте подключение и попробуйте снова.' };
  }
}
