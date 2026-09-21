import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/catalog/auth';
import { STATUS_COMPLETED } from '@/src/lib/catalog/constants';

export const maxDuration = 300;

export async function GET(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.catalogExportJob.findUnique({ where: { id } });

  if (!job || job.status !== STATUS_COMPLETED || !job.filePath) {
    return NextResponse.json({ error: 'Export not ready' }, { status: 404 });
  }

  try {
    await stat(job.filePath);
  } catch {
    return NextResponse.json({ error: 'Export file is missing on the server' }, { status: 404 });
  }

  const nodeStream = createReadStream(job.filePath);

  return new Response(Readable.toWeb(nodeStream), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="catalog-export-${job.id}.zip"`,
    },
  });
}
