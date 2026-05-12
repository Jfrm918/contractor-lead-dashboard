import { ReactNode } from "react";

export function Panel({
  children,
  className = "",
  hover = false,
  crisp = false,
  noise = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  crisp?: boolean;
  noise?: boolean;
}) {
  const base = crisp ? "glass-crisp" : "glass";
  const h = hover && !crisp ? "glass-hover cursor-pointer" : "";
  const n = noise ? "noise" : "";
  return <div className={`${base} ${h} ${n} ${className}`}>{children}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)] mb-3">
      <span className="h-px w-6 bg-[var(--line-bright)]" />
      {children}
    </div>
  );
}

export function H1({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`font-display text-5xl sm:text-6xl leading-[1.02] text-balance ${className}`}>{children}</h1>;
}

export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-3xl sm:text-4xl leading-[1.08] text-balance ${className}`}>{children}</h2>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}

export function NeutralChip({ children }: { children: ReactNode }) {
  return <span className="chip chip-neutral">{children}</span>;
}
