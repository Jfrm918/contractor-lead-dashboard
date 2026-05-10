import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — The Plan',
};

/* ============================================================
   The Plan — $10K MRR by April 2027
   Simplified, scannable, trackable. The single source of truth
   for "what are we doing and why."
   ============================================================ */

const MONTHS: { label: string; goal: string; mrr: string; focus: string }[] = [
  { label: 'May 2026 (now)', goal: '1–2 customers', mrr: '$200–$500', focus: 'Vantage live publicly · LLC + bank + Stripe · warm CRE intro pitch Saturday' },
  { label: 'June 2026', goal: '+3 customers', mrr: '$1,000–$1,500', focus: '100 cold emails/week · Tulsa scraper live · free newsletter launches' },
  { label: 'July 2026', goal: '+4 customers', mrr: '$2,000–$2,500', focus: 'OKC metro live (second) · Madison build-in-public starts' },
  { label: 'August 2026', goal: '+5 customers', mrr: '$3,500–$4,500', focus: 'Madison WI live (third) · first case study published' },
  { label: 'September 2026', goal: '+6 customers', mrr: '~$5,500', focus: 'Dallas live (fourth) · programmatic SEO pages live' },
  { label: 'October 2026', goal: '+6 customers', mrr: '~$7,000', focus: 'Annual prepay tier · referral program' },
  { label: 'November 2026', goal: '+6 customers', mrr: '~$8,500', focus: 'Distribution engines producing organic signups' },
  { label: 'December 2026', goal: '+5 customers', mrr: '~$9,500', focus: 'Slow holiday outbound · Pro-tier Q1 budget conversations' },
  { label: 'January–April 2027', goal: '+5/mo', mrr: '$10,000+', focus: 'Compounding — outbound + inbound + referrals stacking' },
];

const ENGINES: { name: string; expected: string; how: string }[] = [
  {
    name: 'Cold email (Madison)',
    expected: '~4 customers/month',
    how: '100 personalized emails per week · I write every one, custom to the prospect\'s actual company permits · ~7% reply, ~50% demo, ~30% close (Lemlist / Mailshake benchmarks)',
  },
  {
    name: "Warm CRE family network",
    expected: '1–2 customers/month',
    how: "Grandma's lender network, Dave Cocolin at Paradigm, and Titan Title relationships create warm paths into lenders, brokers, and title teams · much higher close rate than cold",
  },
  {
    name: 'Free newsletter ("Tulsa Construction Pulse")',
    expected: '~30 customers/year (after ramp)',
    how: 'Free tier of the digest with contact info stripped · build to ~1,000 subscribers in 6 months · ~3% upgrade to paid',
  },
  {
    name: 'Madison build-in-public',
    expected: '1 customer/month from month 6',
    how: 'Weekly LinkedIn + Twitter posts with real numbers · authentic, no spin · drives inbound DMs',
  },
  {
    name: 'Programmatic SEO',
    expected: '0.5–1 customer/month from month 6',
    how: 'One page per Tulsa sponsor/asset · ranks on long-tail "Tulsa commercial permit refinance pipeline" type queries · 6–9 month delay before Google indexes',
  },
];

const NOT_DOING = [
  'No paid ads — margins don\'t support it at our scale',
  'No conferences or trade shows — $5K+ per event for unproven return',
  'No hiring — the model is two humans + AI; if we need a 4th person before $30K MRR, model is broken',
  'No new metros after the first 4 until Tulsa hits $3K MRR — premature expansion kills small companies',
  'No feature creep — only build what 3+ customers ask for',
];

const COSTS: { item: string; monthly: string; note: string }[] = [
  { item: 'Domain + Google Workspace', monthly: '$50', note: '3 mailboxes' },
  { item: 'Apollo (contact data)', monthly: '$99', note: 'Public pricing' },
  { item: 'Hunter (verification)', monthly: '$49', note: 'Public pricing' },
  { item: 'Smartlead (cold email)', monthly: '$94', note: 'Public pricing' },
  { item: 'Vercel + Neon (hosting/DB)', monthly: '$30', note: 'Mostly free tier early' },
  { item: 'Resend (email delivery)', monthly: '$20', note: 'Free up to 3K/mo, then $20' },
  { item: 'Stripe fees', monthly: '~3% revenue', note: 'Built into pricing' },
];

const SCENARIOS: { name: string; customers: string; mrr: string; note: string; tone: 'good' | 'base' | 'bear' }[] = [
  { name: 'Bull case', customers: '60', mrr: '~$14,940/mo', note: 'Distribution engines hit, referrals compound, Pro-tier closes', tone: 'good' },
  { name: 'Base case', customers: '40', mrr: '~$9,960/mo', note: 'Plan executes as written — the target', tone: 'base' },
  { name: 'Bear case', customers: '18', mrr: '~$4,500/mo', note: 'Cold underperforms, slow audience build, only relationship sales · still ~$48K/yr to founders', tone: 'bear' },
];

const NEXT_ACTIONS = [
  'Tomorrow morning: domain decision (vantageco.io if available) + LLC name confirm',
  'Saturday: warm-intro CRE pitch executed — Athena delivers full demo + pitch deck Friday night',
  'Monday: if warm intro validates → Stripe live, customer #1 onboarded · if no → 30-min review, what did we learn, adjust pitch and start Madison\'s outbound list',
];

