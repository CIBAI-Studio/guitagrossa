import { createHash, timingSafeEqual } from 'node:crypto';
import { config } from 'dotenv';

config();

function env(key: string): string {
  return process.env[key] ?? '';
}

export function verifyPassword(email: string, password: string): boolean {
  if (email !== env('ADMIN_EMAIL')) return false;
  const attempt = createHash('sha256').update(password + env('ADMIN_SALT')).digest('hex');
  const stored = env('ADMIN_PASSWORD_HASH');
  if (!stored) return false;
  try {
    return timingSafeEqual(Buffer.from(attempt), Buffer.from(stored));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  const payload = `session:${Date.now()}`;
  const sig = createHash('sha256').update(payload + env('SESSION_SECRET')).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const secret = env('SESSION_SECRET');
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  try {
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = createHash('sha256').update(payload + secret).digest('hex');
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
