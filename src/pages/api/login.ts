import type { APIRoute } from 'astro';
import { verifyPassword, createSessionToken } from '../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { email, password } = body;

  if (!verifyPassword(email, password)) {
    return new Response(JSON.stringify({ error: 'Credencials incorrectes' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = createSessionToken();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
    },
  });
};
