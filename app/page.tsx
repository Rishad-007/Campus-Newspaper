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
    .slice(0, 10);

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
                  className="border-b border-stone-200 pb-4 last:border-b-0 last:pb-0"
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
                  <Link href={`/news/${story.slug}`}>
                    <h4 className="font-display mt-1 text-xl leading-tight text-stone-900 transition-colors hover:text-(--accent)">
                      {story.title}
                    </h4>
                  </Link>
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
          <Link
            href="/news"
            className="group relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 sm:min-h-11 sm:w-auto sm:rounded-full"
          >
            <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Visit All News
            </span>
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {latestReports.length === 0 ? (
            <div className="col-span-2 rounded-xl border border-dashed border-stone-400 p-5 text-sm text-stone-700 lg:col-span-3 xl:col-span-4">
              No latest reports selected yet.
            </div>
          ) : (
            latestReports.map((story) => (
              <article
                key={story.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <Link href={`/news/${story.slug}`} className="flex flex-col h-full">
                  <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-stone-100">
                    <Image
                      src={story.heroImage}
                      alt={story.title}
                      width={640}
                      height={360}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-white sm:text-xs">
                        {story.categoryLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <h4 className="font-display text-sm font-semibold leading-tight text-stone-900 line-clamp-3 sm:text-base lg:text-lg">
                      {story.title}
                    </h4>
                    <div className="mt-auto flex items-center justify-between pt-2 text-[10px] text-stone-500 sm:text-xs">
                      <span>{story.author}</span>
                      <span>{story.readTime} min</span>
                    </div>
                  </div>
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
