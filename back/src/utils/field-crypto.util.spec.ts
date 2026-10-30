import crypto from 'crypto';
import { decryptDocument, decryptField, encryptDocument, encryptField, isEncryptedField, maskSecret } from './field-crypto.util';

describe('шифрование полей БД (API-ключ OZON, документ декларанта)', () => {
  const apiKey = '5f0c2a71-9d3e-4b8a-a6c4-1e7b2d9f3c80';

  beforeAll(() => {
    process.env.DATA_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
  });

  it('расшифровывает то, что зашифровал, а в БД нет открытого значения', () => {
    const enc = encryptField(apiKey);
    expect(isEncryptedField(enc)).toBe(true);
    expect(enc).not.toContain(apiKey);
    expect(decryptField(enc)).toBe(apiKey);
  });

  it('не шифрует повторно уже зашифрованное значение', () => {
    const enc = encryptField(apiKey);
    expect(encryptField(enc)).toBe(enc);
  });

  it('отдаёт как есть открытое значение, записанное до шифрования', () => {
    expect(decryptField(apiKey)).toBe(apiKey);
    expect(decryptField(null)).toBeNull();
  });

  it('маска показывает только последние 4 символа ключа', () => {
    expect(maskSecret(encryptField(apiKey))).toBe('••••3c80');
  });

  it('шифрует серию, номер и «кем выдан», остальные поля не трогает', () => {
    const doc = { typeShort: 'ПАСРФ', series: '4510', number: '123456', issuedBy: 'ГУ МВД России по г. Москве' };
    const enc = encryptDocument(doc);
    expect(enc.typeShort).toBe('ПАСРФ');
    expect([enc.series, enc.number, enc.issuedBy].every((v) => isEncryptedField(v!))).toBe(true);
    expect(decryptDocument(enc)).toEqual(doc);
  });

  it('пустая серия остаётся пустой', () => {
    const enc = encryptDocument({ series: null, number: '1', issuedBy: 'x' });
    expect(enc.series).toBeNull();
    expect(decryptDocument(enc).series).toBeNull();
  });

  it('падает без ключа нужной длины', () => {
    const saved = process.env.DATA_ENCRYPTION_KEY;
    process.env.DATA_ENCRYPTION_KEY = 'abcd';
    expect(() => encryptField(apiKey)).toThrow('DATA_ENCRYPTION_KEY');
    process.env.DATA_ENCRYPTION_KEY = saved;
  });
});
