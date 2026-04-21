"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import type { SupabaseClient } from "@supabase/supabase-js";

type CategoryItem = {
  slug: string;
  label: string;
};

function formatEditionTimestamp(date: Date) {
  const dayLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
  }).format(date);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${dayLabel} • ${dateLabel} • ${timeLabel}`;
}

function formatCompactEditionTimestamp(date: Date) {
  const dayLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
  }).format(date);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${dayLabel}, ${dateLabel} • ${timeLabel}`;
}

export function SiteHeader() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = useMemo<SupabaseClient | null>(() => {
    if (!hasSupabasePublicConfig()) {
      return null;
    }

    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [editionTimestamp, setEditionTimestamp] = useState("");
  const [compactEditionTimestamp, setCompactEditionTimestamp] = useState("");

  useEffect(() => {
    async function loadCategories() {
      if (!supabase) return;
      const { data } = await supabase
        .from("categories")
        .select("slug, name_en, name_bn")
        .order("name_en", { ascending: true });
      if (data) {
        setCategories(
          data.map((c) => ({
            slug: c.slug,
            label: c.name_bn || c.name_en,
          })),
        );
      }
    }
    loadCategories();
  }, [supabase]);

  useEffect(() => {
    const updateTimestamps = () => {
      const now = new Date();
      setEditionTimestamp(formatEditionTimestamp(now));
      setCompactEditionTimestamp(formatCompactEditionTimestamp(now));
    };

    updateTimestamps();

    const intervalId = window.setInterval(() => {
      updateTimestamps();
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    const loadSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setIsAuthenticated(Boolean(user));
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session?.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="paper-surface print-hidden sticky top-0 z-50 border-b border-dashed border-stone-400/90 bg-[rgba(255,253,248,0.98)] backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4">
        <div className="flex items-start justify-between gap-3 lg:gap-5">
          <div className="min-w-0">
            <p className="hidden text-[10px] tracking-[0.16em] text-stone-600 uppercase sm:block sm:text-xs">
              Daily Edition • Bangladesh • Trusted Local Reporting
            </p>
            <Link
              href="/"
              className="font-display inline-flex items-center gap-2 text-2xl font-bold tracking-wide text-stone-900 sm:text-4xl lg:text-5xl"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              Daily Darpan
            </Link>
            <p className="mt-1 text-[10px] tracking-[0.08em] text-stone-600 uppercase sm:mt-2 sm:text-xs lg:text-sm">
              The bilingual digital newspaper
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            <p
              suppressHydrationWarning
              className="hidden text-[10px] font-semibold tracking-widest text-stone-700 uppercase md:block md:text-xs"
            >
              {editionTimestamp}
            </p>
            <p
              suppressHydrationWarning
              className="block font-mono text-[10px] font-semibold tabular-nums text-stone-700 md:hidden"
            >
              {compactEditionTimestamp}
            </p>

            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/news"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-9 items-center rounded-full border border-stone-500 bg-stone-50 px-2.5 py-1.5 text-[11px] font-semibold text-stone-900 shadow-sm transition hover:bg-stone-100"
              >
                All News
              </Link>
              {supabase && isAuthenticated ? (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-9 items-center rounded-full border border-stone-400 px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
                >
                  Admin
                </Link>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-9 items-center rounded-full border border-stone-500 bg-stone-50 px-2.5 py-1.5 text-[11px] font-semibold text-stone-900 shadow-sm transition hover:bg-stone-100"
                >
                  Sign In
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen((previous) => !previous)}
                className="inline-flex min-h-9 items-center rounded-full border border-stone-400 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-stone-700 uppercase transition hover:bg-stone-900 hover:text-stone-50"
                aria-expanded={menuOpen}
                aria-controls="mobile-smart-menu"
              >
                {menuOpen ? "Close" : "Menu"}
              </button>
            </div>

            <div className="hidden items-center justify-end gap-2 text-xs font-semibold lg:flex">
              <Link
                href="/news"
                className="inline-flex min-h-10 items-center rounded-full border border-stone-500 bg-stone-50 px-4 py-2 text-stone-900 shadow-sm transition hover:bg-stone-100"
              >
                Visit All News
              </Link>
              {supabase && isAuthenticated ? (
                <>
                  <Link
                    href="/admin"
                    className="inline-flex min-h-10 items-center rounded-full border border-stone-400 px-4 py-2 transition hover:bg-stone-900 hover:text-stone-50"
                  >
                    Admin
                  </Link>
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center rounded-full border border-stone-400 px-4 py-2 transition hover:bg-stone-900 hover:text-stone-50"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex min-h-10 items-center rounded-full border border-stone-500 bg-stone-50 px-4 py-2 text-stone-900 shadow-sm transition hover:bg-stone-100"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        <nav className="mt-3 hidden flex-wrap items-center gap-2 border-t border-dashed border-stone-400 pt-3 text-sm font-semibold text-stone-700 lg:flex">
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

        {menuOpen ? (
          <section
            id="mobile-smart-menu"
            className="mt-2 rounded-2xl border border-stone-300 bg-[rgba(255,253,248,0.99)] p-2.5 shadow-md lg:hidden"
          >
            <div className="mb-2 flex items-center justify-between px-0.5">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-stone-600 uppercase">
                Sections
              </p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-stone-300 px-2 py-1 text-[10px] font-semibold tracking-wide text-stone-700 uppercase"
              >
                Close
              </button>
            </div>

            <nav className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-stone-700">
              <Link
                href="/news"
                onClick={() => setMenuOpen(false)}
                className="col-span-2 inline-flex min-h-9 items-center justify-center rounded-full border border-stone-500 bg-stone-50 px-2.5 py-1.5 text-center text-stone-900 shadow-sm transition hover:bg-stone-100"
              >
                Visit All News
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-9 items-center justify-center rounded-full border border-stone-400 bg-stone-50 px-2.5 py-1.5 text-center transition hover:bg-stone-900 hover:text-stone-50"
                >
                  {category.label}
                </Link>
              ))}
            </nav>

            {supabase && isAuthenticated ? (
              <form
                action="/api/auth/signout"
                method="post"
                className="mt-2 border-t border-dashed border-stone-300 pt-2"
              >
                <button
                  type="submit"
                  className="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-stone-400 px-3 py-1.5 text-[11px] font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </section>
        ) : null}
      </div>
    </header>
  );
}
