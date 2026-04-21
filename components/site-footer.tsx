import Link from "next/link";
import { FaFacebookF, FaGlobe, FaInstagram } from "react-icons/fa";

export function SiteFooter() {
  return (
    <footer className="print-hidden mt-10 border-t border-dashed border-stone-400/90 bg-linear-to-b from-[rgba(255,254,249,0.95)] to-[rgba(242,235,222,0.92)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-2xl border border-stone-300 bg-white/70 p-4 sm:p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-stone-600 uppercase">
              Built By
            </p>
            <h2 className="font-display mt-2 text-2xl text-stone-900">
              Daily BRUR Team
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              This newsroom portal was designed and developed by
              <span className="font-display ml-1 text-lg text-(--accent)">
                Rishad Nur
              </span>
              .
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a
                href="https://rishadnur.me"
                target="_blank"
                rel="noreferrer"
                aria-label="Portfolio"
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-400 px-3 py-1 text-xs font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
              >
                <FaGlobe size={13} />
                rishadnur.me
              </a>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <a
                href="https://facebook.com/rishad.nur"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-400 text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
              >
                <FaFacebookF size={14} />
              </a>
              <a
                href="https://instagram.com/rishad.nur"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-400 text-stone-700 transition hover:bg-stone-900 hover:text-stone-50"
              >
                <FaInstagram size={14} />
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-300 bg-white/70 p-4 sm:p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-stone-600 uppercase">
              Emergency Complaint Contact
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-800">
              For urgent complaints about published content:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-stone-700">
              <li>Phone: +880 1700-000000</li>
              <li>Email: complaint@dailydarpan.news</li>
              <li>Response Window: 24-48 hours</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-stone-300 bg-white/70 p-4 sm:p-5 sm:col-span-2 xl:col-span-1">
            <p className="text-xs font-semibold tracking-[0.14em] text-stone-600 uppercase">
              Legal
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Read the legal disclaimer and publication policy for platform
              usage.
            </p>
            <Link
              href="/privacy-policy"
              className="mt-4 inline-flex min-h-11 items-center rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 sm:min-h-10"
            >
              Privacy Policy
            </Link>
          </section>
        </div>
      </div>

      <div className="border-t border-dashed border-stone-400/90 px-4 py-3 text-center text-xs text-stone-600 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Daily BRUR. All rights reserved.
      </div>
    </footer>
  );
}
