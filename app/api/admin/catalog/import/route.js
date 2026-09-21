import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/catalog/auth';
import { runCatalogImportJob } from '@/src/lib/catalog/jobs/runner';
import { importOriginalDir } from '@/src/lib/catalog/storagePaths';
import { sanitizeFilename } from '@/src/lib/catalog/images';
import { MAX_UPLOAD_BYTES, ALLOWED_IMPORT_EXTENSIONS } from '@/src/lib/catalog/constants';

export const maxDuration = 300;

export async function POST(request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const originalName = file.name || 'catalog.csv';
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_IMPORT_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Only ${ALLOWED_IMPORT_EXTENSIONS.join(', ')} files are supported` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 200 MB limit' }, { status: 413 });
    }

    const job = await prisma.catalogImportJob.create({
      data: { userId: admin.userId ?? null, originalName, filePath: '' },
    });

    const storageDir = importOriginalDir();
    await mkdir(storageDir, { recursive: true });
    const storedPath = path.join(storageDir, `${job.id}-${sanitizeFilename(originalName)}`);
    await writeFile(storedPath, buffer);

    await prisma.catalogImportJob.update({
      where: { id: job.id },
      data: { filePath: storedPath },
    });

    runCatalogImportJob(job.id).catch(() => {});

    return NextResponse.json({ success: true, id: job.id });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
