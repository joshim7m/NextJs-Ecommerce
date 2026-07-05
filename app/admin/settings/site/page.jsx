'use client';

import { useEffect, useState } from 'react';

function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div className="fixed right-6 top-20 z-50 animate-fade-in">
      <div
        className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg backdrop-blur-md ${
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
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={() => {}}
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

function Skeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-8">
      <div>
        <div className="mb-2 h-7 w-48 rounded-lg bg-slate-200" />
        <div className="h-4 w-72 rounded-lg bg-slate-100" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-4 w-24 rounded bg-slate-200" />
          <div className="space-y-4">
            <div className="h-10 w-full rounded-lg bg-slate-100" />
            <div className="h-10 w-full rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
      <div className="h-10 w-36 rounded-lg bg-slate-200" />
    </div>
  );
}

function ImageUpload({ label, value, field, onUpload, onRemove }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:shadow-md">
            <div
              className={`flex items-center justify-center ${
                field === 'favicon' ? 'h-16 w-16' : 'h-24 w-52'
              }`}
            >
              <img
                src={value}
                alt={label}
                className={`${field === 'favicon' ? 'h-10 w-10' : 'h-full w-full object-contain p-2'}`}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(field)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-400 opacity-0 shadow-sm transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-300 transition hover:border-slate-300 ${
              field === 'favicon' ? 'h-16 w-16' : 'h-24 w-52'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Upload</span>
            </div>
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Choose File
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) onUpload(field, e.target.files[0]);
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, rows }) {
  const baseCls =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-[#2f0f6b] focus:outline-none focus:ring-2 focus:ring-[#2f0f6b]/15';

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseCls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseCls}
        />
      )}
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </div>
  );
}

export default function SiteSettingsPage() {
  const [form, setForm] = useState({
    siteName: '',
    logo: '',
    favicon: '',
    mobile: '',
    email: '',
    address: '',
    copyrightText: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/admin/settings/site')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setForm({
          siteName: data.siteName || '',
          logo: data.logo || '',
          favicon: data.favicon || '',
          mobile: data.mobile || '',
          email: data.email || '',
          address: data.address || '',
          copyrightText: data.copyrightText || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleUpload = async (field, file) => {
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
  };

  const handleRemove = (field) => {
    setForm((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setToast({ type: 'success', message: 'Settings saved successfully.' });
      } else {
        setToast({ type: 'error', message: 'Failed to save settings.' });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton />;

  return (
    <div className="mx-auto max-w-3xl">
      <Toast toast={toast} />

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f0f6b]/10">
            <svg className="h-5 w-5 text-[#2f0f6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Site Setting</h1>
            <p className="mt-0.5 text-sm text-slate-500">Manage your site branding and contact information.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Branding Section */}
        <SectionCard title="Branding" description="Your site identity and visual assets.">
          <InputField
            label="Company Name"
            value={form.siteName}
            onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))}
            placeholder="Your Company Name"
          />

          <ImageUpload
            label="Logo"
            field="logo"
            value={form.logo}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />

          <ImageUpload
            label="Favicon"
            field="favicon"
            value={form.favicon}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />
        </SectionCard>

        {/* Contact Section */}
        <SectionCard title="Contact" description="How customers can reach you.">
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Mobile"
              value={form.mobile}
              onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
              placeholder="+880 1XXX-XXXXXX"
            />
            <InputField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="contact@example.com"
            />
          </div>
          <InputField
            label="Address"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Enter your business address"
            rows={3}
          />
        </SectionCard>

        {/* Footer Section */}
        <SectionCard title="Footer" description="Copyright text displayed in your site footer.">
          <InputField
            label="Copyright Text"
            value={form.copyrightText}
            onChange={(e) => setForm((prev) => ({ ...prev, copyrightText: e.target.value }))}
            placeholder="© 2026 Your Company. All rights reserved."
          />
        </SectionCard>

        {/* Actions */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-xs text-slate-400">All changes are saved immediately to your site.</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2f0f6b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f0f6b]/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2f0f6b]/30 disabled:opacity-50"
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
