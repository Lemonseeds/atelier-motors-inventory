import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const secret = process.env.JWT_SECRET || 'development-only-change-this-secret';
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, 'hex');
  const b = scryptSync(password, salt, a.length);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function signToken(user) {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 });
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function readToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    const data = `${header}.${payload}`;
    const expected = createHmac('sha256', secret).update(data).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64url').toString());
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (decodedHeader.alg !== 'HS256' || !Number.isInteger(claims.sub) || claims.exp <= Date.now() / 1000) return null;
    return claims;
  } catch {
    return null;
  }
}
