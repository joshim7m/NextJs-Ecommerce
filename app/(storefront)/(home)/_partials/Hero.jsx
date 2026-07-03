'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    src: 'https://picsum.photos/seed/furniture1/800/600',
    srcDesktop: 'https://picsum.photos/seed/furniture1/1400/500',
    alt: 'Modern furniture collection',
  },
  {
    src: 'https://picsum.photos/seed/furniture2/800/600',
    srcDesktop: 'https://picsum.photos/seed/furniture2/1400/500',
    alt: 'Elegant home decor',
  },
  {
    src: 'https://picsum.photos/seed/furniture3/800/600',
    srcDesktop: 'https://picsum.photos/seed/furniture3/1400/500',
    alt: 'Premium cabinet designs',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [mounted]);

  const goTo = (index) => setCurrent(index);

  return (
    <section className="relative w-full overflow-hidden rounded-none sm:rounded-2xl">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 sm:aspect-[2.8/1] sm:rounded-2xl">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(${(index - current) * 100}%)` }}
          >
            <picture>
              <source media="(min-width: 640px)" srcSet={slide.srcDesktop} />
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </picture>
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="absolute bottom-6 left-4 text-white sm:bottom-8 sm:left-8">
          <h2 className="text-xl font-bold drop-shadow-lg sm:text-3xl lg:text-5xl">
            Style Your Space
          </h2>
          <p className="mt-1 text-xs drop-shadow-md sm:mt-2 sm:text-base lg:text-xl">
            Discover premium furniture &amp; decor
          </p>
        </div>
      </div>

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
    </section>
  );
}
