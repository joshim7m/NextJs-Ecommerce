'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { pushDataLayer } from '../../../src/lib/gtm';

const CONFETTI = [
  { left: '8%', delay: '0.1s', color: '#a78bfa', size: 9, fall: 2.8 },
  { left: '18%', delay: '0.5s', color: '#f472b6', size: 7, fall: 3.2 },
  { left: '30%', delay: '1.1s', color: '#fbbf24', size: 8, fall: 2.5 },
  { left: '42%', delay: '0.3s', color: '#34d399', size: 6, fall: 3.6 },
  { left: '55%', delay: '0.8s', color: '#60a5fa', size: 9, fall: 2.9 },
  { left: '67%', delay: '1.4s', color: '#f87171', size: 7, fall: 3.3 },
  { left: '78%', delay: '0.6s', color: '#a78bfa', size: 6, fall: 3.0 },
  { left: '88%', delay: '1.0s', color: '#fbbf24', size: 9, fall: 2.7 },
  { left: '95%', delay: '0.2s', color: '#34d399', size: 7, fall: 3.4 },
];

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get('orderNo');

  useEffect(() => {
    const raw = sessionStorage.getItem('gtm_purchase');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        pushDataLayer('purchase', { ecommerce: data });
      } catch {}
      sessionStorage.removeItem('gtm_purchase');
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-3rem)] w-full bg-gradient-to-b from-[#2f0f6b] via-[#4c1d95] to-[#2f0f6b] relative overflow-hidden sm:min-h-[calc(100vh-3.5rem)] dark:from-[#150529] dark:via-[#1a093f] dark:to-[#150529]">
      <style>{`
        @keyframes tp-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes tp-rise { 0% { transform: translateY(24px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes tp-confetti { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(110vh) rotate(540deg); opacity: 0; } }
        @keyframes tp-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0.45); } 50% { box-shadow: 0 0 0 14px rgba(167,139,250,0); } }
        .tp-pop { animation: tp-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both 0.2s; }
        .tp-rise { animation: tp-rise 0.6s ease-out both; }
        .tp-confetti { position: absolute; top: 0; border-radius: 40%; animation-name: tp-confetti; animation-timing-function: ease-in; animation-iteration-count: infinite; }
        .tp-pulse { animation: tp-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Confetti */}
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="tp-confetti"
          style={{ left: c.left, width: c.size, height: c.size, backgroundColor: c.color, animationDelay: c.delay, animationDuration: `${c.fall}s` }}
        />
      ))}

      <div className="relative z-10 flex min-h-[inherit] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-lg sm:p-10 dark:bg-white/5">
          {/* Animated check */}
          <div className="tp-pop tp-pulse mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="tp-rise text-3xl font-bold text-white sm:text-4xl" style={{ animationDelay: '0.45s', animationFillMode: 'both' }}>
            আপনার অর্ডারের জন্য ধন্যবাদ
          </h1>
          <p className="tp-rise mt-3 text-white/70" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
            অভিনন্দন! আপনার অর্ডার গ্রহণ করা হয়েছে এবং প্রক্রিয়াধীন রয়েছে।
          </p>

          {orderNo ? (
            <p className="tp-rise mt-6 inline-block rounded-xl bg-white/15 px-6 py-3 text-lg font-semibold text-white ring-1 ring-white/20" style={{ animationDelay: '0.75s', animationFillMode: 'both' }}>
              Order No: {orderNo}
            </p>
          ) : null}

          <p className="tp-rise mt-4 text-sm text-white/60" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
            আমরা শীঘ্রই শিপিং বিবরণ নিয়ে আপনার সাথে যোগাযোগ করব।
          </p>

          <div className="tp-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '1.05s', animationFillMode: 'both' }}>
            <Link
              href="/"
              className="w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#2f0f6b] shadow-lg transition hover:bg-white/90 active:scale-95 sm:w-auto dark:text-[#a78bfa]"
            >
              শপিং চালিয়ে যান
            </Link>
            <Link
              href="/hot-sales"
              className="w-full rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20 active:scale-95 sm:w-auto"
            >
              🔥 হট সেলস
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3rem)] bg-gradient-to-b from-[#2f0f6b] to-[#4c1d95] sm:min-h-[calc(100vh-3.5rem)] dark:from-[#150529] dark:to-[#1a093f]" />
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
