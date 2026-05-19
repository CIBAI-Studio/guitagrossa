import type { APIRoute } from 'astro';
import { saveUpload, readContent, writeContent } from '../../lib/content';

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const type = formData.get('type') as string | null;

  if (!file || !type) {
    return new Response(JSON.stringify({ error: 'Missing file or type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subdir = type === 'gallery' ? 'gallery' : type === 'video' ? 'video' : '';
  const url = await saveUpload(file, subdir);

  const content = readContent();

  if (type === 'gallery') {
    content.gallery.push(url);
    writeContent(content);
  } else if (type === 'video') {
    content.hero.videoFile = url;
    writeContent(content);
  }

  return new Response(JSON.stringify({ ok: true, url }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
