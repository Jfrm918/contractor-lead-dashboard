import type { ReactNode } from 'react';

export function HubPageHeader({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <header className="mb-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-[1.6] text-zinc-300/85">{blurb}</p>
    </header>
  );
}

export function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-5">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 text-[13px] leading-[1.6] text-zinc-300/85">
      {children}
    </div>
  );
}

export function FactPill() {
  return (
    <span className="inline-block rounded border border-emerald-400/30 bg-emerald-400/[0.08] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
      Fact
    </span>
  );
}

export function ThesisPill() {
  return (
    <span className="inline-block rounded border border-amber-300/30 bg-amber-300/[0.08] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
      Thesis
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`vantage-card rounded-xl p-5 ${className ?? ''}`}>{children}</div>
  );
}

/* Wrapper for any hub sub-page content. Provides consistent
   max-width and padding. */
export function HubMain({
  active,
  children,
  width = 'max-w-6xl',
}: {
  active: string;
  children: ReactNode;
  width?: string;
}) {
  return (
    <main className={`mx-auto ${width} px-6 py-10 sm:py-14`}>{children}</main>
  );
}
