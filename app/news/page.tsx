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

      <section className="paper-surface rounded-2xl p-5 sm:p-6">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" method="get">
          <label className="grid gap-1 text-sm text-stone-700">
            <span className="text-xs font-semibold tracking-[0.12em] uppercase">
              Sort By Date
            </span>
            <select
              name="sort"
              defaultValue={sortMode}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm text-stone-700">
            <span className="text-xs font-semibold tracking-[0.12em] uppercase">
              Category
            </span>
            <select
              name="category"
              defaultValue={category}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm text-stone-700">
            <span className="text-xs font-semibold tracking-[0.12em] uppercase">
              From Date
            </span>
            <input
              type="date"
              name="from"
              defaultValue={params.from ?? ""}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm text-stone-700">
            <span className="text-xs font-semibold tracking-[0.12em] uppercase">
              To Date
            </span>
            <input
              type="date"
              name="to"
              defaultValue={params.to ?? ""}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-(--accent) focus:ring"
            />
          </label>

          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="min-h-11 rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white sm:min-h-10"
            >
              Apply
            </button>
            <Link
              href="/news"
              className="inline-flex min-h-11 items-center rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 sm:min-h-10"
            >
              Reset
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
                <h3 className="font-display mt-1 line-clamp-2 text-lg leading-tight text-stone-900 sm:text-xl">
                  {story.title}
                </h3>
                <p className="mt-1 text-[11px] text-stone-600 sm:text-xs">
                  {new Date(story.publishedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p
                  className={`${story.locale === "bn" ? "font-bangla" : ""} mt-1 line-clamp-2 text-xs leading-5 text-stone-700 sm:mt-2 sm:line-clamp-3 sm:text-sm sm:leading-6`}
                >
                  {story.excerpt}
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
