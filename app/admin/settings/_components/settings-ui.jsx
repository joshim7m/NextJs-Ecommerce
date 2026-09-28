'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export const META_TITLE_MAX = 60;
export const META_DESC_MAX = 160;

/** Outline icon paths used by the settings section cards. */
export const SECTION_ICONS = {
  brand:
    'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z',
  contact:
    'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
  notices:
    'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  about:
    'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  seo: 'M12 21a9 9 0 100-18 9 9 0 000 18z M3.6 9h16.8M3.6 15h16.8M12 3c2.5 2.4 3.75 5.4 3.75 9S14.5 18.6 12 21c-2.5-2.4-3.75-5.4-3.75-9S9.5 5.4 12 3z',
  notifications:
    'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  analytics:
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  whatsapp:
    'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
};

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-[#2f0f6b] focus:outline-none focus:ring-2 focus:ring-[#2f0f6b]/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#a78bfa] dark:focus:ring-[#a78bfa]';

export function Toast({ toast, onClose }) {
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
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className={`ml-2 shrink-0 rounded-lg p-1 transition ${
              isSuccess ? 'hover:bg-emerald-100' : 'hover:bg-red-100'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsSkeleton({ sections = 4 }) {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6">
      <div>
        <div className="mb-2 h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-72 rounded-lg bg-slate-100 dark:bg-slate-700/50" />
      </div>
      {Array.from({ length: sections }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6"
        >
          <div className="mb-4 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-4">
            <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-700/50" />
            <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-700/50" />
          </div>
        </div>
      ))}
      <div className="h-14 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function InputField({ label, type = 'text', value, onChange, placeholder, rows, hint, footer }) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          {label}
        </label>
        {footer}
      </div>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputCls} resize-none leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

export function CharCount({ value, max }) {
  const length = (value || '').length;
  const tone =
    length > max
      ? 'text-red-500'
      : length > max * 0.9
        ? 'text-amber-500'
        : 'text-slate-400 dark:text-slate-500';
  return (
    <span className={`text-[11px] font-medium tabular-nums ${tone}`}>
      {length}/{max}
    </span>
  );
}

export function KeywordCount({ value }) {
  const count = (value || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean).length;
  return (
    <span className="text-[11px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
      {count} keyword{count === 1 ? '' : 's'}
    </span>
  );
}

export function ImageUpload({ label, value, field, onUpload, onRemove }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(field, file);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) onUpload(field, e.target.files[0]);
    e.target.value = '';
  };

  const isFavicon = field === 'favicon';

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="flex flex-wrap items-start gap-3">
        {value && (
          <div className="group relative">
            <img
              src={value}
              alt={label}
              className={`rounded-lg border border-slate-200 object-cover dark:border-slate-700 ${
                isFavicon ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-20 w-full max-w-[200px] sm:h-24 sm:w-52'
              }`}
            />
            <button
              type="button"
              onClick={() => onRemove(field)}
              aria-label={`Remove ${label}`}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(false);
          }}
          onDrop={handleDrop}
          className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition ${
            dragging
              ? 'border-[#2f0f6b] bg-[#2f0f6b]/5 text-[#2f0f6b]'
              : 'border-slate-300 text-slate-400 hover:border-[#2f0f6b] hover:text-[#2f0f6b] dark:border-slate-600 dark:text-slate-500 dark:hover:border-[#a78bfa] dark:hover:text-[#a78bfa]'
          } ${isFavicon ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-20 w-full max-w-[200px] sm:h-24 sm:w-52'}`}
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
    </div>
  );
}

export function SectionCard({ title, description, icon, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4 dark:border-slate-700">
        {icon && (
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#2f0f6b]/10 dark:bg-[#a78bfa]/20">
            <svg
              className="h-4 w-4 text-[#2f0f6b] dark:text-[#a78bfa]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}

export function SettingsHeader({ icon, title, subtitle, dirty }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#2f0f6b]/10 dark:bg-[#a78bfa]/20 sm:h-10 sm:w-10">
          <svg
            className="h-4 w-4 text-[#2f0f6b] dark:text-[#a78bfa] sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{title}</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {dirty !== undefined && (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
            dirty
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {dirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
      )}
    </div>
  );
}

export function SaveBar({ dirty, saving, onSave, onDiscard }) {
  return (
    <div className="sticky bottom-0 z-30 mt-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span
            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dirty ? 'bg-amber-500' : 'bg-emerald-500'}`}
          />
          {dirty ? 'You have unsaved changes.' : 'Everything is saved. Shortcut: Ctrl/⌘ + S'}
        </p>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2f0f6b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f0f6b]/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2f0f6b]/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#a78bfa] dark:text-slate-900 dark:hover:bg-[#a78bfa]/90 sm:flex-none"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Google result + social card preview of the SEO fields. */
export function SeoPreview({ form }) {
  const siteName = (form.siteName || '').trim();
  const title = (form.metaTitle || siteName || 'Your site name').trim();
  const description =
    (form.metaDescription || '').trim() ||
    'Add a meta description to control how your pages appear in search results and when shared on social media.';
  const url = (form.siteUrl || '').trim();
  const display = /^https?:\/\//i.test(url) ? url : `https://${url || 'your-site.com'}`;
  const host = display.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

  const ogImage =
    form.ogImage ||
    `/api/og?${new URLSearchParams({
      siteName,
      title,
      subtitle: description.slice(0, 120),
      type: 'website',
    }).toString()}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/40 sm:p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Live preview
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">Google result</p>
          <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-800">
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{host}</p>
            <p className="mt-0.5 line-clamp-1 text-[15px] font-medium text-[#1a0dab] dark:text-[#8ab4f8]">
              {title}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">Social share card</p>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="aspect-[1200/630] w-full bg-slate-100 dark:bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ogImage} alt="Social share preview" className="h-full w-full object-cover" />
            </div>
            <div className="p-3">
              <p className="truncate text-[11px] uppercase text-slate-400 dark:text-slate-500">{host}</p>
              <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                {title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shared load/edit/save behaviour for the settings pages: loads a partial form,
 * tracks unsaved changes, handles image uploads, saves to the page's own API
 * endpoint and re-syncs from the normalized server response.
 */
export function useSettingsForm(endpoint, emptyForm) {
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const saveRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => {
        if (!active || data?.error) return;
        const next = Object.fromEntries(
          Object.keys(emptyForm).map((k) => [k, data?.[k] || ''])
        );
        setForm(next);
        setSaved(next);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [endpoint]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const set = useCallback(
    (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value })),
    []
  );

  const handleUpload = useCallback(async (field, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('images', file);
    fd.append('folder', 'settings');
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.urls?.[0]) {
        setForm((prev) => ({ ...prev, [field]: data.urls[0] }));
      }
    } catch {}
  }, []);

  const handleRemove = useCallback((field) => {
    setForm((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && !data.error) {
        // Re-sync from the response so server-side normalization is reflected
        // and the dirty state clears.
        const next = Object.fromEntries(
          Object.keys(emptyForm).map((k) => [k, data?.[k] ?? ''])
        );
        setForm(next);
        setSaved(next);
        setToast({ type: 'success', message: 'Settings saved successfully.' });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to save settings.' });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }, [endpoint, form]);

  saveRef.current = save;

  // Ctrl/Cmd + S saves, like every other settings form.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const discard = useCallback(() => setForm(saved), [saved]);

  return {
    form,
    set,
    dirty,
    saving,
    loading,
    save,
    discard,
    toast,
    setToast,
    handleUpload,
    handleRemove,
  };
}
