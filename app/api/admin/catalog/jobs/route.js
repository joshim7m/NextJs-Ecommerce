import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/catalog/auth';
import { markOrphanedJobsFailed } from '@/src/lib/catalog/jobs/recovery';

export const maxDuration = 300;

export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await markOrphanedJobsFailed().catch(() => {});

  const take = 10;
  const exports = await prisma.catalogExportJob.findMany({ orderBy: { createdAt: 'desc' }, take });
  const imports = await prisma.catalogImportJob.findMany({ orderBy: { createdAt: 'desc' }, take });

  return NextResponse.json({ exports, imports });
}
