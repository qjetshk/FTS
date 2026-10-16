import crypto from 'crypto';
import { decrypt, encrypt } from './crypto.util';

describe('шифрование XML статформ (AES-256-GCM)', () => {
  const key = crypto.randomBytes(32);
  const xml = '<?xml version="1.0" encoding="UTF-8"?><StaticForm><CountryName>КАЗАХСТАН</CountryName></StaticForm>';

  it('расшифровывает то, что зашифровал, с кириллицей', () => {
    expect(decrypt(encrypt(xml, key), key)).toBe(xml);
  });

  it('использует новый вектор инициализации для каждого шифрования', () => {
    const a = encrypt(xml, key);
    const b = encrypt(xml, key);
    expect(a.iv).not.toBe(b.iv);
    expect(a.data).not.toBe(b.data);
  });

  it('не расшифровывает чужим ключом', () => {
    expect(() => decrypt(encrypt(xml, key), crypto.randomBytes(32))).toThrow();
  });

  it('обнаруживает подмену зашифрованных данных', () => {
    const payload = encrypt(xml, key);
    const tampered = { ...payload, data: (payload.data[0] === 'a' ? 'b' : 'a') + payload.data.slice(1) };
    expect(() => decrypt(tampered, key)).toThrow();
  });
});
