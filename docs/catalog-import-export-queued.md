# Catalog Import / Export — Queued Variant (Laravel-Parity Implementation Guide)

This doc extends [`docs/catalog-import-export.md`](./catalog-import-export.md) (the already-implemented **synchronous** variant) to reach **exact feature parity** with the reference Laravel implementation described in `/home/joshim/Laravel/reseller/docs/catalog-import-export.md`:

| Capability | Laravel reference | This doc (Next.js) |
|---|---|---|
| Processing | Queued background job (`queue:work`) | **In-process background task** + DB tracking (no worker process needed) |
| Live progress | `catalog_exports` / `catalog_imports` tables | Prisma `CatalogExportJob` / `CatalogImportJob` models |
| Status polling | `GET /settings/catalog/status` every 2.5 s | `GET /api/admin/catalog/jobs` every 2.5 s |
| Download | `GET /settings/catalog/exports/{export}/download` | `GET /api/admin/catalog/export/[id]/download` |
| Delivered artifact | `catalog-exports-{id}.zip` from `storage/app` | `catalog-export-{id}.zip` from `uploads/catalog/exports/` |
| Duplicate policy | Skip existing SKU / slug rows | identical (already implemented) |
| File format | one `products.csv` + `images/` in a ZIP | identical (already implemented) |

The core chunked logic (`src/lib/catalog/runExport.js`, `runImport.js`) is unchanged — this guide adds the **tracking / dispatch / polling / download** layer around it and deliberately keeps the core functions swappable with a real queue library later (see §9).

---

## 1. Overview

### Why queued here, when the sync variant already works?

The sync variant runs everything inside one HTTP request. That works, but it differs from the Laravel reference in three ways this upgrade fixes:

1. **Timeout-driven flakiness** — export duration is dominated by remote-image downloads; long catalogs risk nginx `504`s. Background execution removes the request-timeout ceiling entirely.
2. **No visibility** — the admin sees only a spinner of unknown duration. With tracking rows + polling, the UI shows a live progress bar (`processed / total`) exactly like the Laravel admin.
3. **No resilience** — an accidental browser close interrupts nothing in a queued run; the job finishes server-side and the finished ZIP waits for download.

### Why DB-tracked in-process tasks instead of a queue library?

This project runs as a **single long-lived instance** (`next start` on a VPS/Docker — see `docs/architecture.md`), with no Redis and no queue packages installed. In-process background execution with DB tracking reproduces the Laravel semantics that matter:

- jobs survive a browser close (the HTTP request returns immediately),
- progress lives in Postgres and survives a server restart for reporting,
- one DB record per run with `queued → processing → completed | failed`.

The one semantic difference: a hard server crash **mid-processing** kills the in-flight run (the DB record stays `processing` — recovered as `failed` on boot, §7) whereas a real queue would retry it. Given the work is re-runnable and imports are idempotent (existing SKUs skip), that is acceptable. If it ever isn't, wrap the same core functions with BullMQ (§9) without touching the file format or the frontend contract.

---

## 2. Schema additions (Prisma)

Append to `prisma/schema.prisma` and run `npx prisma migrate dev --name catalog_transfer_jobs`:

```prisma
model CatalogExportJob {
  id        String   @id @default(uuid())
  userId    String?
  status    String   @default("queued") // queued | processing | completed | failed
  filePath  String?
  total     Int      @default(0)
  processed Int      @default(0)
  error     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([createdAt])
}

model CatalogImportJob {
  id           String   @id @default(uuid())
  userId       String?
  status       String   @default("queued")
  originalName String
  filePath     String
  totalRows    Int      @default(0)
  processed    Int      @default(0)
  imported     Int      @default(0)
  skipped      Int      @default(0)
  errors       Json?    // [{ row: number, message: string }]
  error        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([status])
  @@index([createdAt])
}
```

### Status lifecycle

```
queued → processing → completed
                 ↘ → failed   (boot recovery also marks orphaned `processing` as failed, §7)
```

### Persistent storage layout

Unlike the sync variant (whose work files live in `os.tmpdir()` and die with the request), the final artifacts must **persist** so the download endpoint works minutes or hours after the job ran:

