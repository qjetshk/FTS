import { decrypt, encrypt } from './crypto.util';

// Шифрование отдельных полей БД (API-ключ OZON, документ декларанта) — AES-256-GCM, строка «enc:v1:iv:tag:data».
// Свой ключ DATA_ENCRYPTION_KEY, не XML_ENCRYPTION_KEY: ротация одного не требует перешифровки другого.
const PREFIX = 'enc:v1:';

function dataKey(): Buffer {
  const key = Buffer.from(process.env.DATA_ENCRYPTION_KEY ?? '', 'hex');
  if (key.length !== 32) throw new Error('DATA_ENCRYPTION_KEY должен быть 32 байта в hex');
  return key;
}

export function isEncryptedField(value: string): boolean {
  return value.startsWith(PREFIX);
}

export function encryptField(value: string): string;
export function encryptField(value: string | null): string | null;
export function encryptField(value: string | null): string | null {
  if (value === null || isEncryptedField(value)) return value;
  const { iv, tag, data } = encrypt(value, dataKey());
  return `${PREFIX}${iv}:${tag}:${data}`;
}

export function decryptField(value: string): string;
export function decryptField(value: string | null): string | null;
export function decryptField(value: string | null): string | null {
  // открытое значение — строка, записанная до шифрования (до прогона scripts/encrypt-fields.ts)
  if (value === null || !isEncryptedField(value)) return value;
  const [iv, tag, data] = value.slice(PREFIX.length).split(':');
  return decrypt({ iv, tag, data }, dataKey());
}

// на фронт ключ не отдаём — только хвост, чтобы юзер узнал, какой ключ сохранён
export function maskSecret(value: string): string {
  return `••••${decryptField(value).slice(-4)}`;
}

type DocumentSecrets = { series: string | null; number: string; issuedBy: string };

export function encryptDocument<T extends Partial<DocumentSecrets>>(doc: T): T {
  return {
    ...doc,
    ...(doc.series !== undefined && { series: encryptField(doc.series) }),
    ...(doc.number !== undefined && { number: encryptField(doc.number) }),
    ...(doc.issuedBy !== undefined && { issuedBy: encryptField(doc.issuedBy) }),
  };
}

export function decryptDocument<T extends DocumentSecrets>(doc: T): T;
export function decryptDocument<T extends DocumentSecrets>(doc: T | null): T | null;
export function decryptDocument<T extends DocumentSecrets>(doc: T | null): T | null {
  if (!doc) return doc;
  return { ...doc, series: decryptField(doc.series), number: decryptField(doc.number), issuedBy: decryptField(doc.issuedBy) };
}
