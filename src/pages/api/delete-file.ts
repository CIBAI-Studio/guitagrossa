import type { APIRoute } from 'astro';
import { deleteUpload, readContent, writeContent } from '../../lib/content';

export const POST: APIRoute = async ({ request }) => {
  const { url, type } = await request.json();

  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing url' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (url.startsWith('/uploads/')) {
    deleteUpload(url);
  }

  const content = readContent();

  if (type === 'gallery') {
    content.gallery = content.gallery.filter((img: string) => img !== url);
    writeContent(content);
  } else if (type === 'video') {
    content.hero.videoFile = '';
    writeContent(content);
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
