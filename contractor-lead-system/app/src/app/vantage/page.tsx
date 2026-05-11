import Link from 'next/link';
import { CursorGlow, FadeUp, HoverSpot, MouseLight, TiltCard } from './_components/interactions';
import { PREVIEW_TABS } from './_components/previews';
import { VantageAtmosphere } from './_components/shell';

/* ============================================================
   Vantage — landing page
   Refinement pass: Linear/Vercel/Stripe-tier polish.
   - Layered liquid glass via globals.css utilities
   - Hairline gradient dividers, no solid lines
   - Eyebrow labels neutralized; amber reserved for ≤3 high-
     value moments per viewport (live signal, IDs, premium tag)
   - Tightened display tracking, ~80% body opacity
   - Spring micro-interactions: cursor glow, 3D tilt, fade-up
   ============================================================ */

export default function VantageLanding() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <Hairline />
        <Buyers />
        <Hairline />
        <Features />
        <Hairline />
        <SamplePreview />
        <Hairline />
        <Coverage />
        <Hairline />
        <Pricing />
        <Hairline />
        <FAQ />
        <Hairline />
        <Footer />
      </div>
    </div>
  );
}

/* ---------- Hairline gradient divider (replaces solid borders) ---------- */
function Hairline() {
  return (
    <div
      aria-hidden
      className="h-px w-full"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0.08) 82%, transparent 100%)',
      }}
    />
  );
}

/* ---------- Eyebrow label (now neutral; consistent across sections) ---------- */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
      {children}
    </p>
  );
}

/* ---------- Nav ---------- */
function Nav() {
  return (
    <header className="sticky top-0 z-30 glass-nav">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Mark />
          <span className="text-[15px] font-semibold tracking-tight">Vantage</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#product" className="transition-colors hover:text-white">Product</a>
          <a href="#coverage" className="transition-colors hover:text-white">Coverage</a>
          <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:inline">
            Sign in
          </a>
          <a href="#cta" className="vantage-cta-spring rounded-md bg-white px-3.5 py-2 text-sm font-medium text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.4)]">
            Start trial
          </a>
        </div>
      </div>
    </header>
  );
}

