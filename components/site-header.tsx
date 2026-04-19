"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCategoryMap } from "@/lib/mock-news";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  const categories = getCategoryMap();
  const [compact, setCompact] = useState(false);
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
  const [editionTimestamp, setEditionTimestamp] = useState(() => {
    const now = new Date();
    return formatEditionTimestamp(now);
  });
  const [compactEditionTimestamp, setCompactEditionTimestamp] = useState(() => {
    const now = new Date();
    return formatCompactEditionTimestamp(now);
  });

  useEffect(() => {
    let ticking = false;

    const getScrollTop = () =>
      Math.max(
        window.scrollY,
        window.pageYOffset,
        document.documentElement.scrollTop,
        document.body.scrollTop,
        0,
      );

    const updateCompact = () => {
      const currentScrollY = getScrollTop();
      const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
      const compactEnterThreshold = isSmallScreen ? 1 : 180;
      const compactExitThreshold = isSmallScreen ? 0 : 24;

      setCompact((previous) => {
        if (previous) {
          return currentScrollY > compactExitThreshold;
        }

        return currentScrollY > compactEnterThreshold;
      });
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      requestAnimationFrame(() => {
        updateCompact();
        ticking = false;
      });
    };

    updateCompact();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    window.addEventListener("resize", updateCompact);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchmove", onScroll);
      window.removeEventListener("resize", updateCompact);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const now = new Date();
      setEditionTimestamp(formatEditionTimestamp(now));
      setCompactEditionTimestamp(formatCompactEditionTimestamp(now));
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

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="paper-surface print-hidden sticky top-0 z-50 border-b border-dashed border-stone-400/90 bg-[rgba(255,253,248,0.96)] backdrop-blur-sm">
      <div
        className={`mx-auto w-full max-w-6xl px-4 transition-[padding] duration-200 sm:px-6 lg:px-8 ${compact ? "py-1.5 sm:py-2" : "py-2 sm:py-4"}`}
      >
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="hidden text-[10px] tracking-[0.16em] text-stone-600 uppercase sm:block sm:text-xs">
              Daily Edition • Bangladesh • Trusted Local Reporting
            </p>
            <Link
              href="/"
              className={`font-display inline-flex items-center gap-2 font-bold tracking-wide text-stone-900 transition-all duration-200 ${compact ? "text-xl sm:text-3xl" : "text-3xl sm:text-6xl"}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`${compact ? "h-5 w-5" : "h-6 w-6 sm:h-8 sm:w-8"}`}
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              Daily Darpan
            </Link>
            <p
              className={`hidden tracking-[0.08em] text-stone-600 uppercase transition-[max-height,opacity,margin] duration-200 sm:block ${compact ? "mt-0 max-h-0 overflow-hidden text-[10px] opacity-0" : "mt-2 max-h-8 text-xs opacity-100 sm:text-sm"}`}
            >
              The bilingual digital newspaper
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            <p className="hidden text-[10px] font-semibold tracking-widest text-stone-700 uppercase sm:block sm:text-xs">
              {editionTimestamp}
            </p>
            <p className="block font-mono text-[10px] font-semibold tabular-nums text-stone-700 sm:hidden">
              {compactEditionTimestamp}
            </p>
            <div className="flex max-w-34 flex-wrap items-center justify-end gap-1.5 text-[11px] font-semibold sm:max-w-none sm:text-xs">
              {supabase && isAuthenticated ? (
                <>
                  <Link
                    href="/admin"
                    className="rounded-full border border-stone-400 px-2.5 py-1 transition hover:bg-stone-900 hover:text-stone-50"
                  >
                    Admin
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="rounded-full border border-stone-400 px-2.5 py-1 transition hover:bg-stone-900 hover:text-stone-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-full border border-stone-400 px-2.5 py-1 transition hover:bg-stone-900 hover:text-stone-50"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        <nav
          className={`flex flex-wrap items-center gap-2 text-sm font-semibold text-stone-700 transition-[max-height,opacity,padding,margin,border-color] duration-200 ${compact ? "mt-0 max-h-0 overflow-hidden border-transparent pt-0 opacity-0" : "mt-3 max-h-40 border-t border-dashed border-stone-400 pt-3 opacity-100"}`}
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
