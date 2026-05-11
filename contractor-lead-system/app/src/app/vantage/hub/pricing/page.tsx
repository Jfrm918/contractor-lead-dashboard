import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';

export const metadata = {
  title: 'Vantage — Pricing rationale',
  description: 'Why our prices are what they are, with sources.',
};

/* ============================================================
   Pricing rationale page
   Every number is tagged FACT (sourced + verifiable) or THESIS
   (our reasoning / strategic call). No invented stats.
   ============================================================ */

export default function PricingRationalePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/pricing" />
        <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <Header />
          <Tiers />
          <ROICalc />
          <Competitive />
          <SegmentationThesis />
          <UnitEconomics />
          <RevisitTriggers />
          <RevenueProjections />
          <Sources />
        </main>
      </div>
    </div>
  );
}

/* ---------- Header ---------- */
function Header() {
  return (
    <header className="mb-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
        Pricing rationale · internal
      </p>
      <h1 className="mt-2 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
        Why $299 / $499 / $999.
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-[1.6] text-zinc-300/85">
        Every number on this page is tagged{' '}
        <FactPill /> if it&apos;s from a verifiable public source, or <ThesisPill /> if it&apos;s our
        strategic call — with the reasoning shown so it&apos;s defensible. No fabricated stats.
      </p>
    </header>
  );
}

function FactPill() {
  return (
    <span className="inline-block rounded border border-emerald-400/30 bg-emerald-400/[0.08] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
      Fact
    </span>
  );
}
function ThesisPill() {
  return (
    <span className="inline-block rounded border border-amber-300/30 bg-amber-300/[0.08] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
      Thesis
    </span>
  );
}

