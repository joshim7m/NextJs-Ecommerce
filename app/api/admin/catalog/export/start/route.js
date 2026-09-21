import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/catalog/auth';
import { runCatalogExportJob } from '@/src/lib/catalog/jobs/runner';

export const maxDuration = 300;

export async function POST(request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = await prisma.catalogExportJob.create({ data: { userId: admin.userId ?? null } });

  runCatalogExportJob(job.id).catch(() => {});

  return NextResponse.json({ success: true, id: job.id });
}
