'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left panel — brand / info */}
      <div className="hidden flex-1 flex-col justify-between bg-[#2f0f6b] p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-base font-bold text-white">
              C
            </div>
            <span className="text-sm font-semibold text-white/80">Cabinet &amp; Closet</span>
          </div>
        </div>

        <div className="max-w-md">
          <h2 className="mb-4 text-4xl font-bold leading-tight text-white">
            Manage your store<br />
            <span className="text-white/60">from anywhere.</span>
          </h2>
          <p className="text-base leading-relaxed text-white/50">
            Access your admin dashboard to manage products, track orders, and keep your
            business running smoothly.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-white/30">
          <span>&copy; 2026 Cabinet &amp; Closet</span>
          <span className="h-3 w-px bg-white/10" />
          <span>Admin Panel v2.0</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2f0f6b] text-sm font-bold text-white">
              C
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Cabinet &amp; Closet</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-[#2f0f6b] focus:outline-none focus:ring-2 focus:ring-[#2f0f6b]/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-[#2f0f6b] focus:outline-none focus:ring-2 focus:ring-[#2f0f6b]/20"
                placeholder="password"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#2f0f6b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f0f6b]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in\u2026' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400 lg:hidden">
            &copy; 2026 Cabinet &amp; Closet
          </p>
        </div>
      </div>
    </div>
  );
}