```
<UPLOAD_DIR>/catalog/
├── exports/
│   └── catalog-export-{jobId}.zip        final deliverable (kept until manually purged)
├── imports/original/
│   └── {jobId}-{originalName}            uploaded file (kept for the run; safe to prune)
└── tmp/{jobId}/                          work dir (build files), deleted when the job ends
```

Use `process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')` — the same root `app/api/admin/upload/route.js` and `app/uploads/[...path]/route.js` already use, so nothing depends on `tmpdir()` being large enough for a ZIP that must outlive the request.

---

## 3. Progress-enabled refactor of the core functions

Both core functions already run chunked in ~50-row batches; each only needs a **progress callback** so the job runner can persist `processed` per chunk. Two small signatures change, no logic change:

```js
// src/lib/catalog/runExport.js
export async function buildCatalogZip({ workDir, zipPath, onProgress, totalHint } = {}) {
  // ...
  const total = totalHint ?? (await prisma.product.count());
  await onProgress?.({ total, processed: 0 });          // seeds `total` early
  // inside the chunk loop, after `processed += products.length;`
  await onProgress?.({ total, processed });
}
```

```js
// src/lib/catalog/runImport.js
export async function importCatalogFile(filePath, originalName, workDir, {
  onCount,      // async ({ total }) => void   — called once after row counting
  onProgress,   // async ({ processed, imported, skipped, errors }) => void — per chunk
} = {}) {
  // in importProducts/importCategories, after each ~50-row batch:
  // await onProgress?.({ processed, imported, skipped, errors })
  // and emit `onCount({ total })` once the header has been read
}
```

Keep the current synchronous export path working by making the callbacks optional (as shown) — the stream-download route from the **sync guide §5/§6** can remain as-is if desired, or be pointed at the job runner below. In the code samples in this doc they are optional and the queued layer is purely additive.

---

## 4. Module layout (new files)

```
src/lib/catalog/
├── constants.js       # (existing) + STATUS_* constants
├── paths.js           # (existing) tmp work dirs for streaming routes
├── storagePaths.js    # (new) persistent roots under UPLOAD_DIR
├── runExport.js       # (existing) + optional onProgress
├── runImport.js       # (existing) + optional onCount/onProgress
├── jobs/runner.js     # (new) runCatalogExportJob(id) / runCatalogImportJob(id)
└── jobs/recovery.js   # (new) markOrphanedJobsFailed()
app/api/admin/catalog/
├── export/route.js                  GET   (existing sync download — optional)
├── export/start/route.js            POST  — create job + dispatch
├── export/[id]/download/route.js    GET   — stream the completed ZIP
├── import/route.js                  POST  — store file + create job + dispatch
├── jobs/route.js                    GET   — latest N exports + imports (polled)
└── (existing import route stays valid)   
app/admin/settings/catalog-import-export/page.jsx   (existing page + jobs table)
```

Add to `constants.js`:

```js
export const STATUS_QUEUED = 'queued';
export const STATUS_PROCESSING = 'processing';
export const STATUS_COMPLETED = 'completed';
export const STATUS_FAILED = 'failed';
```

`storagePaths.js`:

```js
import path from 'path';

const root = () => process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export const catalogRoot = () => path.join(root(), 'catalog');
export const exportDir     = () => path.join(catalogRoot(), 'exports');
export const importOriginalDir = () => path.join(catalogRoot(), 'imports', 'original');
export const catalogTmpDir = (jobId) => path.join(catalogRoot(), 'tmp', jobId);
```

---

## 5. API routes

The `/api/admin/*` prefix is already JWT-guarded by `proxy.js`; every handler repeats the inline `requireAdmin()` check (defense in depth, same as the current routes).

| Method | URI | Purpose |
|---|---|---|
| POST | `/api/admin/catalog/export/start` | No body → create `CatalogExportJob`, fire `runCatalogExportJob(id)` |
| GET | `/api/admin/catalog/export/[id]/download` | Stream the finished ZIP (404 unless `completed`) |
| POST | `/api/admin/catalog/import` | multipart `{ file }` → store under `imports/original/`, create `CatalogImportJob`, fire `runCatalogImportJob(id)` |
| GET | `/api/admin/catalog/jobs` | JSON `{ exports, imports }` — the status endpoint the UI polls |