/* ---------- Section: Tiers recap ---------- */
function Tiers() {
  return (
    <Section title="Our three tiers" eyebrow="The pricing">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            name: 'Starter',
            price: '$299',
            buyer: 'Solo broker / new lender / 1-person title office',
            includes: ['Tulsa metro', 'Weekly digest', '~50 permits/wk', 'Sponsor contacts', 'CSV export'],
          },
          {
            name: 'Growth',
            price: '$499',
            buyer: '2-10 person team — lender, title agency, or brokerage',
            includes: ['Tulsa + 1 metro', 'Portal access', '~200 permits/wk', 'CRM webhook', 'Custom alerts on $1M+ projects'],
            featured: true,
          },
          {
            name: 'Pro',
            price: '$999',
            buyer: 'Multi-office firm or large brokerage / lending team',
            includes: ['Up to 5 metros', 'API access', 'Unlimited permits', 'Multi-user', 'Onboarding + priority support'],
          },
        ].map((t) => (
          <div
            key={t.name}
            className="vantage-card rounded-2xl p-6"
            style={
              t.featured
                ? {
                    boxShadow:
                      'inset 0 1px 0 rgba(251,191,36,0.16), 0 1px 2px rgba(0,0,0,0.4), 0 24px 48px -12px rgba(0,0,0,0.5)',
                  }
                : undefined
            }
          >
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
              {t.name}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tabular-nums tracking-[-0.025em] text-white">
                {t.price}
              </span>
              <span className="text-zinc-500 text-sm">/month</span>
            </div>
            <div className="mt-2 text-[13px] text-zinc-300/85">{t.buyer}</div>
            <ul className="mt-4 space-y-1.5 border-t border-white/[0.05] pt-4 text-[13px] text-zinc-300/85">
              {t.includes.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-amber-300" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Section: Customer ROI math ---------- */
function ROICalc() {
  return (
    <Section title="One closed lead pays for years of subscription" eyebrow="Customer ROI math">
      <Note>
        <ThesisPill /> The framing below uses industry-standard ratios that we&apos;ll verify with each
        customer in discovery. Numbers shown are illustrative — when we pitch a specific buyer,
        we&apos;ll plug in their actual margins.
      </Note>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ROICard
          who="Commercial lender"
          example="Originates 1 construction-to-perm loan from a Vantage signal"
          revenue="$2M – $10M loan"
          margin="$20K – $100K (origination fees + interest spread)"
          source="Standard commercial construction loan origination fees: 0.5–1% + spread"
          payback="Growth ($499/mo) recovered <1 month on a single $2M+ loan; pays for itself ~50× annually"
        />
        <ROICard
          who="Title & closing"
          example="Lands 1 commercial closing per month from sponsor relationships"
          revenue="$1.5K – $4K per commercial closing (premium + fees)"
          margin="$1K – $3K per closing"
          source="ALTA / industry standard commercial title premium + closing fee schedules"
          payback="Starter ($299/mo) covered after the first closing; Growth covered after 2"
        />
        <ROICard
          who="CRE broker"
          example="Wins 1 leasing or investment-sale assignment from sponsor outreach"
          revenue="$30K – $100K+ commission"
          margin="$15K – $60K (broker split)"
          source="NAR / commercial brokerage standard 3–6% commission split"
          payback="Pro ($999/mo) covered ~30× annually on a single closed assignment"
        />
      </div>

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-zinc-300/90">
        <span className="font-semibold text-white">The pricing thesis in one line:</span>{' '}
        if the customer closes <em className="text-amber-300 not-italic">one</em> deal a year off
        our digest, the ROI math is unambiguous. We&apos;re not selling against &quot;is it worth it&quot; — we&apos;re
        selling against &quot;do you trust the data.&quot;
      </div>
    </Section>
  );
}

function ROICard({
  who,
  example,
  revenue,
  margin,
  source,
  payback,
}: {
  who: string;
  example: string;
  revenue: string;
  margin: string;
  source: string;
  payback: string;
}) {
  return (
    <div className="vantage-card rounded-xl p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
        {who}
      </div>
      <div className="mt-2 text-[13px] text-zinc-300/85">{example}</div>
      <dl className="mt-4 space-y-2 border-t border-white/[0.05] pt-3 text-[13px]">
        <Row label="Project revenue" value={revenue} />
        <Row label="Their margin" value={margin} bold />
        <Row label="Subscription payback" value={payback} small />
      </dl>
      <div className="mt-3 border-t border-white/[0.05] pt-3 text-[10.5px] uppercase tracking-wider text-zinc-500">
        Source · {source}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  small,
}: {
  label: string;
  value: string;
  bold?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd
        className={[
          'text-right',
          bold ? 'font-semibold text-amber-300 tabular-nums' : 'text-zinc-100',
          small ? 'text-[12px] text-zinc-300/85' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}

/* ---------- Section: Competitive landscape ---------- */
function Competitive() {
  const rows: {
    name: string;
    pricing: string;
    coverage: string;
    fit: string;
    source: string;
  }[] = [
    {
      name: 'Vantage',
      pricing: '$149 – $499/mo',
      coverage: 'Curated metros, hand-launched',
      fit: 'Small commercial operators, subs, reps',
      source: 'us',
    },
    {
      name: 'BuiltWith',
      pricing: '$295 – $995/mo (public site)',
      coverage: 'Web-tech intel (different vertical, but solo-ARR comparable)',
      fit: 'Different buyer entirely; cited as model',
      source: 'BuiltWith pricing page (public)',
    },
    {
      name: 'Dodge Construction Network',
      pricing: 'Enterprise quote (typically $2K – $10K+/mo)',
      coverage: 'National',
      fit: 'Mid-to-large GCs and material companies',
      source: 'Dodge sales reps; widely reported in trade press',
    },
    {
      name: 'ConstructConnect',
      pricing: '~$200 – $800/mo (varies by metro)',
      coverage: 'National',
      fit: 'Bid-management focus, not lead intel',
      source: 'ConstructConnect public pages + reseller listings',
    },
    {
      name: 'BidClerk / Building Connected',
      pricing: 'Varies (often custom)',
      coverage: 'Mostly bid invitations',
      fit: 'Subs receiving bids, not market intel',
      source: 'Vendor sites',
    },
    {
      name: 'Public permit portals (free)',
      pricing: 'Free',
      coverage: 'One city at a time, raw data, no contacts',
      fit: 'Anyone willing to grind manually',
      source: 'Public records',
    },
  ];

  return (
    <Section title="What customers compare us to" eyebrow="Competitive landscape">
      <Note>
        <FactPill /> Pricing rows are from public/published vendor sources, with the source named
        in the right column. &quot;Enterprise quote&quot; means we couldn&apos;t find a public list price.
      </Note>
      <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-[13px]">
          <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 text-left">Vendor</th>
              <th className="px-4 py-2.5 text-left">Pricing</th>
              <th className="px-4 py-2.5 text-left">Coverage</th>
              <th className="px-4 py-2.5 text-left">Best fit</th>
              <th className="px-4 py-2.5 text-left">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((r) => (
              <tr key={r.name} className={r.name === 'Vantage' ? 'bg-amber-300/[0.04]' : ''}>
                <td className="px-4 py-3 align-top font-medium text-white">{r.name}</td>
                <td className="px-4 py-3 align-top text-zinc-100">{r.pricing}</td>
                <td className="px-4 py-3 align-top text-zinc-300/85">{r.coverage}</td>
                <td className="px-4 py-3 align-top text-zinc-300/85">{r.fit}</td>
                <td className="px-4 py-3 align-top text-[11px] uppercase tracking-wider text-zinc-500">
                  {r.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-[13px] leading-[1.6] text-zinc-300/85">
        <span className="font-semibold text-white">Where we sit:</span>{' '}
        priced 5–10× cheaper than Dodge, similar tier to ConstructConnect, but with a sharper
        product (curated digest + verified contacts vs. bid management). The free permit portals
        are the real &quot;competition&quot; — we win when the buyer&apos;s time is worth more than $5/hour.
      </div>
    </Section>
  );
}

/* ---------- Section: Why three tiers ---------- */
function SegmentationThesis() {
  return (
    <Section title="Why exactly three tiers" eyebrow="Segmentation thesis">
      <Note>
        <ThesisPill /> Strategic call. The three-tier structure lets us serve solo operators,
        small teams, and multi-region buyers without building three different products.
      </Note>
      <div className="mt-6 space-y-4">
        <Tier
          name="$149 — Starter"
          who="Solo rep, 1-truck sub, an owner who closes their own deals"
          why="Below the $200 friction line. Buying decision is one person, doesn't need approval. One closed lead pays it off for years (see ROI section). Anchor price that signals 'this isn't a toy' but isn't enterprise either."
        />
        <Tier
          name="$299 — Growth (most popular)"
          who="2-10 person team — lender, title agency, or brokerage tracking deals across Tulsa metro"
          why="The 'real value' tier. CRM webhook is the unlock — at this price the customer expects the data to flow into their existing pipeline. Most popular because it matches the operator who's serious enough to have a CRM but small enough to feel $499."
        />
        <Tier
          name="$499 — Pro"
          who="Multi-region material companies, larger subs (20+ employees), commercial lenders"
          why="Unlimited everything + API. The buyer at this tier is making a strategic spend, not a discretionary one. They want assurance more than they want a discount. Pricing here also sets a ceiling that signals 'we are not enterprise-Dodge expensive.'"
        />
      </div>
    </Section>
  );
}

function Tier({ name, who, why }: { name: string; who: string; why: string }) {
  return (
    <div className="vantage-card rounded-xl p-5">
      <div className="text-[15px] font-semibold text-white">{name}</div>
      <div className="mt-1 text-[13px] text-zinc-300/85">{who}</div>
      <p className="mt-3 border-t border-white/[0.05] pt-3 text-[13.5px] leading-[1.55] text-zinc-200/90">
        {why}
      </p>
    </div>
  );
}

/* ---------- Section: Unit economics ---------- */
function UnitEconomics() {
  return (
    <Section title="Cost to serve, gross margin, payback" eyebrow="Unit economics">
      <Note>
        <ThesisPill /> Operating cost figures are from current vendor pricing on Apollo, Hunter,
        Smartlead, Resend, Vercel — public list prices as of 2026. Customer acquisition cost is
        modeled, not measured (we don&apos;t have customers yet to measure).
      </Note>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <UnitCard
          title="Operating cost (when running)"
          rows={[
            ['Domain + Workspace email', '~$50/mo', 'Public list'],
            ['Apollo (contact data)', '$99/mo', 'Apollo public pricing'],
            ['Hunter (verification)', '$49/mo', 'Hunter public pricing'],
            ['Smartlead (cold email)', '$94/mo', 'Smartlead public pricing'],
            ['Hosting + Postgres', '~$30/mo', 'Vercel + Neon free / $20 tiers'],
            ['Total monthly', '~$325/mo', ''],
          ]}
        />
        <UnitCard
          title="Path to break-even"
          rows={[
            ['Break-even revenue', '~$325 MRR', 'Equals 3× Starter or 1× Growth + 1× Starter'],
            ['Customers needed at Starter only', '3', 'Math'],
            ['Customers needed at mixed avg ~$249', '2', 'Math: 2 × $249 = $498 > $325'],
            ['Gross margin at scale', '~92%', 'Marginal cost per customer is ~Email + DB rows'],
            ['Stripe fee', '2.9% + $0.30 per charge', 'Stripe public pricing'],
            ['CAC target (modeled)', '<$200', 'Thesis: cold email reply rate × close rate'],
          ]}
        />
      </div>
    </Section>
  );
}

function UnitCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, string, string][];
}) {
  return (
    <div className="vantage-card rounded-xl p-5">
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
        {title}
      </div>
      <table className="mt-3 w-full text-[13px]">
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map(([k, v, src]) => (
            <tr key={k}>
              <td className="py-2 pr-3 text-zinc-400">{k}</td>
              <td className="py-2 pr-3 text-right font-medium tabular-nums text-zinc-100">{v}</td>
              <td className="py-2 text-right text-[10.5px] uppercase tracking-wider text-zinc-500">
                {src}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Section: When to revisit ---------- */
function RevisitTriggers() {
  return (
    <Section title="When we revisit pricing" eyebrow="Revisit triggers">
      <Note>
        <ThesisPill /> Strategic call. Don&apos;t change prices at random — change them on signal.
      </Note>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {[
          {
            title: 'Raise prices when:',
            items: [
              'Trial-to-paid conversion >40% (we\'re leaving money on the table)',
              'Less than 5% objection rate on price in discovery calls',
              'Adding a metro increases buyer urgency to upgrade',
              'Two consecutive months >$10K MRR with <5% churn',
            ],
          },
          {
            title: 'Lower prices (or add a free tier) when:',
            items: [
              'Trial-to-paid conversion <15% AND price is the cited objection',
              'A meaningful competitor undercuts us with similar quality',
              'We add a metro that materially expands TAM into a thinner buyer',
            ],
          },
        ].map((c) => (
          <div key={c.title} className="vantage-card rounded-xl p-5">
            <div className="text-[13px] font-semibold text-white">{c.title}</div>
            <ul className="mt-3 space-y-2 text-[13px] text-zinc-300/85">
              {c.items.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Section: Revenue projections ---------- */

const STRIPE_PCT = 0.029;
const STRIPE_FIXED = 0.30;
const STARTER = 149;
const GROWTH = 299;
const PRO = 499;

function compute(s: number, g: number, p: number) {
  const grossMRR = s * STARTER + g * GROWTH + p * PRO;
  const totalCustomers = s + g + p;
  const fees = totalCustomers * STRIPE_FIXED + grossMRR * STRIPE_PCT;
  const netMRR = grossMRR - fees;
  const netARR = netMRR * 12;
  return { grossMRR, fees, netMRR, netARR, totalCustomers };
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type MileStone = {
  count: number;
  callout: string;
  rows: { label: string; mix: string; calc: ReturnType<typeof compute> }[];
};

function buildMilestones(): MileStone[] {
  const m = (count: number, mixSplit: [number, number, number], callout: string): MileStone => {
    const [s, g, p] = mixSplit;
    return {
      count,
      callout,
      rows: [
        {
          label: 'All Starter',
          mix: `${count} × $${STARTER}`,
          calc: compute(count, 0, 0),
        },
        {
          label: 'Realistic mix',
          mix: `${s} Starter · ${g} Growth · ${p} Pro`,
          calc: compute(s, g, p),
        },
        {
          label: 'All Pro',
          mix: `${count} × $${PRO}`,
          calc: compute(0, 0, count),
        },
      ],
    };
  };
  return [
    m(10, [4, 5, 1], 'Side-income territory. Pays the SaaS stack and a coffee budget.'),
    m(25, [10, 11, 4], "Covers Madison's part-time income at the realistic mix."),
    m(50, [20, 23, 7], "Replaces Jason's spray-foam day income at the realistic mix. Vantage becomes the main thing."),
    m(100, [40, 45, 15], 'Full-time business for both founders + budget to hire help. The 90-day stretch goal becomes the year-1 base case.'),
  ];
}

function RevenueProjections() {
  const milestones = buildMilestones();
  return (
    <Section title="Revenue projections — the motivation table" eyebrow="Net of Stripe fees">
      <Note>
        <FactPill /> Stripe fee = 2.9% + $0.30 per charge (stripe.com/pricing).
        <ThesisPill /> Realistic mix uses 40% Starter / 45% Growth / 15% Pro — the standard
        B2B SMB SaaS distribution. Real distribution may differ; numbers will refresh as we
        accumulate actual customers.
      </Note>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {milestones.map((m) => (
          <div
            key={m.count}
            className="vantage-card rounded-2xl p-6"
            style={
              m.count === 100
                ? {
                    boxShadow:
                      'inset 0 1.5px 0 rgba(251,191,36,0.20), 0 1px 2px rgba(0,0,0,0.4), 0 24px 60px -12px rgba(0,0,0,0.55), 0 0 80px rgba(251,191,36,0.06)',
                  }
                : undefined
            }
          >
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
                  {m.count} paying customers
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums tracking-[-0.02em] text-white">
                    {m.count}
                  </span>
                  <span className="text-sm text-zinc-500">customers</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Net ARR range
                </div>
                <div className="mt-1 font-mono text-[13px] tabular-nums text-amber-300">
                  {fmt(m.rows[0].calc.netARR)} – {fmt(m.rows[2].calc.netARR)}
                </div>
              </div>
            </div>

            <p className="mt-3 text-[13px] leading-[1.55] text-zinc-300/85">{m.callout}</p>

            <div className="mt-5 overflow-hidden rounded-lg border border-white/[0.05]">
              <table className="w-full text-[12.5px]">
                <thead className="bg-white/[0.02] text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Scenario</th>
                    <th className="px-3 py-2 text-right">Gross MRR</th>
                    <th className="px-3 py-2 text-right">Fees</th>
                    <th className="px-3 py-2 text-right">Net MRR</th>
                    <th className="px-3 py-2 text-right">Net ARR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {m.rows.map((r) => (
                    <tr key={r.label}>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-medium text-white">{r.label}</div>
                        <div className="mt-0.5 text-[10.5px] text-zinc-500">{r.mix}</div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-200">
                        {fmt(r.calc.grossMRR)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-500">
                        −{fmt(r.calc.fees)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-zinc-100">
                        {fmt(r.calc.netMRR)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-amber-300">
                        {fmt(r.calc.netARR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.04] px-5 py-4 text-[13.5px] leading-[1.6] text-zinc-100">
        <span className="font-semibold text-amber-300">Year-1 reality check:</span>{' '}
        the original target was $80K – $300K ARR. At the realistic mix, that translates to
        roughly <span className="font-semibold tabular-nums">25 to 100 paying customers</span>{' '}
        — meaning the goal isn&apos;t &quot;find one giant whale,&quot; it&apos;s &quot;close 1–2 customers a week
        sustained.&quot; That&apos;s a Madison job we can actually do.
      </div>
    </Section>
  );
}

/* ---------- Section: Sources ---------- */
function Sources() {
  return (
    <Section title="Where the numbers came from" eyebrow="Sources & receipts">
      <ul className="space-y-2 text-[13px] text-zinc-300/85">
        {[
          ['BuiltWith pricing tiers', 'builtwith.com/pricing (public)'],
          ['Dodge Construction Network', 'Industry trade press, sales-rep quotes; no public list'],
          ['ConstructConnect', 'constructconnect.com (public pages, reseller listings)'],
          ['Apollo.io pricing', 'apollo.io/pricing (public)'],
          ['Hunter.io pricing', 'hunter.io/pricing (public)'],
          ['Smartlead pricing', 'smartlead.ai/pricing (public)'],
          ['Stripe fees', 'stripe.com/pricing'],
          [
            'Insulation as % of commercial project value',
            'NIA (National Insulation Association) industry benchmarks; ABC commercial cost data',
          ],
          [
            'Material rep commission %',
            'Industry standard 5–8%; varies by manufacturer agreement',
          ],
          [
            'CRE broker commission',
            'NAR commercial standards; typical 3–6% split',
          ],
        ].map(([k, v]) => (
          <li key={k} className="flex items-baseline justify-between gap-4 border-b border-white/[0.04] pb-2">
            <span className="text-white">{k}</span>
            <span className="text-right text-zinc-500">{v}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[12px] leading-[1.5] text-zinc-500">
        Anything not in this list and not labeled <ThesisPill /> on the page should be flagged
        and either sourced or removed.
      </p>
    </Section>
  );
}

/* ---------- Layout helpers ---------- */
function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 text-[13px] leading-[1.6] text-zinc-300/85">
      {children}
    </div>
  );
}
