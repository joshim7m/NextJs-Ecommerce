'use client';

import Link from 'next/link';

export default function Footer({ siteName, mobile, email, address, copyrightText }) {
  const currentYear = new Date().getFullYear();
  const brandName = siteName || 'Cabinet &amp; Closet';

  return (
    <footer className="bg-[#2f0f6b] text-[hsla(0,0%,98.5%,0.8)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{brandName}</h3>
            {address && (
              <p className="text-sm text-[hsla(0,0%,98.5%,0.65)]">{address}</p>
            )}
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

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              {mobile && (
                <li>
                  <a href={`tel:${mobile}`} className="hover:text-white transition">
                    {mobile}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-white transition">
                    {email}
                  </a>
                </li>
              )}
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
        </div>

        <div className="my-8 border-t border-[hsla(0,0%,98.5%,0.15)]" />

        <div className="flex flex-col items-center justify-between space-y-4 text-sm text-[hsla(0,0%,98.5%,0.55)] md:flex-row">
          <p>{copyrightText || `© ${currentYear} ${brandName}. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
}
