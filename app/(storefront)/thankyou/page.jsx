'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get('orderNo');

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="text-5xl mb-4">✓</div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Thank you for your order</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">Your order has been received and is being processed.</p>
      {orderNo ? (
        <p className="mt-6 rounded-lg bg-slate-50 py-3 text-lg font-semibold text-[#2f0f6b] dark:bg-slate-700 dark:text-[#a78bfa]">
          Order No: {orderNo}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">We will contact you shortly with shipping details.</p>
      <Link href="/categories" className="mt-8 inline-block rounded-xl bg-[#2f0f6b] px-6 py-3 text-white hover:bg-[#2f0f6b]/90 transition dark:bg-[#a78bfa] dark:text-slate-900">
        Continue Shopping
      </Link>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800"><p className="text-slate-500 dark:text-slate-400">Loading...</p></div>}>
        <ThankYouContent />
      </Suspense>
    </section>
  );
}
