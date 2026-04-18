import Image from "next/image";
import Link from "next/link";
import { getPublishedArticles, getTagList } from "@/lib/mock-news";

export default function Home() {
  const stories = getPublishedArticles();
  const leadStory = stories[0];
  const topStories = stories.slice(1, 4);
  const tags = getTagList();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="paper-surface rounded-2xl px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs tracking-[0.16em] text-stone-600 uppercase">
            Saturday Edition • Dhaka • Vol 01
          </p>
          <p className="text-xs tracking-[0.14em] text-stone-600 uppercase">
            Frontpage Highlights
          </p>
        </div>
      </header>

      <section className="news-grid">
        <article className="paper-surface rounded-2xl p-4 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--accent)] uppercase">
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
          <h2 className="font-display mt-2 text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl">
            {leadStory.title}
          </h2>
          <p
            className={`${leadStory.locale === "bn" ? "font-bangla" : ""} mt-4 text-lg leading-8 text-stone-700`}
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
            className="mt-6 inline-flex items-center rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-700"
          >
            Read full report
          </Link>
        </article>

        <aside className="paper-surface rounded-2xl p-4 sm:p-6">
          <h3 className="font-display border-b border-dashed border-stone-400 pb-3 text-2xl text-stone-900">
            Frontline Briefs
          </h3>
          <div className="mt-4 space-y-4">
            {topStories.map((story) => (
              <article
                key={story.id}
                className="border-b border-stone-200 pb-4 last:border-b-0"
              >
                <p className="text-xs font-semibold tracking-[0.12em] text-[var(--accent-2)] uppercase">
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
                  className="mt-2 inline-block text-sm font-semibold text-[var(--accent)]"
                >
                  Continue reading
                </Link>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="paper-surface rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-stone-400 pb-4">
          <h3 className="font-display text-2xl text-stone-900 sm:text-3xl">
            Latest Reports
          </h3>
          <p className="text-sm text-stone-600">
            Responsive cards for mobile, tablet, and desktop
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => (
            <article
              key={story.id}
              className="rounded-xl border border-stone-300 bg-[var(--surface)] p-4 shadow-sm"
            >
              <div
                className="mb-3 h-36 rounded-lg bg-cover bg-center"
                style={{ backgroundImage: "url('/newsroom.jpg')" }}
              />
              <p className="text-xs font-semibold tracking-[0.12em] text-[var(--accent-2)] uppercase">
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
                className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]"
              >
                Open story
              </Link>
            </article>
          ))}
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
              className="rounded-full border border-stone-400 px-3 py-1 text-sm font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
