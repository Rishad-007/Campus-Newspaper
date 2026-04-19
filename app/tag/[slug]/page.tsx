import Link from "next/link";
import { getPublicStoriesByTagSlug } from "@/lib/news-service";

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const stories = await getPublicStoriesByTagSlug(slug);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <Link
          href="/"
          aria-label="Back to homepage"
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-stone-400 text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 sm:h-10 sm:w-10"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M6.5 10.8V20h11v-9.2" />
          </svg>
        </Link>
        <h1 className="font-display mt-3 text-2xl text-stone-900 sm:text-5xl">
          Tag: #{slug}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {stories.length} matching stories
        </p>
      </header>

      <section className="paper-surface rounded-2xl p-5 sm:p-6">
        {stories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-400 p-8 text-center text-stone-600">
            No stories found for this tag yet.
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <article
                key={story.id}
                className="rounded-xl border border-stone-300 bg-(--surface) p-4"
              >
                <p className="text-xs font-semibold tracking-[0.12em] text-(--accent-2) uppercase">
                  {story.categoryLabel}
                </p>
                <h2 className="font-display mt-2 text-2xl leading-tight text-stone-900">
                  {story.title}
                </h2>
                <p
                  className={`${story.locale === "bn" ? "font-bangla" : ""} mt-3 text-sm leading-6 text-stone-700`}
                >
                  {story.excerpt}
                </p>
                <Link
                  href={`/news/${story.slug}`}
                  className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-(--accent)"
                >
                  Read full story
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
