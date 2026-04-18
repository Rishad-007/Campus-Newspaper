import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicCategoryMap,
  getPublicStoriesByCategorySlug,
} from "@/lib/news-service";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = (await getPublicCategoryMap()).find(
    (item) => item.slug === slug,
  );

  if (!category) {
    notFound();
  }

  const stories = await getPublicStoriesByCategorySlug(slug);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <Link href="/" className="text-sm font-semibold text-(--accent)">
          Back to homepage
        </Link>
        <h1 className="font-display mt-3 text-3xl text-stone-900 sm:text-5xl">
          Category: {category.label}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {stories.length} stories in this category
        </p>
      </header>

      <section className="paper-surface rounded-2xl p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
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
                className="mt-3 inline-block text-sm font-semibold text-(--accent)"
              >
                Open story
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
