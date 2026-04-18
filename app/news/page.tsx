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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
            className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
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

          <div className="flex flex-wrap items-end gap-2">
            <button
              type="submit"
              className="rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white"
            >
              Apply
            </button>
            <Link
              href="/news"
              className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="paper-surface rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-stone-400 pb-3">
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
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStories.map((story) => (
              <article
                key={story.id}
                className="rounded-xl border border-stone-300 bg-(--surface) p-4"
              >
                <div className="overflow-hidden rounded-lg border border-stone-300 bg-stone-100">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    width={640}
                    height={360}
                    className="h-36 w-full object-cover"
                  />
                </div>
                <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-(--accent-2) uppercase">
                  {story.categoryLabel}
                </p>
                <h3 className="font-display mt-1 text-2xl leading-tight text-stone-900">
                  {story.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {new Date(story.publishedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p
                  className={`${story.locale === "bn" ? "font-bangla" : ""} mt-2 line-clamp-3 text-sm leading-6 text-stone-700`}
                >
                  {story.excerpt}
                </p>
                <Link
                  href={`/news/${story.slug}`}
                  className="mt-3 inline-block text-sm font-semibold text-(--accent)"
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
