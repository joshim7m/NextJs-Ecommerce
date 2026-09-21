'use client';

import { useState, useRef, useEffect } from 'react';

export function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function VideoMain({ youTubeId, title }) {
  return (
    <div className="absolute inset-0">
      <iframe
        src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0`}
        title={title || 'Product video'}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

export default function ImageGallery({ images, videoUrl, title, variantImageIndex }) {
  const videoId = getYouTubeId(videoUrl);
  const imgCount = images?.length || 0;
  const videoIndex = videoId ? imgCount : -1;
  const totalItems = imgCount + (videoId ? 1 : 0);

  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (variantImageIndex >= 0) setSelected(variantImageIndex);
  }, [variantImageIndex]);

  useEffect(() => {
    if (selected < imgCount && imgRef.current?.complete) setLoaded(true);
  }, [selected, imgCount]);

  const active = selected < imgCount ? images[selected] : null;
  const isVideoActive = selected === videoIndex;

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
      <div className="relative flex-1 overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl dark:bg-slate-700">
        <div className="aspect-square w-full sm:aspect-auto sm:h-[36rem]">
          {!isVideoActive && !loaded && !error && (
            <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-600" />
          )}
          {isVideoActive ? (
            <VideoMain youTubeId={videoId} title={`Video — ${title}`} />
          ) : active && !error ? (
            <img
              ref={imgRef}
              src={active.image_path}
              alt={active.altText || title}
              className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {totalItems > 1 && (
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-x-visible scrollbar-none">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => { setSelected(i); setLoaded(false); setError(false); }}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-16 ${
                i === selected ? 'border-[#2f0f6b] dark:border-[#a78bfa]' : 'border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
              }`}
            >
              <img
                src={img.image_path}
                alt={img.altText || ''}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
          {videoId && (
            <button
              type="button"
              onClick={() => { setSelected(videoIndex); setLoaded(false); setError(false); }}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-16 ${
                isVideoActive ? 'border-[#2f0f6b] dark:border-[#a78bfa]' : 'border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
              }`}
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt="Product video"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
