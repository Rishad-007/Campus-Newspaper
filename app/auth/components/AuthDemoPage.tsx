import type { ReactNode } from "react";

type AuthDemoPageProps = {
  title: string;
  intro?: string;
  steps?: string[];
  children: ReactNode;
};

export function AuthDemoPage({
  title,
  intro,
  steps,
  children,
}: AuthDemoPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-5 sm:px-6 sm:py-8">
      <section className="paper-surface rounded-2xl p-6 sm:p-8">
        <h1 className="font-display text-center text-3xl text-stone-900 sm:text-4xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-2 text-center text-sm leading-6 text-stone-700">
            {intro}
          </p>
        )}
        {steps && steps.length > 0 && (
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-stone-700">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-4">{children}</section>
    </main>
  );
}
