'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadCart } from '../../lib/cartStorage';
import CartDrawer from './CartDrawer';

const DEBOUNCE_MS = 300;

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

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
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!searchOpen) {
      setSearchQuery('');
      setResults([]);
      setSelectedIndex(-1);
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
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Hotline bar */}
      <div className="bg-[#2f0f6b] text-[hsla(0,0%,98.5%,0.8)]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4 py-1.5 text-xs sm:py-2 sm:text-sm">
          <span className="truncate">Call or WhatsApp us to order:</span>
          <a href="tel:01846897999" className="shrink-0 font-semibold text-white hover:underline">01846897999</a>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-slate-200/50">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-2 px-4 sm:h-14 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0 text-base font-bold text-[#2f0f6b] sm:text-xl">
            Cabinet &amp; Closet
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/categories" className="text-sm font-medium text-slate-600 hover:text-[#2f0f6b] transition">
              Shop
            </Link>
            <Link href="/categories" className="text-sm font-medium text-slate-600 hover:text-[#2f0f6b] transition">
              Categories
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition sm:h-8 sm:w-8"
              title="Search (Ctrl+K)"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition sm:h-8 sm:w-8"
              title="Cart"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#2f0f6b] px-1 text-[10px] font-bold text-white leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Verify yourself (desktop) */}
            <Link
              href="#"
              className="hidden h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition md:inline-flex"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14c-4.42 0-8 1.79-8 4v1h16v-1c0-2.21-3.58-4-8-4Z" />
              </svg>
              Verify yourself
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-[#2f0f6b] transition md:hidden sm:h-8 sm:w-8"
              title="Menu"
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
        <div className="border-b border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Shop
            </Link>
            <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Categories
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cart
            </Link>
            <Link href="#" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Verify yourself
            </Link>
          </div>
        </div>
      ) : null}

      {/* Search overlay */}
      {searchOpen ? (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] bg-black/50 sm:flex sm:items-start sm:justify-center sm:pt-[15vh]"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="flex h-full w-full flex-col bg-white sm:h-auto sm:max-w-lg sm:rounded-xl sm:shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search header on mobile */}
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:hidden">
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
                placeholder="Search for products in the store"
                className="flex-1 border-0 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="shrink-0 text-sm font-medium text-[#2f0f6b]"
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
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#2f0f6b] focus:ring-1 focus:ring-[#2f0f6b]"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2f0f6b] border-t-transparent" />
                </div>
              ) : searchQuery.trim() && results.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No products found.</p>
              ) : results.length > 0 ? (
                <ul className="space-y-1">
                  {results.map((product, i) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => goToProduct(product.slug)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition sm:py-2 ${
                          i === selectedIndex ? 'bg-[#2f0f6b]/10 text-[#2f0f6b]' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {product.image ? (
                          <img src={product.image} alt="" className="h-12 w-12 flex-shrink-0 rounded object-cover sm:h-10 sm:w-10" />
                        ) : (
                          <div className="h-12 w-12 flex-shrink-0 rounded bg-slate-100 sm:h-10 sm:w-10" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{product.title}</p>
                          <p className="text-xs text-slate-500">
                            ৳{product.price.toLocaleString()}
                            {product.originalPrice ? (
                              <span className="ml-1 text-slate-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
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
                  className="mt-2 w-full rounded-lg border border-slate-200 py-3 text-center text-sm font-medium text-[#2f0f6b] hover:bg-slate-50 transition sm:py-2.5"
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
