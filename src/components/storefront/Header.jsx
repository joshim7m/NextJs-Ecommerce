'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadCart } from '../../lib/cartStorage';
import CartDrawer from './CartDrawer';
import AnnouncementBar from './AnnouncementBar';
import MobileFilter from './MobileFilter';

const DEBOUNCE_MS = 300;

export default function Header({ siteName, logo, mobile, announcementText }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentProducts, setRecentProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dark, setDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  useEffect(() => {
    setCartCount(loadCart().reduce((s, i) => s + i.quantity, 0));
    const handler = () => setCartCount(loadCart().reduce((s, i) => s + i.quantity, 0));
    window.addEventListener('storage', handler);
    window.addEventListener('cart-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('cart-updated', handler);
    };
  }, []);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
      fetch('/api/products/recent')
        .then((r) => r.json())
        .then(setRecentProducts)
        .catch(() => {});
    }
    if (!searchOpen) {
      setSearchQuery('');
      setResults([]);
      setSelectedIndex(-1);
      setRecentProducts([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  const fetchResults = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), DEBOUNCE_MS);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      router.push(`/products/${results[selectedIndex].slug}`);
      setSearchOpen(false);
    }
  };

  const goToProduct = (slug) => {
    router.push(`/products/${slug}`);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm dark:bg-slate-900">
      <AnnouncementBar text={announcementText} mobile={mobile} />

      {/* Main header */}
      <div className="border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-2 px-4 sm:h-14 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            {logo ? (
              <img src={logo} alt={siteName || 'Store'} className="h-10 sm:h-14 object-contain" />
            ) : (
              <span className="text-base font-bold text-[#2f0f6b] dark:text-[#a78bfa] sm:text-xl">
                {siteName || 'Cabinet &amp; Closet'}
              </span>
            )}
          </Link>


          {/* Right side icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition sm:h-8 sm:w-8 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-[#a78bfa]"
              title="Search (Ctrl+K)"
              aria-label="Search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition sm:h-8 sm:w-8 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-[#a78bfa]"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Cart */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition sm:h-8 sm:w-8 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-[#a78bfa]"
              title="Cart"
              aria-label="Cart"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#2f0f6b] px-1 text-[10px] font-bold text-white leading-none dark:bg-[#a78bfa]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition sm:h-8 sm:w-8 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-[#a78bfa]"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition md:hidden sm:h-8 sm:w-8 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-[#a78bfa]"
              title="Menu"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen ? (
        <div className="border-b border-slate-200 bg-white md:hidden dark:border-slate-700 dark:bg-slate-900">
          <MobileFilter onClose={() => setMobileMenuOpen(false)} />
        </div>
      ) : null}

      {/* Search overlay */}
      {searchOpen ? (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] bg-black/50 sm:flex sm:items-start sm:justify-center sm:pt-[15vh]"
          onClick={() => setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
        >
          <div
            className="flex h-full w-full flex-col bg-white animate-in slide-in-from-top duration-300 sm:h-auto sm:max-w-lg sm:rounded-xl sm:shadow-xl sm:animate-none dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search header on mobile */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:hidden dark:border-slate-700">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#2f0f6b] focus-within:ring-1 focus-within:ring-[#2f0f6b] dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-[#a78bfa] dark:focus-within:ring-[#a78bfa]">
                <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.34-4.34" />
                  <circle cx="11" cy="11" r="8" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="flex-1 border-0 bg-transparent text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="shrink-0 text-sm font-semibold text-[#2f0f6b] dark:text-[#a78bfa]"
              >
                Cancel
              </button>
            </div>

            {/* Desktop search form */}
            <form onSubmit={handleSubmit} className="hidden p-4 pb-2 sm:block">
              <div className="relative">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.34-4.34" />
                  <circle cx="11" cy="11" r="8" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for products in the store"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#2f0f6b] focus:ring-1 focus:ring-[#2f0f6b] dark:border-slate-600 dark:bg-slate-800 dark:focus:border-[#a78bfa] dark:focus:ring-[#a78bfa]"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 sm:max-h-[50vh]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2f0f6b] border-t-transparent dark:border-[#a78bfa]" />
                </div>
              ) : searchQuery.trim() && results.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No products found.</p>
              ) : !searchQuery.trim() && recentProducts.length > 0 ? (
                <div>
                  <p className="px-1 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recent Products
                  </p>
                  <ul className="space-y-1">
                    {recentProducts.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => goToProduct(product.slug)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {product.image ? (
                            <img src={product.image} alt="" className="h-12 w-12 flex-shrink-0 rounded object-cover sm:h-10 sm:w-10" />
                          ) : (
                            <div className="h-12 w-12 flex-shrink-0 rounded bg-slate-100 dark:bg-slate-700 sm:h-10 sm:w-10" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{product.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ৳{Number(product.unite_price).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : results.length > 0 ? (
                <ul className="space-y-1">
                  {results.map((product, i) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => goToProduct(product.slug)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition sm:py-2 ${
                          i === selectedIndex ? 'bg-[#2f0f6b]/10 text-[#2f0f6b] dark:bg-[#a78bfa]/10 dark:text-[#a78bfa]' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {product.image ? (
                          <img src={product.image} alt="" className="h-12 w-12 flex-shrink-0 rounded object-cover sm:h-10 sm:w-10" />
                        ) : (
                          <div className="h-12 w-12 flex-shrink-0 rounded bg-slate-100 dark:bg-slate-700 sm:h-10 sm:w-10" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{product.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            ৳{product.price.toLocaleString()}
                            {product.originalPrice ? (
                              <span className="ml-1 text-slate-400 line-through dark:text-slate-500">৳{product.originalPrice.toLocaleString()}</span>
                            ) : null}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {searchQuery.trim() && results.length > 0 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-2 w-full rounded-lg border border-slate-200 py-3 text-center text-sm font-medium text-[#2f0f6b] hover:bg-slate-50 transition sm:py-2.5 dark:border-slate-600 dark:text-[#a78bfa] dark:hover:bg-slate-800"
                >
                  See all results for &ldquo;{searchQuery}&rdquo;
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
