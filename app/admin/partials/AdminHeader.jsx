'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function AdminHeader({ onMenuToggle, currentTitle, onLogout, loggingOut }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

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

  const handleDropdownLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg sm:px-6 lg:pl-72">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-none">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="truncate text-lg font-semibold text-slate-900">{currentTitle}</h1>
      </div>

      {/* Center: search */}
      <div ref={searchRef} className="relative mx-auto w-full max-w-md px-4 hidden sm:block">
        <svg className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search orders by number..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#2f0f6b] focus:outline-none focus:ring-2 focus:ring-[#2f0f6b]/15 focus:bg-white"
        />
        {searchOpen && (
          <div className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {searchResults.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.orderNo}`}
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-slate-50"
              >
                <span className="font-medium text-[#2f0f6b]">{o.orderNo}</span>
                <span className="text-xs text-slate-400">{'\u09F3'}{Number(o.total).toLocaleString()}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right: spacer + avatar */}
      <div className="flex items-center justify-end gap-3 flex-1 lg:flex-none">
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f0f6b] text-sm font-semibold text-white transition hover:opacity-90"
          >
            {initials}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-400">{user?.email || 'admin@example.com'}</p>
              </div>
              <button
                type="button"
                onClick={handleDropdownLogout}
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
      </div>
    </header>
  );
}
