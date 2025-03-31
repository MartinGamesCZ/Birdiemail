
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
