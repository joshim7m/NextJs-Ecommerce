'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Categories', href: '/admin/categories', icon: 'categories' },
  { label: 'Products', href: '/admin/products', icon: 'products' },
  { label: 'Orders', href: '/admin/orders', icon: 'orders' },
];

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/categories': 'Categories',
  '/admin/products': 'Products',
  '/admin/products/create': 'Create Product',
  '/admin/products/edit': 'Edit Product',
  '/admin/orders': 'Orders',
  '/admin/orders/': 'Order Detail',
};

function NavIcon({ icon }) {
  const cls = 'h-5 w-5';
  switch (icon) {
    case 'dashboard':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'categories':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case 'products':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'orders':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const isLogin = pathname === '/admin/login';

  const handleLogout = async () => {
    setLoggingOut(true);
    setDropdownOpen(false);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    router.push('/admin/login');
  };

  const fetchOrders = useCallback(async (q) => {
    if (!q.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data);
      setSearchOpen(data.length > 0);
    } catch {
      setSearchResults([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchOrders]);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (isLogin) {
    return <>{children}</>;
  }

  const currentTitle = Object.entries(pageTitles).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f0f6b] text-sm font-bold text-white">C</div>
            <span className="text-sm font-semibold text-slate-900">Cabinet &amp; Closet</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[#2f0f6b]/10 text-[#2f0f6b]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 px-3 py-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {loggingOut ? 'Logging out\u2026' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg sm:px-6 lg:pl-72">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden min-w-0 sm:block">
          <h1 className="truncate text-lg font-semibold text-slate-900">{currentTitle}</h1>
        </div>

        {/* Search */}
        <div ref={searchRef} className="relative ml-auto max-w-xs flex-1 sm:max-w-sm">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#2f0f6b] focus:outline-none focus:ring-2 focus:ring-[#2f0f6b]/15"
          />
          {searchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {searchResults.map((o) => (
                  <Link
                  key={o.id}
                  href={`/admin/orders/${o.orderNo}`}
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="flex items-center justify-between px-3 py-2.5 text-sm transition hover:bg-slate-50"
                >
                  <span className="font-medium text-[#2f0f6b]">{o.orderNo}</span>
                  <span className="text-xs text-slate-400">${Number(o.total).toFixed(2)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Avatar with dropdown */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f0f6b] text-sm font-semibold text-white transition hover:opacity-90"
          >
            A
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">Admin</p>
                <p className="text-xs text-slate-400">admin@example.com</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {loggingOut ? 'Logging out\u2026' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
