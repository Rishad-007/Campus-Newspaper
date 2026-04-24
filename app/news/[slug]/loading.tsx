export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
      <div className="animate-pulse space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-(--accent-2) uppercase">
          <span className="h-3 w-3 animate-pulse rounded-full bg-(--accent)"></span>
          <span className="text-base">Loading article...</span>
        </div>

        <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-stone-200 sm:aspect-[21/9]"></div>

        <div className="space-y-4">
          <div className="h-12 w-full animate-pulse rounded-lg bg-stone-200 sm:h-10 sm:w-3/4"></div>
          <div className="h-12 w-2/3 animate-pulse rounded-lg bg-stone-200 sm:h-10 sm:w-1/2"></div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="h-7 w-32 animate-pulse rounded-full bg-stone-200 sm:h-5 sm:w-24"></div>
          <div className="h-7 w-28 animate-pulse rounded-full bg-stone-200 sm:h-5 sm:w-20"></div>
          <div className="h-7 w-24 animate-pulse rounded-full bg-stone-200 sm:h-5 sm:w-16"></div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-6 w-full animate-pulse rounded-lg bg-stone-200 sm:h-5 ${
                i === 3 ? "w-3/4" : i === 5 ? "w-1/2" : i === 7 ? "w-2/3" : ""
              }`}
            ></div>
          ))}
        </div>
      </div>
    </main>
  );
}