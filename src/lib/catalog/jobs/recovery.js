import prisma from '@/src/lib/prisma';
import { STATUS_PROCESSING, STATUS_FAILED } from '../constants';

let ran = false;

export async function markOrphanedJobsFailed() {
  if (ran) return;
  ran = true;

  await prisma.catalogExportJob.updateMany({
    where: { status: STATUS_PROCESSING },
    data: { status: STATUS_FAILED, error: 'Processing was interrupted by a server restart.' },
  });
  await prisma.catalogImportJob.updateMany({
    where: { status: STATUS_PROCESSING },
    data: { status: STATUS_FAILED, error: 'Processing was interrupted by a server restart.' },
  });
}
