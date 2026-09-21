export default function ProductsLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="aspect-square w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 space-y-2 p-1">
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
