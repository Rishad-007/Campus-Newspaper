export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
      <div className="animate-pulse space-y-5">
        <div className="flex h-12 w-full items-center gap-3 rounded-xl bg-stone-200 px-4 sm:h-12">
          <div className="h-5 w-24 animate-pulse rounded-lg bg-stone-300"></div>
          <div className="h-5 w-20 animate-pulse rounded-lg bg-stone-300"></div>
          <div className="h-5 w-28 animate-pulse rounded-lg bg-stone-300"></div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-stone-200 p-3">
              <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-5 w-20 animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-7 w-full animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-5 w-full animate-pulse rounded-lg bg-stone-200"></div>
              <div className="h-5 w-1/2 animate-pulse rounded-lg bg-stone-200"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}