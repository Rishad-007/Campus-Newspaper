import Link from "next/link";

export default function AdminPreviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
              UI Preview
            </p>
            <h1 className="font-display mt-2 text-3xl text-stone-900 sm:text-5xl">
              Admin Newsroom Desk
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700"
          >
            Back to site
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <article className="paper-surface rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-2xl text-stone-900">
            Create New Story
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Frontend-only form now. On next phase we will connect this to
            Supabase auth, roles, storage, and moderation.
          </p>

          <form className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-700">
                Headline
              </span>
              <input
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                placeholder="Enter title in English or Bangla"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-700">
                Excerpt
              </span>
              <textarea
                rows={3}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                placeholder="Short summary"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-700">
                  Category
                </span>
                <select className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring">
                  <option>City</option>
                  <option>Sports</option>
                  <option>Health</option>
                  <option>Education</option>
                  <option>Economy</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-700">
                  Tags
                </span>
                <input
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                  placeholder="comma,separated,tags"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-700">Body</span>
              <textarea
                rows={8}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                placeholder="Write full news content"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-700">
                Hero image
              </span>
              <div className="rounded-lg border border-dashed border-stone-400 bg-stone-50 p-5 text-sm text-stone-600">
                Upload area (UI only). Next step will connect Supabase Storage
                free tier with validation.
              </div>
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                className="rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700"
              >
                Save Draft
              </button>
              <button
                type="button"
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Submit for Review
              </button>
            </div>
          </form>
        </article>

        <aside className="space-y-4">
          <section className="paper-surface rounded-2xl p-5">
            <h3 className="font-display text-xl text-stone-900">
              Workflow Stages
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>Draft</li>
              <li>Submitted</li>
              <li>Approved</li>
              <li>Published</li>
            </ul>
          </section>

          <section className="paper-surface rounded-2xl p-5">
            <h3 className="font-display text-xl text-stone-900">
              Role Limits (Preview)
            </h3>
            <p className="mt-3 text-sm text-stone-700">
              Writer can draft and submit. Editor and Owner can approve and
              publish. Owner can manage admins.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
