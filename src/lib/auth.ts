import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface AuthConfig {
  email: string;
  passwordHash: string;
  salt: string;
}

let _auth: AuthConfig | null = null;
function getAuth(): AuthConfig {
  if (!_auth) {
    const filepath = resolve(process.cwd(), 'data', 'auth.json');
    _auth = JSON.parse(readFileSync(filepath, 'utf-8'));
  }
  return _auth!;
}

let _sessionSecret: string | null = null;
function getSessionSecret(): string {
  if (!_sessionSecret) {
    _sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  }
  return _sessionSecret;
}

export function verifyPassword(email: string, password: string): boolean {
  const auth = getAuth();
  if (email !== auth.email) return false;
  const attempt = createHash('sha256').update(password + auth.salt).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(attempt), Buffer.from(auth.passwordHash));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  const payload = `session:${Date.now()}`;
  const sig = createHash('sha256').update(payload + getSessionSecret()).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  try {
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = createHash('sha256').update(payload + getSessionSecret()).digest('hex');
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
