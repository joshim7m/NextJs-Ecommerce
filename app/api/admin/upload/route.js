import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const formData = await request.formData();
  const files = formData.getAll('images');
  const uploaded = [];

  const uploadDir = path.join(process.cwd(), 'public/uploads/products');
  await mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    uploaded.push(`/uploads/products/${filename}`);
  }

  return NextResponse.json({ urls: uploaded });
}
