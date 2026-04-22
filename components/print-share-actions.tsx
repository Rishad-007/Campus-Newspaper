"use client";

import { useState } from "react";
import { FaFacebookF } from "react-icons/fa";
import { FaLink, FaPrint, FaXTwitter } from "react-icons/fa6";

type PrintShareActionsProps = {
  title: string;
  printUrl?: string;
  pageUrl?: string;
};

export function PrintShareActions({ title, printUrl, pageUrl: propPageUrl }: PrintShareActionsProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const pageUrl = propPageUrl ?? (typeof window !== "undefined" ? window.location.href : "");
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

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
    if (!pageUrl) return;

    if (!navigator.share) {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setCopyState("copied");
      } catch {
        setCopyState("failed");
      }

      window.setTimeout(() => setCopyState("idle"), 1800);
      return;
    }

    try {
      await navigator.share({
        title,
        url: pageUrl,
      });
    } catch {
      // User canceled share dialog.
    }
  }

  function handlePrint() {
    if (printUrl) {
      window.location.href = printUrl;
      return;
    }

    if (typeof window !== "undefined" && typeof window.print === "function") {
      window.print();
    }
  }

  const facebookUrl = pageUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
    : "#";
  const xUrl = pageUrl
    ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`
    : "#";

  return (
    <div className="rounded-2xl border border-stone-300 bg-white p-4 shadow-sm print:hidden sm:p-5">
      <h2 className="text-sm font-semibold tracking-[0.18em] text-stone-700 uppercase">
        Share This Story
      </h2>

      <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 sm:min-h-10 sm:justify-start"
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
        >
          <FaFacebookF className="text-sm" /> Facebook
        </a>

        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 sm:min-h-10 sm:justify-start"
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
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 sm:min-h-10 sm:justify-start"
        >
          <FaLink className="text-sm" />
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Copy failed"
              : "Copy link"}
        </button>

        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-stone-50 disabled:hover:text-stone-700 sm:min-h-10"
        >
          {canNativeShare ? "Open share menu" : "Copy link"}
        </button>

        <a
          href={printUrl ?? pageUrl}
          onClick={(event) => {
            if (printUrl) {
              event.preventDefault();
              handlePrint();
            }
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold tracking-wide text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 sm:min-h-10 sm:justify-start"
        >
          <FaPrint className="text-sm" /> Print PDF
        </a>
      </div>
    </div>
  );
}
