"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategoryMap } from "@/lib/mock-news";

export function SiteHeader() {
  const categories = getCategoryMap();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const updateCompact = () => {
      setCompact(window.scrollY > 24);
    };

    updateCompact();
    window.addEventListener("scroll", updateCompact, { passive: true });

    return () => window.removeEventListener("scroll", updateCompact);
  }, []);

  return (
    <header className="paper-surface print-hidden sticky top-0 z-50 border-b border-dashed border-stone-400/90 bg-[rgba(255,253,248,0.96)] backdrop-blur-sm">
      <div
        className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${compact ? "py-2" : "py-4"}`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-stone-400 pb-3 transition-all duration-300 ${compact ? "max-h-0 overflow-hidden border-transparent pb-0 opacity-0" : "opacity-100"}`}
        >
          <p className="text-xs tracking-[0.16em] text-stone-600 uppercase">
            Daily Edition • Bangladesh • Trusted Local Reporting
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button className="rounded-full border border-stone-400 px-3 py-1">
              English
            </button>
            <button className="font-bangla rounded-full border border-stone-400 px-3 py-1">
              বাংলা
            </button>
          </div>
        </div>

        <div
          className={`text-center transition-all duration-300 ${compact ? "py-1" : "pt-4"}`}
        >
          <Link
            href="/"
            className={`font-display inline-block font-bold tracking-wide text-stone-900 transition-all duration-300 ${compact ? "text-2xl sm:text-3xl" : "text-4xl sm:text-6xl"}`}
          >
            Daily Darpan
          </Link>
          <p
            className={`tracking-[0.08em] text-stone-600 uppercase transition-all duration-300 ${compact ? "mt-1 text-[10px] opacity-0" : "mt-2 text-sm opacity-100"}`}
          >
            The bilingual digital newspaper
          </p>
        </div>

        <nav
          className={`flex flex-wrap items-center gap-2 border-t border-dashed border-stone-400 pt-4 text-sm font-semibold text-stone-700 transition-all duration-300 ${compact ? "max-h-0 overflow-hidden border-transparent pt-0 opacity-0" : "opacity-100"}`}
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-full border border-stone-400 bg-stone-50 px-3 py-1 transition hover:bg-stone-900 hover:text-stone-50"
            >
              {category.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
