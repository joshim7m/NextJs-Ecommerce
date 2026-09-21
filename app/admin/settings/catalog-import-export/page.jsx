'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div className="fixed left-4 right-4 top-20 z-50 animate-fade-in sm:left-auto sm:right-6">
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md sm:px-5 sm:py-3.5 ${
          isSuccess
            ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
            : 'border-red-200 bg-red-50/95 text-red-800'
        }`}
      >
        {isSuccess ? (
          <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className={`ml-2 shrink-0 rounded-lg p-1 transition ${
            isSuccess ? 'hover:bg-emerald-100' : 'hover:bg-red-100'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function CatalogImportExportPage() {
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [report, setReport] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [jobs, setJobs] = useState({ exports: [], imports: [] });
  const [reportedJobId, setReportedJobId] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/catalog/jobs');
      if (res.ok) setJobs(await res.json());
    } catch {
      /* transient poll error: keep the last snapshot */
    }
  }, []);

  const jobsActive = [...jobs.exports, ...jobs.imports].some(
    (j) => j.status === 'queued' || j.status === 'processing'
  );

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!jobsActive) return;
    const timer = setInterval(loadJobs, 2500);
    return () => clearInterval(timer);
  }, [jobsActive, loadJobs]);

  // Surface the import report once the queued import job completes.
  useEffect(() => {
    if (!reportedJobId) return;
    const job = jobs.imports.find((j) => j.id === reportedJobId);
    if (job && job.status === 'completed') {
      setReport({
        imported: job.imported ?? 0,
        skipped: job.skipped ?? 0,
        errors: Array.isArray(job.errors) ? job.errors : [],
      });
      showToast('success', `Import finished: ${job.imported ?? 0} imported, ${job.skipped ?? 0} skipped`);
      setReportedJobId(null);
    }
  }, [jobs, reportedJobId]);

  const formatDateTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/catalog/export/start', { method: 'POST' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Export failed');
      }

      showToast('success', 'Export started — progress will update below');
      loadJobs();
    } catch (err) {
      showToast('error', err.message || 'Failed to start export');
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setReport(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast('error', 'Please select a .zip, .csv or .xlsx file first');
      return;
    }

    const ext = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!['.zip', '.csv', '.xlsx'].includes(ext)) {
      showToast('error', 'Only .zip, .csv and .xlsx files are supported');
      return;
    }

    setImporting(true);
    setReport(null);
    setShowErrors(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/admin/catalog/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      showToast('success', 'Import started — progress will update below');
      setReportedJobId(data.id);
      loadJobs();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to import catalog');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Catalog Import / Export</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Export products as a ZIP (CSV + images) or import from a ZIP / CSV / XLSX file.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Export Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Export</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Download catalog as ZIP</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Exports all products with their categories into a single{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono dark:bg-slate-700">products.csv</code>{' '}
              plus an <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono dark:bg-slate-700">images/</code>{' '}
              folder, zipped together.
            </p>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              {exporting ? (
                <>
                  <Spinner />
                  Starting export...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Catalog
                </>
              )}
            </button>
          </div>

          {/* Import Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Import</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload ZIP / CSV / XLSX</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Products with an existing SKU are skipped — existing data is never overwritten. Categories are matched
              by name and created automatically when missing.
            </p>

            <div className="mt-6">
              <label
                htmlFor="catalog-file"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-amber-500 dark:hover:text-amber-400"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {selectedFile ? selectedFile.name : 'Choose .zip, .csv or .xlsx file'}
              </label>
              <input
                id="catalog-file"
                ref={fileInputRef}
                type="file"
                accept=".zip,.csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <button
              onClick={handleImport}
              disabled={importing || !selectedFile}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              {importing ? (
                <>
                  <Spinner />
                  Importing... this may take a while
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Catalog
                </>
              )}
            </button>
          </div>
        </div>

        {/* Import Report */}
        {report && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Import Report</h2>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{report.imported}</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Imported</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{report.skipped}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Skipped</p>
              </div>
              <div className={`rounded-lg border p-4 ${report.errors.length ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40'}`}>
                <p className={`text-2xl font-bold ${report.errors.length ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {report.errors.length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Errors</p>
              </div>
            </div>

            {report.errors.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowErrors(!showErrors)}
                  className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  {showErrors ? 'Hide' : 'Show'} {report.errors.length} error{report.errors.length > 1 ? 's' : ''}
                </button>

                {showErrors && (
                  <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {report.errors.map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Jobs */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Jobs</h2>
            <button
              type="button"
              onClick={loadJobs}
              className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Started</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Progress</th>
                  <th className="py-2 pr-4 font-medium">Result</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {jobs.exports.map((job) => (
                  <tr key={job.id}>
                    <td className="py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-200">Export</td>
                    <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">{formatDateTime(job.createdAt)}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : job.status === 'failed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-cyan-500 transition-all"
                            style={{
                              width: job.total ? `${Math.min(100, ((job.processed || 0) / job.total) * 100)}%` : '0%',
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {job.processed ?? 0}/{job.total ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-slate-500 dark:text-slate-400">
                      {job.error ? (
                        <span title={job.error} className="block max-w-xs truncate text-red-600 dark:text-red-400">
                          {job.error}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 text-right">
                      {job.status === 'completed' && job.filePath ? (
                        <a
                          href={`/api/admin/catalog/export/${job.id}/download`}
                          className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                        >
                          Download ZIP
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {jobs.imports.map((job) => (
                  <tr key={job.id}>
                    <td className="py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-200">Import</td>
                    <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">{formatDateTime(job.createdAt)}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : job.status === 'failed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all"
                            style={{
                              width: job.totalRows
                                ? `${Math.min(100, ((job.processed || 0) / job.totalRows) * 100)}%`
                                : '0%',
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {job.processed ?? 0}/{job.totalRows ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-slate-500 dark:text-slate-400">
                      {job.error ? (
                        <span title={job.error} className="block max-w-xs truncate text-red-600 dark:text-red-400">
                          {job.error}
                        </span>
                      ) : job.status === 'completed' ? (
                        `${job.imported ?? 0} imported, ${job.skipped ?? 0} skipped`
                      ) : null}
                    </td>
                    <td className="py-2.5" />
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.exports.length === 0 && jobs.imports.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No export/import jobs yet.
              </p>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-sky-800 dark:text-sky-200">
              <p className="font-medium">How it works</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sky-700 dark:text-sky-300">
                <li>Export produces one <code className="rounded bg-sky-100 px-1 py-0.5 font-mono text-xs dark:bg-sky-800">products.csv</code> + real image files in a ZIP</li>
                <li>ZIP imports must contain <code className="rounded bg-sky-100 px-1 py-0.5 font-mono text-xs dark:bg-sky-800">products.csv</code> at the root; plain CSV/XLSX files are auto-detected as products or categories</li>
                <li>Rows with an existing SKU are skipped and reported — nothing is overwritten</li>
                <li>Variants are not included in exports; manage them via the product editor</li>
                <li>Max upload size: 200 MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
