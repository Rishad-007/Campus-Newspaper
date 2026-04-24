export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
      <div className="animate-pulse space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-(--accent-2) uppercase sm:text-xs">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-(--accent) sm:h-2 sm:w-2"></span>
          <span className="text-base sm:text-sm">Loading...</span>
        </div>

        <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-stone-200 sm:aspect-[21/9] sm:max-w-4xl"></div>

        <div className="space-y-3">
          <div className="h-10 w-full animate-pulse rounded-lg bg-stone-200 sm:h-8 sm:w-3/4"></div>
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-stone-200 sm:h-8 sm:w-1/2"></div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-7 w-28 animate-pulse rounded-full bg-stone-200 sm:h-6 sm:w-24"></div>
          <div className="h-7 w-24 animate-pulse rounded-full bg-stone-200 sm:h-6 sm:w-20"></div>
          <div className="h-7 w-20 animate-pulse rounded-full bg-stone-200 sm:h-6 sm:w-16"></div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-stone-200 p-3">
              <div className="aspect-[16/10] w-full animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-5 w-20 animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-7 w-full animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-5 w-2/3 animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-5 w-1/3 animate-pulse rounded-lg bg-stone-200"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}