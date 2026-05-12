"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/", label: "Overview" },
  { href: "/pricing", label: "Pricing" },
  { href: "/process", label: "Process" },
  { href: "/roles", label: "Roles" },
  { href: "/discovery", label: "Discovery" },
  { href: "/contract", label: "Contract" },
  { href: "/handoff", label: "Handoff" },
  { href: "/pipeline", label: "Pipeline" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] backdrop-blur-2xl bg-[rgba(7,8,12,0.65)]">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logomark />
          <span className="font-display text-[19px] leading-none tracking-tight">Green Country</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)] mt-0.5 hidden sm:inline">Web Co.</span>
        </Link>
        <nav className="flex items-center gap-1 text-[13px]">
          {routes.map((r) => {
            const active = pathname === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  active
                    ? "bg-[rgba(244,241,234,0.08)] text-[var(--ink)] border border-[var(--glass-border)]"
                    : "text-[var(--ink-dim)] hover:text-[var(--ink)] border border-transparent"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Logomark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_8px_rgba(212,165,116,0.4)]">
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="url(#g1)" strokeWidth="1.4" />
      <circle cx="6.5" cy="9" r="0.9" fill="#d4a574" />
      <circle cx="10.5" cy="9" r="0.9" fill="#d4a574" />
      <circle cx="14.5" cy="9" r="0.9" fill="#d4a574" />
      <circle cx="18.5" cy="9" r="0.9" fill="#d4a574" />
      <path d="M6 14h12" stroke="#d4a574" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="g1" x1="2" x2="22" y1="5" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0c590" />
          <stop offset="1" stopColor="#8a7560" />
        </linearGradient>
      </defs>
    </svg>
  );
}
