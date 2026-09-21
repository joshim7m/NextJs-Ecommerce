-- CreateTable
CREATE TABLE "CatalogExportJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "filePath" TEXT,
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogImportJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "imported" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogExportJob_status_idx" ON "CatalogExportJob"("status");

-- CreateIndex
CREATE INDEX "CatalogExportJob_createdAt_idx" ON "CatalogExportJob"("createdAt");

-- CreateIndex
CREATE INDEX "CatalogImportJob_status_idx" ON "CatalogImportJob"("status");

-- CreateIndex
CREATE INDEX "CatalogImportJob_createdAt_idx" ON "CatalogImportJob"("createdAt");

-- AddForeignKey
ALTER TABLE "CatalogExportJob" ADD CONSTRAINT "CatalogExportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogImportJob" ADD CONSTRAINT "CatalogImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
