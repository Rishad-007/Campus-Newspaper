"use client";

import { useMemo, useState } from "react";
import { FaFacebookF } from "react-icons/fa";
import { FaLink, FaPrint, FaXTwitter } from "react-icons/fa6";

type PrintShareActionsProps = {
  title: string;
};

export function PrintShareActions({ title }: PrintShareActionsProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const pageUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.href;
  }, []);

  async function handleCopyLink() {
    if (!pageUrl) return;

    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  async function handleNativeShare() {
    if (!pageUrl || !navigator.share) return;

    try {
      await navigator.share({
        title,
        url: pageUrl,
      });
    } catch {
      // User canceled share dialog.
    }
  }

  const facebookUrl = pageUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
    : "#";
  const xUrl = pageUrl
    ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`
    : "#";

  return (
    <div className="rounded-2xl border border-stone-300 bg-white p-4 shadow-sm print:hidden">
      <h2 className="text-sm font-semibold tracking-[0.18em] text-stone-700 uppercase">
        Share This Story
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
        >
          <FaFacebookF className="text-sm" /> Facebook
        </a>

        <a
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
        >
          <FaXTwitter className="text-sm" /> X
        </a>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
        >
          <FaLink className="text-sm" />
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Copy failed"
              : "Copy link"}
        </button>

        {typeof navigator !== "undefined" &&
          typeof navigator.share === "function" && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
            >
              Share menu
            </button>
          )}

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
        >
          <FaPrint className="text-sm" /> Print PDF
        </button>
      </div>
    </div>
  );
}
