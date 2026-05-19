import type { APIRoute } from 'astro';
import { getUploadPath } from '../../lib/content';
import { readFileSync } from 'node:fs';

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
};

export const GET: APIRoute = async ({ params }) => {
  const path = params.path ?? '';
  const filepath = getUploadPath(`/uploads/${path}`);

  if (!filepath) {
    return new Response('Not found', { status: 404 });
  }

  const ext = filepath.substring(filepath.lastIndexOf('.')).toLowerCase();
  const contentType = MIME[ext] ?? 'application/octet-stream';
  const data = readFileSync(filepath);

  return new Response(data, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
