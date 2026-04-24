import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getPublicCategoryMap,
  getPublicStoriesByCategorySlug,
} from "@/lib/news-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dailybrur.com";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getPublicCategoryMap()).find(
    (item) => item.slug === slug,
  );

  if (!category) {
    return { title: "Category Not Found" };
  }

  const pageUrl = `${SITE_URL}/category/${slug}`;

  return {
    title: `${category.label} News`,
    description: `Latest ${category.label} news and stories from Daily BRUR - Campus newspaper of Begum Rokeya University, Rangpur`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${category.label} News - Daily BRUR`,
      description: `Latest ${category.label} news and stories from Daily BRUR`,
      url: pageUrl,
      siteName: "Daily BRUR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${category.label} News - Daily BRUR`,
      description: `Latest ${category.label} news and stories from Daily BRUR`,
    },
  };
}

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
                className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-(--accent)"
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
