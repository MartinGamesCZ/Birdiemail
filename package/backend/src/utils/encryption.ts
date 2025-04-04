import { createCipheriv, createDecipheriv, hash, randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';

export function createUserToken(id: string, hash: string) {
  try {
    return sign(
      {
        type: 'auth.user',
        id: id,
        hash: hash,
      },
      process.env.ENCRYPTION_JWT_SECRET ?? '',
    );
  } catch (e) {
    return null;
  }
}

export function decodeUserToken(token: string) {
  if (!token) return null;

  try {
    const decoded: any = verify(token, process.env.ENCRYPTION_JWT_SECRET ?? '');

    if (!decoded) return null;
    if (decoded.type !== 'auth.user') return null;

    return decoded;
  } catch (e) {
    return null;
  }
}

export function getMailPasswordEncryptionKey(userId: string, password: string) {
  const key = hash('sha256', `${userId}$${password}`, 'hex');

  return key.toString();
}

export function encryptMailPassword(key: string, password: string) {
  const iv = randomBytes(16);
  const keyBuffer = Buffer.from(
    key.length === 64 ? key : hash('sha256', key, 'hex'),
    'hex',
  ).slice(0, 32);

  const cipher = createCipheriv('aes-256-cbc', keyBuffer, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

export function decryptMailPassword(key: string, password: string) {
  try {
    if (!password || !password.includes(':')) return '';

    const [ivHex, encryptedText] = password.split(':', 2);
    if (!ivHex || !encryptedText) return '';

    const iv = Buffer.from(ivHex, 'hex');
    const keyBuffer = Buffer.from(
      key.length === 64 ? key : hash('sha256', key, 'hex'),
      'hex',
    ).slice(0, 32);

    const decipher = createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    return '';
  }
}