### `POST /api/admin/catalog/export/start/route.js`

```js
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/catalog/auth';
import { runCatalogExportJob } from '@/src/lib/catalog/jobs/runner';

export async function POST(request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const job = await prisma.catalogExportJob.create({ data: { userId: admin.id ?? null } });

  // Fire-and-forget: the request returns immediately; the job runs in this process.
  runCatalogExportJob(job.id).catch(() => {}); // runner handles its own failure state

  return NextResponse.json({ success: true, id: job.id });
}
```

### `GET /api/admin/catalog/export/[id]/download/route.js`

```js
import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/catalog/auth';
import { STATUS_COMPLETED } from '@/src/lib/catalog/constants';

export async function GET(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.catalogExportJob.findUnique({ where: { id } });

  if (!job || job.status !== STATUS_COMPLETED || !job.filePath) {
    return NextResponse.json({ error: 'Export not ready' }, { status: 404 });
  }

  const nodeStream = createReadStream(job.filePath);
  return new Response(Readable.toWeb(nodeStream), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="catalog-export-${job.id}.zip"`,
    },
  });
}
```

### `POST /api/admin/catalog/import/route.js` (replaces the body of the current handler)

Same validation as today (extension whitelist, 200 MB cap) but **returns immediately** after enqueueing; processing happens in the runner:

```js
// after the existing extension/size checks…
const storedPath = path.join(importOriginalDir(), `${jobId}-${sanitizeFilename(originalName)}`);
await writeFile(storedPath, buffer);

const job = await prisma.catalogImportJob.create({
  data: { userId: admin.id ?? null, originalName, filePath: storedPath },
});

runCatalogImportJob(job.id).catch(() => {});

return NextResponse.json({ success: true, id: job.id });
```

> Note: no `finally { rm(workDir) }` here anymore — cleanup moves into the runner so the job can outlive the request.

### `GET /api/admin/catalog/jobs/route.js`

```js
export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const take = 10;
  const exports = await prisma.catalogExportJob.findMany({ orderBy: { createdAt: 'desc' }, take });
  const imports = await prisma.catalogImportJob.findMany({ orderBy: { createdAt: 'desc' }, take });

  return NextResponse.json({ exports, imports });
}
```

---

## 6. The job runner — `src/lib/catalog/jobs/runner.js`

Key points:

- **Idempotence guard**: a job already `processing`/`completed` is skipped (protects against double-dispatch, mirroring the Laravel `if (in_array($import->status, [...])) return;` guard).
- **Failure marking**: there is no queue library to auto-retry, so the runner marks `failed` with the message and *deliberately does not rethrow* (the `.catch(() => {})` in the route is just a belt-and-braces guard).
- **Cleanup mirrors the Laravel job**: export work dir deleted after the ZIP is built and on failure; import extracted dir deleted at the end of either path. The upload original can stay for debugging (prune policy in §8).
- The heavy lifting stays *exactly* the chunked logic already reviewed in the sync guide §6–7.

```js
import { mkdir, rm, readFile, stat } from 'fs/promises';
import path from 'path';
import prisma from '@/src/lib/prisma';
import { buildCatalogZip } from '../runExport';
import { importCatalogFile } from '../runImport';
import { exportDir, catalogTmpDir } from '../storagePaths';
import { STATUS_QUEUED, STATUS_PROCESSING, STATUS_COMPLETED, STATUS_FAILED } from '../constants';

