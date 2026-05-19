import { createHash, timingSafeEqual } from 'node:crypto';

const EMAIL = import.meta.env.ADMIN_EMAIL ?? '';
const HASH = import.meta.env.ADMIN_PASSWORD_HASH ?? '';
const SALT = import.meta.env.ADMIN_SALT ?? '';
const SECRET = import.meta.env.SESSION_SECRET ?? '';

export function verifyPassword(email: string, password: string): boolean {
  if (email !== EMAIL) return false;
  const attempt = createHash('sha256').update(password + SALT).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(attempt), Buffer.from(HASH));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  const payload = `session:${Date.now()}`;
  const sig = createHash('sha256').update(payload + SECRET).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  if (!token || !SECRET) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  try {
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = createHash('sha256').update(payload + SECRET).digest('hex');
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function isAuthenticated(request: Request): boolean {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return false;
  return verifySessionToken(decodeURIComponent(match[1]));
}
