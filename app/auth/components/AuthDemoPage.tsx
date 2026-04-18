import type { ReactNode } from "react";

type AuthDemoPageProps = {
  title: string;
  intro: string;
  steps: string[];
  children: ReactNode;
};

export function AuthDemoPage({
  title,
  intro,
  steps,
  children,
}: AuthDemoPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="paper-surface rounded-2xl p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
          Authentication
        </p>
        <h1 className="font-display mt-2 text-4xl text-stone-900">{title}</h1>
        <p className="mt-2 text-sm text-stone-700">{intro}</p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-stone-700">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">{children}</section>
    </main>
  );
}
