import { mkdir, rm } from 'fs/promises';
import path from 'path';
import prisma from '@/src/lib/prisma';
import { buildCatalogZip } from '../runExport';
import { importCatalogFile } from '../runImport';
import { exportDir, catalogTmpDir } from '../storagePaths';
import { STATUS_PROCESSING, STATUS_COMPLETED, STATUS_FAILED } from '../constants';

export async function runCatalogExportJob(jobId) {
  const job = await prisma.catalogExportJob.findUnique({ where: { id: jobId } });
  if (!job || job.status === STATUS_PROCESSING || job.status === STATUS_COMPLETED) return;

  const zipPath = path.join(exportDir(), `catalog-export-${jobId}.zip`);
  const zipDir = path.dirname(zipPath);

  try {
    await mkdir(zipDir, { recursive: true });

    await prisma.catalogExportJob.update({
      where: { id: jobId },
      data: {
        status: STATUS_PROCESSING,
        processed: 0,
        error: null,
        total: await prisma.product.count(),
      },
    });

    const { count } = await buildCatalogZip({
      workDir: catalogTmpDir(jobId),
      zipPath,
      onProgress: ({ total, processed }) =>
        prisma.catalogExportJob.update({ where: { id: jobId }, data: { total, processed } }),
    });

    await prisma.catalogExportJob.update({
      where: { id: jobId },
      data: {
        status: STATUS_COMPLETED,
        filePath: zipPath,
        processed: count,
        total: count,
      },
    });
  } catch (error) {
    await prisma.catalogExportJob.update({
      where: { id: jobId },
      data: { status: STATUS_FAILED, error: error.message || String(error) },
    });
  } finally {
    await rm(catalogTmpDir(jobId), { recursive: true, force: true }).catch(() => {});
  }
}

export async function runCatalogImportJob(jobId) {
  const job = await prisma.catalogImportJob.findUnique({ where: { id: jobId } });
  if (!job || job.status === STATUS_PROCESSING || job.status === STATUS_COMPLETED) return;

  const tmpDir = catalogTmpDir(jobId);

  try {
    await mkdir(tmpDir, { recursive: true });
    await prisma.catalogImportJob.update({ where: { id: jobId }, data: { status: STATUS_PROCESSING, error: null } });

    const report = await importCatalogFile(job.filePath, job.originalName, tmpDir, {
      onCount: ({ total }) =>
        prisma.catalogImportJob.update({ where: { id: jobId }, data: { totalRows: total } }),
      onProgress: ({ processed, imported, skipped, errors }) =>
        prisma.catalogImportJob.update({
          where: { id: jobId },
          data: { processed, imported, skipped, errors },
        }),
    });

    await prisma.catalogImportJob.update({
      where: { id: jobId },
      data: {
        status: STATUS_COMPLETED,
        imported: report.imported,
        skipped: report.skipped,
        errors: report.errors,
        processed: report.imported + report.skipped,
      },
    });
  } catch (error) {
    await prisma.catalogImportJob.update({
      where: { id: jobId },
      data: { status: STATUS_FAILED, error: error.message || String(error) },
    });
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
