'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Hero({ slides = [] }) {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [mounted, slides.length]);

  const goTo = (index) => setCurrent(index);

  if (!slides.length) return null;

  return (
    <section className="relative w-full overflow-hidden rounded-none sm:rounded-2xl">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 sm:aspect-[2.8/1] sm:rounded-2xl">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(${(index - current) * 100}%)` }}
          >
            {slide.image ? (
              <img
                src={slide.image}
                alt={slide.title || ''}
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2f0f6b] to-purple-800 text-white">
                <div className="text-center">
                  <p className="text-lg font-medium opacity-60">Slide {index + 1}</p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            <div className="absolute bottom-6 left-4 text-white sm:bottom-8 sm:left-8">
              {slide.title && (
                <h2 className="text-xl font-bold drop-shadow-lg sm:text-3xl lg:text-5xl">
                  {slide.title}
                </h2>
              )}
              {slide.subtitle && (
                <p className="mt-1 text-xs drop-shadow-md sm:mt-2 sm:text-base lg:text-xl">
                  {slide.subtitle}
                </p>
              )}
              {slide.buttonText && slide.buttonLink && (
                <Link
                  href={slide.buttonLink}
                  className="pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#2f0f6b] shadow-sm transition hover:bg-white/90 sm:mt-4"
                >
                  {slide.buttonText}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-4">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={`h-2.5 rounded-full transition-all sm:h-2 ${
                  index === current ? 'w-7 bg-white sm:w-6' : 'w-2.5 bg-white/60 sm:w-2'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
