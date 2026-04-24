export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
      <div className="animate-pulse space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-(--accent-2) uppercase">
          <span className="h-3 w-3 animate-pulse rounded-full bg-(--accent)"></span>
          <span className="text-base">Loading tag...</span>
        </div>

        <div className="h-16 w-40 animate-pulse rounded-xl bg-stone-200 sm:h-12 sm:w-32"></div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-stone-200 p-4">
              <div className="h-5 w-24 animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-8 w-full animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-5 w-full animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-5 w-1/2 animate-pulse rounded-lg bg-stone-200"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}