import { NextResponse } from 'next/server';
import { stat, readFile } from 'fs/promises';
import path from 'path';

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));

export async function GET(request, { params }) {
  try {
    const { path: segments } = await params;
    const relative = segments.map(decodeURIComponent).join('/');
    const filepath = path.resolve(UPLOAD_DIR, relative);

    if (!filepath.startsWith(UPLOAD_DIR + path.sep)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const info = await stat(filepath);
    if (!info.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ext = path.extname(filepath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
    const data = await readFile(filepath);

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
