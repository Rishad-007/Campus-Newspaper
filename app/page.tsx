import Image from "next/image";
import Link from "next/link";
import { getPublicStories, getPublicTagList } from "@/lib/news-service";

export default async function Home() {
  const stories = await getPublicStories();
  const leadStory = stories.find((story) => story.placement === "lead") ?? null;
  const topStories = stories
    .filter((story) => story.placement === "brief")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6);
  const latestReports = stories
    .filter((story) => story.placement === "latest")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6);

  if (stories.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="paper-surface rounded-2xl p-5 sm:p-6">
          <h1 className="font-display text-3xl text-stone-900 sm:text-5xl">
            Daily BRUR
          </h1>
          <p className="mt-3 text-sm text-stone-700">
            No published news yet. The editorial desk is preparing updates.
          </p>
        </section>
      </main>
    );
  }
  const tags = await getPublicTagList();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
      <header className="paper-surface rounded-2xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <p className="text-xs tracking-[0.14em] text-stone-600 uppercase sm:text-right">
            Frontpage Highlights
          </p>
        </div>
      </header>

      <section className="news-grid">
        {leadStory ? (
          <article className="paper-surface rounded-2xl p-4 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-(--accent) uppercase">
              Lead Story
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
              <Image
                src={leadStory.heroImage}
                alt={leadStory.title}
                width={1200}
                height={720}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="font-display mt-3 text-2xl font-semibold leading-tight text-stone-900 sm:text-4xl">
              {leadStory.title}
            </h2>
            <p
              className={`${leadStory.locale === "bn" ? "font-bangla" : ""} mt-3 text-base leading-7 text-stone-700 sm:text-lg sm:leading-8`}
            >
              {leadStory.excerpt}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-stone-600 uppercase">
              <span>{leadStory.categoryLabel}</span>
              <span>•</span>
              <span>{leadStory.readTime} min read</span>
            </div>

            <Link
              href={`/news/${leadStory.slug}`}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-(--accent) px-5 py-2 text-sm font-semibold text-white! shadow-sm transition hover:brightness-110 hover:text-white! sm:min-h-10 sm:w-auto"
            >
              Read full report
            </Link>
          </article>
        ) : (
          <article className="paper-surface rounded-2xl p-4 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-(--accent) uppercase">
              Lead Story
            </p>
            <p className="mt-4 text-sm text-stone-700">
              No lead story selected yet. Choose one in Front Page Placement.
            </p>
          </article>
        )}

        <aside className="paper-surface rounded-2xl p-4 sm:p-6">
          <h3 className="font-display border-b border-dashed border-stone-400 pb-3 text-2xl text-stone-900">
            Frontline Briefs
          </h3>
          <div className="mt-4 space-y-4">
            {topStories.length === 0 ? (
              <p className="text-sm text-stone-700">
                No brief stories selected yet.
              </p>
            ) : (
              topStories.map((story) => (
                <article
                  key={story.id}
                  className="border-b border-stone-200 pb-4 last:border-b-0"
                >
                  <div className="mb-2 overflow-hidden rounded-lg border border-stone-300 bg-stone-100">
                    <Image
                      src={story.heroImage}
                      alt={story.title}
                      width={640}
                      height={360}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-(--accent-2) uppercase">
                    {story.categoryLabel}
                  </p>
                  <h4 className="font-display mt-1 text-xl leading-tight text-stone-900">
                    {story.title}
                  </h4>
                  <p
                    className={`${story.locale === "bn" ? "font-bangla" : ""} mt-2 text-sm leading-6 text-stone-700`}
                  >
                    {story.excerpt}
                  </p>
                  <Link
                    href={`/news/${story.slug}`}
                    className="mt-2 inline-block text-sm font-semibold text-(--accent)"
                  >
                    Continue reading
                  </Link>
                </article>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="paper-surface rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-dashed border-stone-400 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <h3 className="font-display text-2xl text-stone-900 sm:text-3xl">
            Latest Reports
          </h3>
          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <p className="text-sm text-stone-600">
              Responsive cards for mobile, tablet, and desktop
            </p>
            <Link
              href="/news"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-(--accent) bg-(--accent) px-4 py-2 text-sm font-semibold text-white transition hover:brightness-150 sm:min-h-10 sm:w-auto"
            >
              Visit All News
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {latestReports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-400 p-5 text-sm text-stone-700 sm:col-span-2 xl:col-span-3">
              No latest reports selected yet.
            </div>
          ) : (
            latestReports.map((story) => (
              <article
                key={story.id}
                className="rounded-xl border border-stone-300 bg-(--surface) p-4 shadow-sm"
              >
                <div className="mb-3 overflow-hidden rounded-lg border border-stone-300 bg-stone-100">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    width={640}
                    height={360}
                    className="h-36 w-full object-cover"
                  />
                </div>
                <p className="text-xs font-semibold tracking-[0.12em] text-(--accent-2) uppercase">
                  {story.categoryLabel}
                </p>
                <h4 className="font-display mt-2 text-2xl leading-tight text-stone-900">
                  {story.title}
                </h4>
                <p
                  className={`${story.locale === "bn" ? "font-bangla" : ""} mt-2 line-clamp-3 text-sm leading-6 text-stone-700`}
                >
                  {story.excerpt}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
                  <span>{story.author}</span>
                  <span>{story.readTime} min</span>
                </div>
                <Link
                  href={`/news/${story.slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-(--accent)"
                >
                  Open story
                </Link>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="paper-surface rounded-2xl p-4 sm:p-6 print-hidden">
        <h3 className="font-display text-2xl text-stone-900">
          Explore By Tags
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}`}
              className="inline-flex min-h-10 items-center rounded-full border border-stone-400 px-3 py-1 text-sm font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
