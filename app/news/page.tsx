import Image from "next/image";
import Link from "next/link";
import { getPublicCategoryMap, getPublicStories } from "@/lib/news-service";

type NewsIndexPageProps = {
  searchParams: Promise<{
    sort?: string;
    category?: string;
    from?: string;
    to?: string;
  }>;
};

function parseDate(dateInput?: string) {
  if (!dateInput) return null;
  const parsed = new Date(`${dateInput}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default async function AllNewsPage({
  searchParams,
}: NewsIndexPageProps) {
  const params = await searchParams;
  const sortMode = params.sort === "oldest" ? "oldest" : "newest";
  const category = (params.category ?? "all").trim();
  const fromDate = parseDate(params.from);
  const toDate = parseDate(params.to);

  const [stories, categories] = await Promise.all([
    getPublicStories(),
    getPublicCategoryMap(),
  ]);

  const filteredStories = stories
    .filter((story) => {
      if (category !== "all" && story.category !== category) {
        return false;
      }

      const storyDate = new Date(story.publishedAt);
      if (fromDate && storyDate < fromDate) {
        return false;
      }

      if (toDate) {
        const toEnd = new Date(toDate);
        toEnd.setHours(23, 59, 59, 999);
        if (storyDate > toEnd) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const diff =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return sortMode === "newest" ? diff : -diff;
    });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-stone-600 uppercase">
              Archive Desk
            </p>
            <h1 className="font-display mt-2 text-3xl text-stone-900 sm:text-5xl">
              All News Reports
            </h1>
            <p className="mt-2 text-sm text-stone-700">
              Browse every published story with date and category filters.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 sm:min-h-10 sm:w-auto"
          >
            Back to homepage
          </Link>
        </div>
      </header>

      <section className="paper-surface rounded-2xl p-3 sm:p-6">
        <form className="flex flex-wrap gap-2 sm:grid sm:grid-cols-5 sm:gap-3" method="get">
          <label className="min-w-[calc(50%-4px)] flex-1 grid gap-1 text-sm text-stone-700 sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide sm:text-xs sm:tracking-[0.12em]">
              Sort
            </span>
            <select
              name="sort"
              defaultValue={sortMode}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-(--accent) sm:px-3 sm:py-2 sm:text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>

          <label className="min-w-[calc(50%-4px)] flex-1 grid gap-1 text-sm text-stone-700 sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide sm:text-xs sm:tracking-[0.12em]">
              Category
            </span>
            <select
              name="category"
              defaultValue={category}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-(--accent) sm:px-3 sm:py-2 sm:text-sm"
            >
              <option value="all">All</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-[calc(50%-4px)] grid gap-1 text-sm text-stone-700 sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide sm:text-xs sm:tracking-[0.12em]">
              From
            </span>
            <input
              type="date"
              name="from"
              defaultValue={params.from ?? ""}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-(--accent) sm:px-3 sm:py-2 sm:text-sm"
            />
          </label>

          <label className="min-w-[calc(50%-4px)] grid gap-1 text-sm text-stone-700 sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide sm:text-xs sm:tracking-[0.12em]">
              To
            </span>
            <input
              type="date"
              name="to"
              defaultValue={params.to ?? ""}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-(--accent) sm:px-3 sm:py-2 sm:text-sm"
            />
          </label>

          <div className="flex min-w-[calc(50%-4px)] items-end gap-1.5 sm:col-span-1 sm:gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-(--accent) px-3 py-1.5 text-xs font-semibold text-white sm:flex-none sm:rounded-full sm:px-4 sm:py-2 sm:text-sm"
            >
              Apply
            </button>
            <Link
              href="/news"
              className="flex items-center justify-center rounded-lg border border-stone-300 px-2 py-1.5 text-xs text-stone-600 sm:flex-none sm:rounded-full sm:px-3 sm:py-2 sm:text-sm"
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Link>
          </div>
        </form>
      </section>

      <section className="paper-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-2 border-b border-dashed border-stone-400 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h2 className="font-display text-2xl text-stone-900">
            Published News
          </h2>
          <p className="text-sm text-stone-600">
            {filteredStories.length} stories found
          </p>
        </div>

        {filteredStories.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-stone-400 p-6 text-center text-sm text-stone-700">
            No stories found for this filter combination.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <article
                key={story.id}
                className="rounded-xl border border-stone-300 bg-(--surface) p-2.5 shadow-sm sm:p-3"
              >
                <div className="overflow-hidden rounded-lg border border-stone-300 bg-stone-100">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    width={640}
                    height={360}
                    className="h-24 w-full object-cover sm:h-28"
                  />
                </div>
                <p className="mt-2 text-[10px] font-semibold tracking-widest text-(--accent-2) uppercase sm:text-xs sm:tracking-[0.12em]">
                  {story.categoryLabel}
                </p>
                <h3 className="font-display mt-1 line-clamp-3 text-base leading-tight text-stone-900 sm:text-lg">
                  {story.title}
                </h3>
                <p className="mt-1 text-[11px] text-stone-600 sm:text-xs">
                  {new Date(story.publishedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <Link
                  href={`/news/${story.slug}`}
                  className="mt-2 inline-block text-xs font-semibold text-(--accent) sm:mt-3 sm:text-sm"
                >
                  Open story
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
