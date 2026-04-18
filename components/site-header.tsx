import Link from "next/link";
import { getCategoryMap } from "@/lib/mock-news";

export function SiteHeader() {
  const categories = getCategoryMap();

  return (
    <header className="paper-surface print-hidden border-b border-dashed border-stone-400/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-stone-400 pb-4">
          <p className="text-xs tracking-[0.16em] text-stone-600 uppercase">Daily Edition • Bangladesh • Trusted Local Reporting</p>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button className="rounded-full border border-stone-400 px-3 py-1">English</button>
            <button className="font-bangla rounded-full border border-stone-400 px-3 py-1">বাংলা</button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="font-display inline-block text-4xl font-bold tracking-wide text-stone-900 sm:text-6xl">
            Daily Darpan
          </Link>
          <p className="mt-2 text-sm tracking-[0.08em] text-stone-600 uppercase">The bilingual digital newspaper</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 border-t border-dashed border-stone-400 pt-4 text-sm font-semibold text-stone-700">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-full border border-stone-400 bg-stone-50 px-3 py-1 transition hover:bg-stone-900 hover:text-stone-50"
            >
              {category.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="ml-auto rounded-full border border-[var(--accent)] px-3 py-1 text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white"
          >
            Admin Preview
          </Link>
        </nav>
      </div>
    </header>
  );
}
