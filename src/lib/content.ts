import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DATA_DIR = resolve(process.cwd(), 'data');
const UPLOADS_DIR = join(DATA_DIR, 'uploads');
const SITE_FILE = join(DATA_DIR, 'site.json');

function ensureDirs() {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    videoFile: string;
  };
  historia: {
    timeline: Array<{
      year: string;
      title: string;
      text: string;
      image: string;
    }>;
  };
  gallery: string[];
  contacte: {
    formAction: string;
  };
}

export function readContent(): SiteContent {
  return JSON.parse(readFileSync(SITE_FILE, 'utf-8'));
}

export function writeContent(content: SiteContent): void {
  writeFileSync(SITE_FILE, JSON.stringify(content, null, 2), 'utf-8');
}

export async function saveUpload(file: File, subdir: string = ''): Promise<string> {
  ensureDirs();
  const dir = subdir ? join(UPLOADS_DIR, subdir) : UPLOADS_DIR;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const ts = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${ts}-${safeName}`;
  const filepath = join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(filepath, buffer);

  return subdir ? `/uploads/${subdir}/${filename}` : `/uploads/${filename}`;
}

export function deleteUpload(urlPath: string): boolean {
  const relative = urlPath.replace(/^\/uploads\//, '');
  const filepath = join(UPLOADS_DIR, relative);
  if (existsSync(filepath)) {
    unlinkSync(filepath);
    return true;
  }
  return false;
}

export function getUploadPath(urlPath: string): string | null {
  const relative = urlPath.replace(/^\/uploads\//, '');
  const filepath = join(UPLOADS_DIR, relative);
  if (!filepath.startsWith(UPLOADS_DIR)) return null;
  if (!existsSync(filepath)) return null;
  return filepath;
}

export function listUploads(subdir: string = ''): string[] {
  ensureDirs();
  const dir = subdir ? join(UPLOADS_DIR, subdir) : UPLOADS_DIR;
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .map(f => subdir ? `/uploads/${subdir}/${f}` : `/uploads/${f}`);
}
