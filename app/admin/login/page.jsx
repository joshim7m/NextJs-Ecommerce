'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings/site')
      .then((r) => r.json())
      .then((data) => {
        if (data.siteName) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const siteName = settings?.siteName || 'Admin Panel';
  const logoUrl = settings?.logo;
  const copyright = settings?.copyrightText || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const initial = siteName.charAt(0).toUpperCase();

  if (settingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f0f6b] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Panel — Branding */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2f0f6b] via-[#3d1a7a] to-[#1f0947]" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12" style={{ minHeight: '100vh' }}>
          <div className="animate-fade-in">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-10 w-auto brightness-0 invert"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
                  {initial}
                </div>
                <span className="text-sm font-semibold tracking-wide text-white/80">{siteName}</span>
              </div>
            )}
          </div>

          <div className="animate-fade-in max-w-md" style={{ animationDelay: '0.15s' }}>
            <h2 className="mb-5 text-4xl font-bold leading-tight text-white">
              Welcome back to
              <br />
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {siteName}
              </span>
            </h2>
            <p className="text-base leading-relaxed text-white/50">
              Sign in to manage products, track orders, and keep your business running smoothly.
            </p>
          </div>

          <div className="animate-fade-in flex items-center gap-4 text-xs text-white/25" style={{ animationDelay: '0.3s' }}>
            <span>{copyright}</span>
            <span className="h-3 w-px bg-white/10" />
            <span>v2.0</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Mobile Brand */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-9 w-auto" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2f0f6b] text-sm font-bold text-white shadow-lg">
                {initial}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{siteName}</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          {/* Desktop Logo (above form) */}
          <div className="mb-10 hidden lg:block">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="mb-6 h-10 w-auto" />
            ) : (
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f0f6b] text-sm font-bold text-white shadow-lg">
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{siteName}</p>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">Enter your credentials to continue.</p>
          </div>

          {/* Mobile Title */}
          <div className="mb-8 lg:hidden">
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-[#2f0f6b] focus:outline-none focus:ring-4 focus:ring-[#2f0f6b]/10"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-[#2f0f6b] focus:outline-none focus:ring-4 focus:ring-[#2f0f6b]/10"
                  placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex animate-fade-in items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-[#2f0f6b] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2f0f6b]/20 transition-all hover:bg-[#2f0f6b]/90 hover:shadow-xl hover:shadow-[#2f0f6b]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </span>
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-gray-400 lg:hidden">
            {copyright}
          </p>
        </div>
      </div>
    </div>
  );
}
