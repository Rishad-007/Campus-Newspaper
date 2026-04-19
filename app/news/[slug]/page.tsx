import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoPrintTrigger } from "@/components/auto-print-trigger";
import { CreatePhotocardAction } from "@/components/create-photocard-action";
import { PrintShareActions } from "@/components/print-share-actions";
import { getPublicStories, getPublicStoryBySlug } from "@/lib/news-service";

type NewsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ print?: string }>;
};

export default async function NewsArticlePage({
  params,
  searchParams,
}: NewsPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const shouldAutoPrint = query.print === "1";
  const article = await getPublicStoryBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = (await getPublicStories())
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);
  const excerptInsertIndex = Math.floor(article.body.length / 2);
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
  const printUrl = `/news/${article.slug}?print=1`;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
      <AutoPrintTrigger enabled={shouldAutoPrint} />
      <header className="paper-surface rounded-2xl p-5 print-hidden sm:p-6">
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
      </header>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr] lg:gap-6">
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
          <h1 className="article-print-title font-display mt-3 text-2xl leading-tight text-stone-900 sm:text-5xl">
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
              className="h-64 w-full object-cover sm:h-auto"
              priority
            />
          </div>

          <div className="article-body-print mt-6 space-y-4 text-base leading-8 text-stone-800 sm:space-y-5 sm:text-lg sm:leading-9">
            {article.body.map((paragraph, index) => (
              <div
                key={`${article.id}-${index.toString()}`}
                className="space-y-5"
              >
                {index === excerptInsertIndex && article.excerpt && (
                  <blockquote className="rounded-xl border-l-4 border-(--accent) bg-stone-100 px-4 py-3 text-base leading-7 text-stone-900 sm:text-lg">
                    {article.excerpt}
                  </blockquote>
                )}
                <p
                  className={`${article.locale === "bn" ? "font-bangla" : ""} ${index === 0 ? "lead-paragraph" : ""}`}
                >
                  {paragraph}
                </p>
              </div>
            ))}
          </div>

          <div className="print-hidden mt-8 border-t border-dashed border-stone-400 pt-4">
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

        <aside className="order-first space-y-4 lg:order-last">
          <CreatePhotocardAction article={article} />
          <PrintShareActions title={article.title} printUrl={printUrl} />

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
