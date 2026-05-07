import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

export interface EncryptedPayload {
  iv: string;
  tag: string;
  data: string;
}

export function encrypt(text: string, key: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('hex'),
  };
}

export function decrypt(payload: EncryptedPayload, key: Buffer) {
  const decipher = crypto.createDecipheriv(
    ALGO,
    key,
    Buffer.from(payload.iv, 'hex'),
  );

  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