export default function PlanPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/plan" />
        <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="The plan · single source of truth"
            title="$10,000 a month, by April 2027."
            blurb="The exact path: the math, the engines, what we do, what we don't, what it costs, and what could go wrong. Everything tracked here so we can check our progress weekly."
          />

          <Note>
            <ThesisPill /> Customer count, MRR projections, and conversion rates are projections
            based on published B2B SMB SaaS benchmarks (Lemlist, Mailshake, ChartMogul, SaaStr).
            Real numbers replace these as we measure. Every conversion assumption is editable —
            this plan revises monthly.
          </Note>

          <div className="mt-10" />

          <Section title="The math at the top" eyebrow="The size of the problem">
            <Card>
              <p className="text-[15px] leading-[1.65] text-zinc-100">
                $10,000 MRR ÷ ~$249 average customer (40% Starter / 45% Growth / 15% Pro) ={' '}
                <span className="font-semibold text-amber-300">~40 paying customers.</span>
              </p>
              <p className="mt-3 text-[15px] leading-[1.65] text-zinc-100">
                40 customers in 12 months ={' '}
                <span className="font-semibold text-amber-300">3.3 net new customers per month average.</span>
              </p>
              <p className="mt-3 text-[15px] leading-[1.65] text-zinc-300/85">
                One closed deal every 7–8 working days. Not a moonshot. A daily target.
              </p>
            </Card>
          </Section>

          <Section title="The path month by month" eyebrow="Where we should be">
            <div className="space-y-3">
              {MONTHS.map((m) => (
                <Card key={m.label}>
                  <div className="grid gap-3 lg:grid-cols-[200px,160px,140px,1fr]">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                        {m.label}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                        Goal
                      </div>
                      <div className="mt-0.5 text-[14px] font-medium text-white">{m.goal}</div>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                        MRR target
                      </div>
                      <div className="mt-0.5 text-[14px] font-semibold tabular-nums text-amber-300">
                        {m.mrr}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                        Focus
                      </div>
                      <div className="mt-0.5 text-[13px] leading-[1.5] text-zinc-300/90">{m.focus}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="The five engines that get us there" eyebrow="Customer acquisition channels">
            <div className="space-y-3">
              {ENGINES.map((e, i) => (
                <Card key={e.name}>
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[13px] font-semibold text-amber-300">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="text-[15.5px] font-semibold text-white">{e.name}</h3>
                        <span className="text-[12px] font-semibold tabular-nums text-amber-300">
                          {e.expected}
                        </span>
                      </div>
                      <p className="mt-2 text-[13.5px] leading-[1.6] text-zinc-300/90">{e.how}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="What we are NOT going to do" eyebrow="Discipline">
            <Card>
              <ul className="space-y-2.5 text-[14px] leading-[1.55] text-zinc-200">
                {NOT_DOING.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/80" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </Section>

          <Section title="What it costs to run" eyebrow="Operating cost">
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-[13px]">
                <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Item</th>
                    <th className="px-4 py-2.5 text-right">Monthly</th>
                    <th className="px-4 py-2.5 text-left">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {COSTS.map((c) => (
                    <tr key={c.item}>
                      <td className="px-4 py-2.5 text-white">{c.item}</td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-zinc-100">
                        {c.monthly}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400">{c.note}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.02]">
                    <td className="px-4 py-3 font-semibold text-white">All-in</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-amber-300">
                      ~$340/mo
                    </td>
                    <td className="px-4 py-3 text-zinc-400">Break-even at 3 customers</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[13.5px] leading-[1.6] text-zinc-300/85">
              Every customer past the third is roughly 93 cents on the dollar going to the company.
              Margin compounds fast.
            </p>
          </Section>

          <Section title="Three honest outcomes" eyebrow="Best / base / worst">
            <div className="grid gap-3 lg:grid-cols-3">
              {SCENARIOS.map((s) => (
                <div
                  key={s.name}
                  className={`rounded-2xl border p-5 ${
                    s.tone === 'good'
                      ? 'border-emerald-400/30 bg-emerald-400/[0.05]'
                      : s.tone === 'base'
                        ? 'border-amber-300/40 bg-amber-300/[0.06]'
                        : 'border-white/[0.08] bg-white/[0.02]'
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
                    {s.name}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-white">
                    {s.customers} customers
                  </div>
                  <div
                    className={`mt-1 text-[15px] font-semibold tabular-nums ${
                      s.tone === 'good'
                        ? 'text-emerald-300'
                        : s.tone === 'base'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                    }`}
                  >
                    {s.mrr}
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.55] text-zinc-300/85">{s.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13.5px] leading-[1.6] text-zinc-300/85">
              Even the worst case is real money — $48K/year to the founders from a side business
              with two humans and AI.
            </p>
          </Section>

          <Section title="What happens next" eyebrow="Next 5 days">
            <Card>
              <ol className="space-y-3 text-[14px] leading-[1.6] text-zinc-100">
                {NEXT_ACTIONS.map((a, i) => (
                  <li key={a} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[12px] font-semibold text-amber-300">
                      {i + 1}
                    </span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </Section>
        </main>
      </div>
    </div>
  );
}