function Mark() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-b from-amber-300 to-amber-500 text-[#1a1306] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.18),0_2px_6px_rgba(251,191,36,0.25)]">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4 L20 20 L4 20 Z" />
      </svg>
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative">
      <CursorGlow>
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:py-24 lg:grid-cols-[1.05fr,1fr] lg:gap-20">
          <FadeUp className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-amber-300/90 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-amber-400 opacity-50 blur-[2px]" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-amber-400" />
              </span>
              Live · 12,847 permits indexed this week
            </div>

            <h1 className="mt-6 max-w-xl text-balance text-5xl font-semibold tracking-[-0.03em] text-white sm:text-[64px] sm:leading-[1.05]">
              The deal signal for Tulsa commercial real estate.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-[1.6] text-zinc-300/90">
              Vantage tracks every commercial construction permit in Tulsa daily — with sponsor
              name, project value, and direct contact already attached. Lenders see construction
              loan and refi opportunities. Title companies see future closings. Brokers see
              tenant-rep and investment plays. One feed, four audiences.
            </p>

            <form className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row" id="cta-top">
              <input
                type="email"
                required
                placeholder="Work email"
                className="flex-1 rounded-md border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 backdrop-blur-md transition-all focus:border-amber-400/40 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-400/15"
              />
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-xl opacity-70 blur-xl"
                  style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.15), transparent 70%)' }}
                />
                <button
                  type="submit"
                  className="vantage-cta-spring relative rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_-8px_rgba(251,191,36,0.18)]"
                >
                  Start free trial
                </button>
              </div>
            </form>
            <p className="mt-3 text-xs text-zinc-500">14-day trial. No card required.</p>

            <div className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.3),0_20px_60px_-20px_rgba(0,0,0,0.5)]">
              <Stat value="$1.42B" label="Tracked this week" />
              <Stat value="4" label="Metros live" />
              <Stat value="98.4%" label="Contact deliverability" />
            </div>
          </FadeUp>

          <FadeUp delay={120} className="relative z-10 lg:pl-2">
            <TiltCard>
              <HeroPreview />
            </TiltCard>
          </FadeUp>
        </div>
      </CursorGlow>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#0a0e18]/40 px-4 py-4 text-center sm:text-left sm:px-5">
      <div className="text-xl font-semibold tabular-nums tracking-[-0.02em] text-white sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="glass-elevated glass-textured relative overflow-hidden">
      <span className="glass-grain" />
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.06)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.06)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.06)]" />
          </div>
          <div className="font-mono text-[11px] text-zinc-500">vantage.app/feed/tulsa</div>
          <div className="w-12" />
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Tulsa, OK · This week</span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="font-mono tabular-nums">Updated 11m ago</span>
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/20 backdrop-blur-md">
            {[
              ['TUL-04832', 'Warehouse · 24,800 sf', 'Crossland', '$2.4M'],
              ['TUL-04829', 'Multi-family · 128 units', 'Manhattan', '$18M'],
              ['TUL-04841', 'Self-storage', 'BL Harbert', '$4.1M'],
              ['TUL-04847', 'Restaurant TI', 'Wallace', '$680K'],
              ['TUL-04851', 'Office reno', 'Flintco', '$1.1M'],
              ['TUL-04863', 'School addition', 'Manhattan', '$3.8M'],
            ].map((r, i) => (
              <div
                key={r[0]}
                className={`grid grid-cols-[78px,1fr,90px,68px] items-center gap-3 px-3.5 py-2.5 text-[13px] transition-colors hover:bg-white/[0.025] ${
                  i > 0 ? 'border-t border-white/[0.04]' : ''
                }`}
              >
                <span className="font-mono text-[11px] text-amber-400">{r[0]}</span>
                <span className="truncate text-zinc-100">{r[1]}</span>
                <span className="truncate text-zinc-400">{r[2]}</span>
                <span className="text-right font-medium tabular-nums text-zinc-100">{r[3]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Showing 6 of 47</span>
            <span className="font-mono tabular-nums">Next refresh · Mon 6:00 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Who it's for ---------- */
function Buyers() {
  return (
    <section>
      <FadeUp>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <Eyebrow>Built for</Eyebrow>
          <div className="mt-5 grid gap-x-10 gap-y-3 text-[15px] text-zinc-300/90 sm:grid-cols-2 lg:grid-cols-4">
            <div>Commercial lenders &amp; private credit</div>
            <div>Title &amp; closing companies</div>
            <div>CRE brokers (tenant + landlord rep)</div>
            <div>Active developers &amp; investors</div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ---------- Features ---------- */
function Features() {
  const features = [
    {
      title: 'Verified sponsor contacts',
      body:
        "Every permit ships with the project sponsor (the borrower / owner / developer), email, and direct phone — pulled from the city's official applicant record. Bounce-tested before delivery.",
    },
    {
      title: 'Project enrichment',
      body:
        "Square footage, estimated valuation, project type, parcel ID, and contractor on file — straight from the city's permit record, ready to drop into your CRM or underwriting workflow.",
    },
    {
      title: 'CRM-ready delivery',
      body:
        'Monday digest by email. Higher tiers push directly to HubSpot, Salesforce, or your webhook of choice. Export to CSV anytime.',
    },
  ];
  return (
    <section id="product">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>What you get</Eyebrow>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Permit data structured the way sales teams actually use it.
            </h2>
          </div>
        </FadeUp>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 60}>
              <div className="glass-subtle h-full p-6">
                <div className="relative z-10">
                  <h3 className="text-base font-semibold tracking-[-0.01em] text-white">{f.title}</h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-zinc-300/85">{f.body}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Sample preview (interactive teaser cards) ---------- */
function SamplePreview() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <Eyebrow>How it lands</Eyebrow>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Three ways to read your data.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-zinc-300/85">
            Email digest for your Monday read. Live portal when you need to dig in. Webhooks
            straight into your CRM when you want it on rails. Click any surface to open the full
            preview.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PREVIEW_TABS.map((t, i) => (
            <Link
              key={t.href}
              href={t.href}
              className="vantage-card vantage-card-link rounded-2xl"
            >
              <HoverSpot className="h-full rounded-2xl">
                <div className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
                        {t.subtitle}
                      </div>
                      <div className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white">
                        {t.label}
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] tabular-nums text-zinc-500"
                    >
                      {String(i + 1).padStart(2, '0')} / 03
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-[1.55] text-zinc-300/85">{t.blurb}</p>

                  {/* Mini visualization per tab */}
                  <div className="mt-6 flex-1">
                    <PreviewMini kind={t.href} />
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-amber-300 group-hover:text-amber-200">
                    Open preview
                    <svg className="h-3.5 w-3.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </div>
                </div>
              </HoverSpot>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Tiny per-tab visualization that hints at what's behind the click */
function PreviewMini({ kind }: { kind: string }) {
  if (kind === '/vantage/preview/digest') {
    return (
      <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/20">
        <div className="border-b border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Inbox · Mon 6:00 AM
        </div>
        <div className="space-y-1.5 p-3">
          {[
            ['TUL-04832', 'Warehouse', '$2.4M'],
            ['TUL-04829', 'Multi-family', '$18M'],
            ['TUL-04841', 'Self-storage', '$4.1M'],
          ].map((r) => (
            <div key={r[0]} className="grid grid-cols-[64px,1fr,auto] items-center gap-2 text-[11.5px]">
              <span className="font-mono text-amber-400">{r[0]}</span>
              <span className="truncate text-zinc-200">{r[1]}</span>
              <span className="font-medium tabular-nums text-zinc-100">{r[2]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === '/vantage/preview/portal') {
    return (
      <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/20">
        <div className="grid grid-cols-3 divide-x divide-white/[0.04] border-b border-white/[0.06]">
          {[
            ['47', 'New'],
            ['$38.2M', 'Value'],
            ['12', 'Match'],
          ].map(([v, l]) => (
            <div key={l} className="px-2 py-2 text-center">
              <div className="text-[13px] font-semibold tabular-nums text-white">{v}</div>
              <div className="mt-0.5 text-[9.5px] uppercase tracking-wider text-zinc-500">{l}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1 p-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-amber-400 to-amber-500/70" />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div className="h-full w-[52%] rounded-full bg-gradient-to-r from-amber-400 to-amber-500/70" />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div className="h-full w-[33%] rounded-full bg-gradient-to-r from-amber-400 to-amber-500/70" />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div className="h-full w-[22%] rounded-full bg-gradient-to-r from-amber-400 to-amber-500/70" />
          </div>
        </div>
      </div>
    );
  }
  // webhook
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/30 font-mono text-[11px] leading-[1.55]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 font-mono font-semibold text-emerald-300">
          POST
        </span>
        <span className="truncate text-zinc-300 normal-case tracking-normal">/vantage</span>
        <span className="ml-auto normal-case tracking-normal text-zinc-600">200</span>
      </div>
      <div className="px-3 py-2 text-zinc-300">
        <div><span className="text-zinc-500">{`{`}</span></div>
        <div className="pl-3">
          <span className="text-amber-300/90">"permit_id"</span>
          <span className="text-zinc-500">: </span>
          <span className="text-emerald-300/90">"TUL-2026-04832"</span>
          <span className="text-zinc-500">,</span>
        </div>
        <div className="pl-3">
          <span className="text-amber-300/90">"value_max"</span>
          <span className="text-zinc-500">: </span>
          <span className="text-zinc-100">3200000</span>
        </div>
        <div><span className="text-zinc-500">{`}`}</span></div>
      </div>
    </div>
  );
}


/* ---------- Coverage ---------- */
function Coverage() {
  const metros = [
    { city: 'Tulsa, OK', live: true, note: 'City + Tulsa County' },
    { city: 'Oklahoma City, OK', live: true, note: 'OKC + 4 surrounding counties' },
    { city: 'Madison, WI', live: true, note: 'Dane County + Madison metro' },
    { city: 'Dallas, TX', live: true, note: 'Dallas + Collin + Tarrant' },
    { city: 'Austin, TX', live: false, note: 'Q3 2026' },
    { city: 'Denver, CO', live: false, note: 'Q3 2026' },
    { city: 'Nashville, TN', live: false, note: 'Q4 2026' },
    { city: 'Phoenix, AZ', live: false, note: 'Q4 2026' },
  ];
  return (
    <section id="coverage">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>Coverage</Eyebrow>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Four metros live. Four more shipping this year.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.6] text-zinc-300/85">
              We launch each new metro by hand — verifying every city and county portal, mapping the
              local permit codes, and standardizing the data before we sell it. No "national coverage"
              handwave.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={80}>
          <div className="mt-12 glass-subtle overflow-hidden">
            <div className="relative z-10">
              <div className="grid grid-cols-[1fr,1.4fr,80px] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <div>Metro</div>
                <div>Coverage area</div>
                <div className="text-right">Status</div>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {metros.map((m) => (
                  <div
                    key={m.city}
                    className="grid grid-cols-[1fr,1.4fr,80px] items-center gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="font-medium text-white">{m.city}</div>
                    <div className="text-zinc-300/85">{m.note}</div>
                    <div className="text-right">
                      {m.live ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                          Soon
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: 149,
      blurb: 'For solo reps in one metro.',
      features: ['1 metro', 'Weekly digest by email', 'Up to 50 permits/week', 'CSV export'],
      cta: 'Start trial',
      featured: false,
    },
    {
      name: 'Growth',
      price: 299,
      blurb: 'For solo brokers and small title teams.',
      features: [
        '3 metros',
        'Weekly digest + portal access',
        'Up to 200 permits/week',
        'CRM webhook (HubSpot, Salesforce)',
        'Custom alert filters',
      ],
      cta: 'Start trial',
      featured: true,
    },
    {
      name: 'Pro',
      price: 499,
      blurb: 'For multi-region operators.',
      features: [
        'Unlimited metros',
        'Full API access',
        'Unlimited permits',
        'Dedicated onboarding',
        'Priority support',
      ],
      cta: 'Start trial',
      featured: false,
    },
  ];
  return (
    <section id="pricing">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Recover one project, you're paid for a year.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.6] text-zinc-300/85">
              14-day free trial. Monthly billing. Cancel anytime, no annual lock-in.
            </p>
          </div>
        </FadeUp>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <FadeUp key={t.name} delay={i * 60}>
              <div
                className={t.featured ? 'glass-elevated relative h-full p-8' : 'glass-subtle h-full p-8'}
                style={
                  t.featured
                    ? {
                        boxShadow:
                          'inset 0 1.5px 0 rgba(251,191,36,0.18), inset 1px 0 0 rgba(255,255,255,0.05), inset -1px 0 0 rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.4), 0 24px 48px -12px rgba(0,0,0,0.5), 0 0 60px rgba(251,191,36,0.04)',
                      }
                    : undefined
                }
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-semibold tracking-tight text-white">{t.name}</div>
                    {t.featured && (
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        Most popular
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tracking-[-0.025em] tabular-nums text-white">
                      ${t.price}
                    </span>
                    <span className="text-zinc-500">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300/85">{t.blurb}</p>
                  <ul className="mt-8 space-y-3 text-sm">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-400"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 8l3.5 3.5L13 4.5" />
                        </svg>
                        <span className="text-zinc-300/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#cta"
                    className={`vantage-cta-spring mt-10 rounded-md px-4 py-2.5 text-center text-sm font-medium ${
                      t.featured
                        ? 'bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_-8px_rgba(251,191,36,0.18)]'
                        : 'border border-white/10 bg-white/[0.04] text-white backdrop-blur-md'
                    }`}
                  >
                    {t.cta}
                  </a>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const items = [
    {
      q: 'Where does the data come from?',
      a: 'City and county building department portals. Construction permits are public record — we collect them, verify them, structure them, and ship them on a schedule.',
    },
    {
      q: 'How fresh is the data?',
      a: 'We pull every covered portal nightly. The Monday digest covers every permit filed in the previous seven days. Pro tier customers get same-day alerts on permits matching their filters.',
    },
    {
      q: 'How accurate are the contacts?',
      a: 'Every email is bounce-tested before delivery. We re-verify sponsor contacts weekly against public records (city applicant filings + secretary-of-state entity lookups). If a contact bounces, we replace it and notify you.',
    },
    {
      q: 'Can I get a sample before I sign up?',
      a: 'Yes. Click the sample digest above to see exactly what arrives every Monday. The free trial gives you the next two weeks of digests with no card on file.',
    },
    {
      q: 'Do you offer custom metros?',
      a: 'Pro tier includes one custom metro at no additional cost. Add additional metros for $99 each per month.',
    },
  ];
  return (
    <section id="faq">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-16 md:grid-cols-[1fr,1.6fr]">
          <FadeUp>
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Common questions.
              </h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-zinc-300/85">
                Still have a question? Email{' '}
                <a href="mailto:hello@vantageco.io" className="text-white underline underline-offset-2">
                  hello@vantageco.io
                </a>{' '}
                — we reply same day.
              </p>
            </div>
          </FadeUp>
          <div className="border-y border-white/[0.06]">
            {items.map((it, i) => (
              <FadeUp key={it.q} delay={i * 50}>
                <div className={`py-6 ${i > 0 ? 'border-t border-white/[0.06]' : ''}`}>
                  <h3 className="text-base font-semibold tracking-[-0.01em] text-white">{it.q}</h3>
                  <p className="mt-2 text-[15px] leading-[1.6] text-zinc-300/85">{it.a}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer id="cta" className="relative">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <FadeUp>
          <div className="glass-elevated p-10 sm:p-14">
            <div className="relative z-10">
              <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr] lg:gap-16">
                <div>
                  <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                    Start with two free weeks.
                  </h2>
                  <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-zinc-300/85">
                    We onboard the first 20 customers personally. One email and you're in.
                  </p>
                </div>
                <form className="flex flex-col gap-3 sm:flex-row lg:items-center lg:self-end">
                  <input
                    type="email"
                    required
                    placeholder="Work email"
                    className="flex-1 rounded-md border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 backdrop-blur-md focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/15"
                  />
                  <div className="relative">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-2 rounded-xl opacity-70 blur-xl"
                      style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.15), transparent 70%)' }}
                    />
                    <button
                      type="submit"
                      className="vantage-cta-spring relative rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_-8px_rgba(251,191,36,0.18)]"
                    >
                      Start trial
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </FadeUp>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 text-sm text-zinc-500 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Mark />
            <span className="text-zinc-300">Vantage</span>
            <span>·</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="mailto:hello@vantageco.io" className="hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
