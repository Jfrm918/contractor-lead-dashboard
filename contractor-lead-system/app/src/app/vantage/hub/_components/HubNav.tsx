import Link from 'next/link';

type Category = 'live' | 'ops' | 'sales' | 'strategy' | 'reference';

type Tab = {
  href: string;
  label: string;
  category: Category;
};

const TABS: Tab[] = [
  // LIVE — the actual product output
  { href: '/vantage/hub/tulsa', label: 'Tulsa · live', category: 'live' },

  // OPS — daily operator surface
  { href: '/vantage/hub', label: 'Today', category: 'ops' },
  { href: '/vantage/hub/morning', label: 'Morning briefing', category: 'ops' },
  { href: '/vantage/hub/customers', label: 'Customers', category: 'ops' },
  { href: '/vantage/hub/revenue', label: 'Revenue', category: 'ops' },
  { href: '/vantage/hub/billing', label: 'Billing', category: 'ops' },
  { href: '/vantage/hub/funnel', label: 'Funnel', category: 'ops' },

  // SALES — how we get and convert customers
  { href: '/vantage/hub/discovery', label: 'Discovery', category: 'sales' },
  { href: '/vantage/hub/email', label: 'Cold email', category: 'sales' },
  { href: '/vantage/hub/pricing', label: 'Pricing', category: 'sales' },
  { href: '/vantage/hub/competitors', label: 'Competitors', category: 'sales' },

  // STRATEGY — planning + decisions
  { href: '/vantage/hub/plan', label: 'The Plan', category: 'strategy' },
  { href: '/vantage/hub/decisions', label: 'Decisions', category: 'strategy' },
  { href: '/vantage/hub/ideas', label: 'Ideas', category: 'strategy' },

  // REFERENCE — low-traffic, on-demand
  { href: '/vantage/hub/success', label: 'Customer success', category: 'reference' },
  { href: '/vantage/hub/glossary', label: 'Glossary', category: 'reference' },
];

const CATEGORY_LABELS: Record<Category, string> = {
  live: 'Live',
  ops: 'Ops',
  sales: 'Sales',
  strategy: 'Strategy',
  reference: 'Reference',
};

const CATEGORY_ORDER: Category[] = ['live', 'ops', 'sales', 'strategy', 'reference'];

function getCategoryForActive(active: string): Category {
  const tab = TABS.find((t) => t.href === active);
  return tab?.category ?? 'live';
}

export default function HubNav({ active }: { active: string }) {
  const activeCategory = getCategoryForActive(active);
  const visibleTabs = TABS.filter((t) => t.category === activeCategory);

  return (
    <header className="sticky top-0 z-30 glass-nav">
      {/* Top row: brand + category selector + public site link */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-6">
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

        {/* Category selector — small caps, click jumps to the first tab in that category */}
        <nav className="flex flex-1 items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
          {CATEGORY_ORDER.map((cat) => {
            const firstTabInCat = TABS.find((t) => t.category === cat);
            if (!firstTabInCat) return null;
            const selected = cat === activeCategory;
            return (
              <Link
                key={cat}
                href={firstTabInCat.href}
                className={`relative whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${
                  selected ? 'text-amber-200' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {CATEGORY_LABELS[cat]}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-1 h-[2px] rounded-full bg-amber-400 transition-opacity ${
                    selected ? 'opacity-90' : 'opacity-0'
                  }`}
                  style={{ boxShadow: selected ? '0 0 12px rgba(251,191,36,0.4)' : undefined }}
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

      {/* Bottom row: tabs within the active category */}
      <div className="border-t border-white/[0.04]">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 overflow-x-auto px-6 text-sm">
          {visibleTabs.map((t) => {
            const selected = t.href === active;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${
                  selected ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-amber-400 transition-opacity ${
                    selected ? 'opacity-90' : 'opacity-0'
                  }`}
                  style={{ boxShadow: selected ? '0 0 12px rgba(251,191,36,0.4)' : undefined }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
