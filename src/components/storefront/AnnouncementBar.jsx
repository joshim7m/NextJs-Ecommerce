'use client';

export default function AnnouncementBar({ text, mobile }) {
  if (!text && !mobile) return null;

  return (
    <div className="bg-brand-gradient text-violet-50/90 dark:bg-[#1a0a3d]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4 py-1.5 text-xs sm:py-2 sm:text-sm">
        {text ? (
          <span className="truncate">{text}</span>
        ) : (
          <>
            <span className="truncate">Call or WhatsApp us to order:</span>
            <a href={`tel:${mobile}`} className="shrink-0 font-semibold text-white hover:underline">{mobile || 'N/A'}</a>
          </>
        )}
      </div>
    </div>
  );
}