export async function runCatalogExportJob(jobId) {
  const job = await prisma.catalogExportJob.findUnique({ where: { id: jobId } });
  if (!job || job.status === STATUS_PROCESSING || job.status === STATUS_COMPLETED) return;

  const workDir = catalogTmpDir(jobId);
  const zipPath = path.join(exportDir(), `catalog-export-${jobId}.zip`);

  try {
    await mkdir(path.dirname(zipPath), { recursive: true });

    await prisma.catalogExportJob.update({
      where: { id: jobId },
      data: {
        status: STATUS_PROCESSING,
        total: await prisma.product.count(),
        processed: 0,
        error: null,
      },
    });

    await buildCatalogZip({
      workDir,
      zipPath,
      onProgress: ({ total, processed }) =>
        prisma.catalogExportJob.update({ where: { id: jobId }, data: { total, processed } }),
    });

    await prisma.catalogExportJob.update({ where: { id: jobId }, data: { status: STATUS_COMPLETED, filePath: zipPath } });
  } catch (error) {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
    await prisma.catalogExportJob.update({ where: { id: jobId }, data: { status: STATUS_FAILED, error: error.message } });
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function runCatalogImportJob(jobId) {
  const job = await prisma.catalogImportJob.findUnique({ where: { id: jobId } });
  if (!job || job.status === STATUS_PROCESSING || job.status === STATUS_COMPLETED) return;

  const workDir = catalogTmpDir(jobId);
  const extractedDir = path.join(workDir, 'extracted');

  try {
    await mkdir(extractedDir, { recursive: true });
    await prisma.catalogImportJob.update({ where: { id: jobId }, data: { status: STATUS_PROCESSING } });

    const report = await importCatalogFile(job.filePath, job.originalName, workDir, {
      onCount: ({ total }) =>
        prisma.catalogImportJob.update({ where: { id: jobId }, data: { totalRows: total } }),
      onProgress: async ({ processed, imported, skipped, errors }) => {
        await prisma.catalogImportJob.update({
          where: { id: jobId },
          data: {
            processed,
            imported,
            skipped,
            errors, // called once per chunk with the cumulative arrays
          },
        });
      },
    });

    await rm(workDir, { recursive: true, force: true }).catch(() => {});
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
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
    await prisma.catalogImportJob.update({ where: { id: jobId }, data: { status: STATUS_FAILED, error: error.message } });
  }
}
```

> **Laravel-format compatibility (implemented).**

> **Progress shape note.** To keep the import runner simple, `importCatalogFile` reports *cumulative* totals per chunk (`{ processed, imported, skipped, errors }`) rather than `increment()` deltas like Laravel's `increment('processed', …)`. The DB write stays a simple `update` instead of `increment`, and the UI math is identical.

> **Laravel-format compatibility (implemented).** The importer detects Laravel-exported catalogs: `Status` values `active`/`inactive` map to `publish`/`draft` (`STATUS_ALIASES` in `constants.js`), the primary `Category` column is merged with `Categories` by name, and `Specification`/`Featured` are ignored. This schema requires a unique SKU, so blank-SKU rows get a deterministic generated SKU `AUTO-<FULL-SLUG>-<rowNumber>` (no truncation, no suffix loop) resolved *before* the dedupe check — re-uploading the same file skips previously generated rows instead of creating numbered duplicates.

> **Image storage (fixed during implementation).** `image_path` values are `/uploads/<folder>/<file>` and are served by `app/uploads/[...path]`, which reads `UPLOAD_DIR` — **not** `public/`. Both the importer (`runImport.js`) and the exporter (`runExport.js`) resolve local image paths against `UPLOAD_DIR`; earlier code that wrote into `public/uploads/` produced 404s on imported images and only 1 image per export.

> **Zip/Adm memory note (unchanged).** `adm-zip` and the import flow load the uploaded archive into memory — unchanged from the sync implementation and acceptable under the 200 MB cap.

---

## 7. Crash recovery — `src/lib/catalog/jobs/recovery.js`

The Laravel worker requeues released jobs; a next.js process does not. Recovery must be explicit: on **process boot** (or, equivalently, on the first admin `/api/admin/catalog/jobs` request after boot), any job still marked `processing` cannot have a live runner in it — mark it failed:

```js
import prisma from '@/src/lib/prisma';
import { STATUS_PROCESSING, STATUS_FAILED } from '../constants';

let ran = false;

export async function markOrphanedJobsFailed() {
  if (ran) return; // once per process boot is enough
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
```

Call it at the top of the `/api/admin/catalog/jobs` route handler (it resolves in one indexed `UPDATE` and is a no-op after the first call). This gives LTS behavior on restarts identical in effect to Laravel's queue-interruption story: nothing progresses forever, and the admin sees explicit `failed` rows.

> The `queued` state is intentionally *not* auto-recovered — a queued job minutes old with a live runner becomes `processing` within the first 100 ms; an orphaned `queued` job after a restart is evidence the runner never started. Marking it failed prevents a permanently-spinning UI row. (If you prefer re-dispatch, call `runCatalogImportJob(id)` / `runCatalogExportJob(id)` from the recovery pass instead of marking failed — both runners are idempotent.)

---

## 8. Frontend — changes to `app/admin/settings/catalog-import-export/page.jsx`

The page structure stays identical (Toast, cards, import report). Three additions:

1. **"Start export" POSTs to the `start` route** instead of fetching the ZIP inline. Keep the button spinner only until the POST resolves (~instant).
2. **Recent Jobs table** under the two cards, fed by `exports` / `imports` arrays from `/api/admin/catalog/jobs`:

   - Poll every **2.5 s** using a `setInterval` *only while any row is `queued`/`processing`* (same as the Laravel admin), plus one immediate fetch on load.
   - Progress bar per row: `processed / total` (export) and `processed / totalRows` (import); use job `id` React keys.
   - Completed exports render a **Download ZIP** link that navigates to `/api/admin/catalog/export/{id}/download` — the browser handles it like any file link.
   - Failed jobs show `error`; imports with per-row `errors` reuse the existing toggleable `Row N: message` list (source the errors from the job row instead of the inline report).

```jsx
// inside CatalogImportExportPage
const [jobs, setJobs] = useState({ exports: [], imports: [] });

const loadJobs = useCallback(async () => {
  const res = await fetch('/api/admin/catalog/jobs');
  if (res.ok) setJobs({ exports: (await res.json()).exports, imports: (await res.json()).imports });
}, []);

const active = [...jobs.exports, ...jobs.imports]
  .some((j) => j.status === 'queued' || j.status === 'processing');

useEffect(() => {
  if (!active) return;
  const t = setInterval(loadJobs, 2500);
  return () => clearInterval(t);
}, [active, loadJobs]);

useEffect(() => { loadJobs(); }, [loadJobs]);
```

3. **Import completion view** stays the same — instead of the response carrying the report, the progress poll delivers it (read the final row from `jobs.imports` once its status flips to `completed`).

No state persists in the browser; every "job" is recoverable by reloading the page.

---

## 9. Operations / Deployment

- **No new infrastructure.** No worker process, no Redis, nothing to run under the supervisor. `prisma migrate deploy`, then build — this is the only operational delta.
- **Duration is now decoupled from HTTP** — nginx `proxy_read_timeout` stops mattering for correctness; you can leave `proxy_read_timeout 300s` from the sync guide as-is.
- **Upload size** — unchanged (200 MB handler cap; nginx `client_max_body_size 210M` per the sync guide §8).
- **Storage ceiling** — completed export ZIPs accumulate in `<UPLOAD_DIR>/catalog/exports/`. Add a cleanup step (cron / deploy hook) such as: delete ZIPs older than 30 days and `imports/original/` files older than 7 days. The build `tmp/{jobId}/` dirs are self-cleaning (`finally` blocks).
- **Scaling to multiple instances** — the in-process design requires a **single** Node server (the default for this project). If you later run N instances behind a load balancer, move the dispatch to BullMQ:

  ```bash
  npm install bullmq ioredis
  ```

  Replace `runCatalogExportJob(job.id).catch(...)` with `catalogExportQueue.add('export', { id: job.id })`, run a small `node jobs-worker.js` process (supervised) that executes the same `runCatalogExportJob`, and keep everything else (Prisma models, routes, polling, download endpoint, file format) untouched. This is why the runner is a plain async function with no framework coupling.
- **Env vars**: none beyond the existing `DATABASE_URL` (and the existing `UPLOAD_DIR`, already respected by the upload route).

---

## 10. Security

| Concern | Mitigation |
|---|---|
| Unauthorized access | `proxy.js` JWT guard + inline `requireAdmin` per handler (unchanged) |
| Download forging | UUID job ids; download route returns 404 for anything not `completed` with a `filePath` |
| Malicious ZIP (path traversal) | `extractZipGuarded` unchanged from the sync guide (§7) |
| Image filename traversal | `sanitizeFilename` used for stored upload names and image copies (unchanged) |
| Job payload | Dispatch carries only the job id — file is resolved server-side by id, so no user-controlled path ever reaches the runner |
| Unbounded UPDATE purchases | `updateMany` on the two status-column indexes only, once per boot, in `recovery.js` |
| Temp/persistent file leakage | work dirs under `<UPLOAD_DIR>/catalog/tmp/` deleted in `finally`; artifacts kept deliberately (monitor disk §9) |

---

## 11. Testing / manual QA

Layer onto the sync guide's checklist (§13) — the shared-driven scenarios stay valid; add the queued-wheel behaviors:

| Scenario | Expected |
|---|---|
| Start export | POST returns instantly with `{ id }`; a row appears `queued`, moves to `processing`, live progress updates every ~2.5 s |
| Progress accuracy | `processed` ends equal to `total` on the last poll before `completed` |
| Download after close | Close the browser tab mid-export; reopen; job finished with a working **Download ZIP** link (this is the feature the sync variant cannot offer) |
| Download invalid states | 404 for a `queued` / `failed` job id (and for a random UUID) |
| Double-dispatch | Clicking "start export" twice quickly creates two rows and both complete — no shared temp dir corruption (each uses its own tmp path) |
| Failed state | Break e.g. the export images dir permissions → row reports `failed` + `error` message, UI shows it, no stuck spinner |
| Restart mid-export | Kill the process during `processing` → on next boot the row flips to `failed` with the restart message (§7) |
| Restart mid-import | Same as above; re-uploading the same file re-imports only previously-missing rows (SKU dedupe skips the rest) |
| Polling stops | When no job is `queued`/`processing`, the 2.5 s `setInterval` is cleared (verify in the Network tab) |
| Sync guide regressions | Round-trip import of an exported ZIP still reports all `skipped`; Bengali titles survive with the BOM; categories auto-created — all unchanged |

---

## 12. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Job stuck at `queued` / 0% | The runner never started: **check the server logs** for an exception at dispatch; check `DATABASE_URL` is reachable; with multiple instances behind a balancer you hit §9's scaling pitfall — add BullMQ |
| Job stuck at `processing` forever | Process crashed mid-run → reload the jobs table (the boot recovery flips it to `failed`); confirm §7's call site exists in the jobs route |
| Download 404 | Job not `completed`, or the ZIP file was pruned by the cleanup step (§9) / deleted manually |
| Progress not updating | Poll only happens while a row is active — confirm `active` computes the right flags; confirm the Prisma `update` calls are not being swallowed by awaiting from inside a hot loop (they shouldn't be — per-chunk, not per-row) |
| `errors` column shows stale row numbers from a previous run | The runner writes the full cumulative array on each chunk; verify the import progress callback passes `errors` and not a per-batch slice |
| Bytes counted but nothing finishes | Same causes as the sync guide (header mismatch, missing `products.csv` in ZIP) — those surfaces surface as `failed` with the same message |

---

## 13. FAQ / edge cases

- **Why not BullMQ immediately?** It adds a Redis service and a supervised worker process, for a benefit this project only needs under multi-instance scaling. The runner-per-job design keeps the swap trivial (§9).
- **Do we keep the existing inline-sync routes?** Yes. `GET /api/admin/catalog/export` (stream ZIP) and the current `POST /api/admin/catalog/import` still work; the queued routes are additional. If you'd rather have only one way to do it, point the buttons at the queued routes and delete the inline ones.
- **Is concurrent import safe?** Same answer as the sync guide — dedupe happens against live DB state at row-processing time. Two jobs may run at once (each with its own tmp dir); the second reports the first's products as skipped.
- **What about job retention?** We keep all tracking rows (`error` receipts matter for the admin) and only prune **files**. Add a `deleteMany({ createdAt: { lt: … } })` for jobs older than e.g. 90 days if the tables ever grow.
- **Variants, categories-only files, XLSX import, remote images** — unchanged; see the sync guide (§15) — those are file-format semantics, not job semantics.
