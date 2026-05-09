import Link from 'next/link';

const TABS = [
  { href: '/vantage/hub', label: 'Today' },
  { href: '/vantage/hub/plan', label: 'The Plan' },
  { href: '/vantage/hub/morning', label: 'Morning' },
  { href: '/vantage/hub/customers', label: 'Customers' },
  { href: '/vantage/hub/revenue', label: 'Revenue' },
  { href: '/vantage/hub/billing', label: 'Billing' },
  { href: '/vantage/hub/funnel', label: 'Funnel' },
  { href: '/vantage/hub/pricing', label: 'Pricing' },
  { href: '/vantage/hub/competitors', label: 'Competitors' },
  { href: '/vantage/hub/discovery', label: 'Discovery' },
  { href: '/vantage/hub/email', label: 'Cold email' },
  { href: '/vantage/hub/glossary', label: 'Glossary' },
  { href: '/vantage/hub/success', label: 'Customer success' },
  { href: '/vantage/hub/decisions', label: 'Decisions' },
  { href: '/vantage/hub/ideas', label: 'Ideas' },
];

export default function HubNav({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-30 glass-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <Link href="/vantage/hub" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-b from-amber-300 to-amber-500 text-[#1a1306] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.18),0_2px_6px_rgba(251,191,36,0.25)]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4 L20 20 L4 20 Z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tracking-tight">Vantage</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-300/80">
              Hub
            </span>
          </div>
        </Link>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-sm">
          {TABS.map((t) => {
            const selected = t.href === active;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${
                  selected
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-amber-400 transition-opacity ${
                    selected ? 'opacity-90' : 'opacity-0'
                  }`}
                  style={{
                    boxShadow: selected ? '0 0 12px rgba(251,191,36,0.4)' : undefined,
                  }}
                />
              </Link>
            );
          })}
        </nav>
        <Link
          href="/vantage"
          className="vantage-cta-spring inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-md hover:text-white"
        >
          Public site
        </Link>
      </div>
    </header>
  );
}
