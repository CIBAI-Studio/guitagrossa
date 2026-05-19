import type { APIRoute } from 'astro';
import { readContent, writeContent } from '../../lib/content';

export const GET: APIRoute = async () => {
  const content = readContent();
  return new Response(JSON.stringify(content), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ request }) => {
  const updates = await request.json();
  const content = readContent();

  if (updates.hero) Object.assign(content.hero, updates.hero);
  if (updates.historia) content.historia = updates.historia;
  if (updates.gallery) content.gallery = updates.gallery;
  if (updates.contacte) Object.assign(content.contacte, updates.contacte);

  writeContent(content);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
