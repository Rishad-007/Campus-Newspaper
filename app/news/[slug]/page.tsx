import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintShareActions } from "@/components/print-share-actions";
import { getArticleBySlug, getPublishedArticles } from "@/lib/mock-news";

type NewsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewsArticlePage({ params }: NewsPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = getPublishedArticles()
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);
  const publishedAt = new Date(article.publishedAt);
  const publishDateLabel = new Intl.DateTimeFormat(
    article.locale === "bn" ? "bn-BD" : "en-GB",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(publishedAt);
  const publishTimeLabel = new Intl.DateTimeFormat(
    article.locale === "bn" ? "bn-BD" : "en-GB",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  ).format(publishedAt);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 print-hidden sm:p-6">
        <Link href="/" className="text-sm font-semibold text-(--accent)">
          Back to homepage
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="article-print paper-surface rounded-2xl p-5 sm:p-8">
          <div className="print-masthead hidden">
            <div className="print-brand-row">
              <div>
                <p className="font-display text-3xl font-bold tracking-wide">
                  Daily Darpan
                </p>
                <p className="text-xs tracking-[0.14em] uppercase text-stone-700">
                  Bilingual Newsprint Edition
                </p>
              </div>
              <div className="text-right text-xs tracking-[0.14em] uppercase text-stone-700">
                <p>{publishDateLabel}</p>
                <p>{publishTimeLabel}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-b border-black py-2 text-[10px] tracking-[0.16em] uppercase text-stone-700">
              <span>{article.categoryLabel}</span>
              <span>Printed from Daily Darpan</span>
              <span>
                {article.locale === "bn" ? "বাংলা সংস্করণ" : "English Edition"}
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold tracking-[0.14em] text-(--accent-2) uppercase">
            {article.categoryLabel}
          </p>
          <h1 className="article-print-title font-display mt-3 text-3xl leading-tight text-stone-900 sm:text-5xl">
            {article.title}
          </h1>
          <p className="article-print-meta mt-4 text-sm text-stone-600">
            By {article.author} • {publishDateLabel} • {publishTimeLabel} •{" "}
            {article.readTime} min read
          </p>

          <div className="article-print-image relative mt-6 overflow-hidden rounded-xl">
            <Image
              src={article.heroImage}
              alt={article.title}
              width={1200}
              height={700}
              className="h-auto w-full"
              priority
            />
          </div>

          <div className="article-body-print mt-6 space-y-5 text-lg leading-9 text-stone-800">
            {article.body.map((paragraph) => (
              <p
                key={paragraph}
                className={article.locale === "bn" ? "font-bangla" : ""}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 border-t border-dashed border-stone-400 pt-4">
            <p className="text-sm font-semibold text-stone-700">Tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <PrintShareActions title={article.title} />

          <section className="paper-surface rounded-2xl p-4 print-hidden sm:p-5">
            <h2 className="font-display text-2xl text-stone-900">
              Related Stories
            </h2>
            <div className="mt-4 space-y-4">
              {related.map((item) => (
                <article
                  key={item.id}
                  className="border-b border-stone-200 pb-4 last:border-b-0"
                >
                  <p className="text-xs font-semibold tracking-[0.12em] text-(--accent) uppercase">
                    {item.categoryLabel}
                  </p>
                  <h3 className="font-display mt-1 text-xl text-stone-900">
                    {item.title}
                  </h3>
                  <Link
                    href={`/news/${item.slug}`}
                    className="mt-2 inline-block text-sm font-semibold text-(--accent)"
                  >
                    Read story
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
