import Link from 'next/link';

/* Shared atmospheric background — used by /vantage and every
   /vantage/preview/* route. Animated warm amber drifts via CSS.
   Render <MouseLight /> as a sibling, NOT inside this, so the
   halo can paint above content. */
/* Atmosphere intentionally empty — flat black background only. */
export function VantageAtmosphere() {
  return null;
}

/* Top nav for preview pages — minimal, brand left, back link right */
export function VantagePreviewNav() {
  return (
    <header className="sticky top-0 z-30 glass-nav">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/vantage" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-b from-amber-300 to-amber-500 text-[#1a1306] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.18),0_2px_6px_rgba(251,191,36,0.25)]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4 L20 20 L4 20 Z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-100">Vantage</span>
        </Link>
        <Link
          href="/vantage"
          className="vantage-cta-spring inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-zinc-200 backdrop-blur-md hover:text-white"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8H3M7 4 3 8l4 4" />
          </svg>
          Back to Vantage
        </Link>
      </div>
    </header>
  );
}
