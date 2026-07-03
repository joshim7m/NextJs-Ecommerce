'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2f0f6b] text-[hsla(0,0%,98.5%,0.8)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Cabinet &amp; Closet</h3>
            <p className="text-sm text-[hsla(0,0%,98.5%,0.65)]">
              Carefully selected products for your home and everyday style.
            </p>
            <p className="text-xs text-[hsla(0,0%,98.5%,0.5)]">
              Prices in BDT | Dhaka &amp; Nationwide Delivery
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories" className="hover:text-white transition">All Categories</Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Return Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Social</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.facebook.com/CabinetClosetBD/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  Facebook
                </a>
              </li>
              <li>
                <a href="tel:01846897999" className="hover:text-white transition">
                  Call/WhatsApp: 01846897999
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 border-t border-[hsla(0,0%,98.5%,0.15)]" />

        <div className="flex flex-col items-center justify-between space-y-4 text-sm text-[hsla(0,0%,98.5%,0.55)] md:flex-row">
          <p>&copy; {currentYear} Cabinet &amp; Closet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
