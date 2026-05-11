import Link from 'next/link';
import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, FactPill, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — Morning briefing',
};

/* ============================================================
   Morning briefing — what Jason reads with his coffee.
   Auto-generated overnight status; Athena rewrites this page
   each session to reflect actual progress.
   ============================================================ */

const BRIEFING_DATE = '2026-05-06 (Wednesday morning)';
const SESSION_NOTE =
  '2026-05-05 22:00–22:30 evening session. Madison + Jason approved 9-route hub build. Athena saving session state and queueing improvement work for next session.';

const SHIPPED_OVERNIGHT: { item: string; route?: string; status: 'done' | 'queued' | 'partial' }[] = [
  { item: 'Hub built — 9 routes (Today, Pricing, Discovery, Email, Glossary, Decisions, Competitors, Funnel, Customer Success)', status: 'done' },
  { item: 'Revenue projection table at bottom of pricing page (10/25/50/100 customers, 3 mixes, net of Stripe fees)', route: '/vantage/hub/pricing', status: 'done' },
  { item: 'App-wide rebrand: "LeadRecovery Pro" → "Vantage" (28 replacements, 11 files)', status: 'done' },
  { item: 'Operating rule locked: every claim FACT-tagged or THESIS-tagged', status: 'done' },
  { item: 'Morning briefing + ideas backlog routes added to hub nav', status: 'done' },
  { item: 'Auth gate on /vantage/hub (cookie + passcode middleware)', status: 'queued' },
  { item: 'Postgres migration for hub data (multi-device sync)', status: 'queued' },
  { item: 'Tulsa permit scraper MVP (separate Node script, validates data accessibility)', status: 'queued' },
];

const DECISIONS_AWAITING: { topic: string; options: string; recommendation: string }[] = [
  {
    topic: 'Domain',
    options: 'vantageco.io · vantagepermits.com · vantagedaily.io · thevantage.io',
    recommendation: 'vantageco.io primary, vantagepermits.com defensive. Both confirmed available. Hold off purchase until product is proven and polished.',
  },
  {
    topic: 'LLC name',
    options: 'Vantage LLC · Vantage Group LLC · Hadrava Data LLC',
    recommendation: 'Vantage LLC — exact-match brand, simplest to remember, easiest for invoicing.',
  },
  {
    topic: 'Madison email signature',
    options: 'Co-founder · Co-owner · Director of Customer Operations · just "Madison Hadrava, Vantage"',
    recommendation: '"Madison Hadrava · Co-founder, Vantage" — co-founder reads sharper than co-owner in B2B. Authentic and credible.',
  },
];

const SATURDAY_EXECUTION: { who: string; tasks: string[] }[] = [
  {
    who: 'Jason (≈3 hours)',
    tasks: [
      'File Vantage LLC at OK Secretary of State (~30 min, $100)',
      'Lock domain via Cloudflare Registrar or Namecheap (~10 min, ~$15)',
      'Open business bank account (Mercury or Relay — both online, ~30 min)',
      'Push current Next.js app to Vercel under the new domain',
      'Set up Google Workspace (3 mailboxes: madison@, jason@, hello@) (~15 min, $36/mo)',
    ],
  },
  {
    who: 'Madison (≈2 hours)',
    tasks: [
      'Build the 200-prospect list — Tulsa commercial lenders + title/closing teams + CRE brokers + sponsors',
      'Use Apollo.io (free tier) + LinkedIn Sales Navigator trial + Google Maps + the city portal directly',
      'Drop each one into /vantage/hub prospect pipeline as you go',
      'No outreach yet — just list-build. Outreach starts Monday with verified mailbox at @vantageco.io',
    ],
  },
];

const TONIGHT_HIGHEST_LEVERAGE_NEXT_TIME: string[] = [
  'Postgres migration for hub data (so Madison + Jason see same prospects across devices) — ~2 hours',
  'Auth gate on /vantage/hub (cookie + passcode middleware) — ~30 min, required before Saturday domain push',
  'Real Tulsa permit scraper MVP (Node script, dump to JSON, validate data shape) — ~90 min',
  'Wire HubClient to ingest scraped permits (turns the prospect pipeline into something Madison can actually grind through every morning) — ~60 min',
  'Stripe checkout flow MVP for $149 Starter tier (so the moment Madison has a verbal commit, we can take money same-day) — ~90 min',
];

export default function MorningBriefingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/morning" />
        <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow={`Morning briefing · ${BRIEFING_DATE}`}
            title="Coffee. Five minutes. Then we move."
            blurb="What shipped overnight, what's waiting on your call, what to execute Saturday. Read top-to-bottom."
          />

          <Note>
            <FactPill /> Status of every &quot;done&quot; item is reflected in the live codebase (you can verify
            by visiting the linked route). <ThesisPill /> Recommendations on decisions are Athena&apos;s
            opinion with reasoning — you decide.
          </Note>

          <div className="mt-10" />

          <Section title="Shipped overnight" eyebrow="Done · Queued · Partial">
            <div className="space-y-3">
              {SHIPPED_OVERNIGHT.map((s) => (
                <div
                  key={s.item}
                  className="flex items-start gap-4 rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3"
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                      s.status === 'done'
                        ? 'border border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300'
                        : s.status === 'partial'
                          ? 'border border-amber-300/30 bg-amber-300/[0.08] text-amber-300'
                          : 'border border-white/10 bg-white/[0.04] text-zinc-400'
                    }`}
                  >
                    {s.status === 'done' ? '✓' : s.status === 'partial' ? '½' : '·'}
                  </span>
                  <div className="flex-1">
                    <p className="text-[14px] leading-[1.5] text-zinc-100">{s.item}</p>
                    {s.route && (
                      <Link
                        href={s.route}
                        className="mt-1 inline-block text-[12px] font-medium text-amber-300 hover:text-amber-200"
                      >
                        Open {s.route} →
                      </Link>
                    )}
                  </div>
                  <span className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] leading-[1.6] text-zinc-500">
              Session note · {SESSION_NOTE}
            </p>
          </Section>

          <Section title="Decisions awaiting your call" eyebrow="Pick before Saturday">
            <div className="space-y-3">
              {DECISIONS_AWAITING.map((d) => (
                <Card key={d.topic}>
                  <div className="grid gap-4 lg:grid-cols-[140px,1fr,1.4fr]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                      {d.topic}
                    </div>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                        Options
                      </div>
                      <div className="mt-1 text-[13px] text-zinc-200">{d.options}</div>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-300/80">
                        Athena&apos;s call
                      </div>
                      <div className="mt-1 text-[13px] leading-[1.5] text-zinc-200">{d.recommendation}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Saturday execution" eyebrow="The block of work that unlocks everything else">
            <div className="grid gap-4 lg:grid-cols-2">
              {SATURDAY_EXECUTION.map((e) => (
                <Card key={e.who}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                    {e.who}
                  </div>
                  <ol className="mt-3 space-y-2 text-[13.5px] leading-[1.55] text-zinc-200">
                    {e.tasks.map((t, i) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] font-mono text-[11px] tabular-nums text-zinc-400">
                          {i + 1}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Highest-leverage builds for next session" eyebrow="What I queue up tomorrow">
            <Card>
              <ol className="space-y-2.5 text-[13.5px] leading-[1.55] text-zinc-200">
                {TONIGHT_HIGHEST_LEVERAGE_NEXT_TIME.map((t, i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[11px] font-semibold tabular-nums text-amber-300">
                      {i + 1}
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 border-t border-white/[0.05] pt-4 text-[12px] leading-[1.6] text-zinc-400">
                These weren&apos;t done overnight because each is a multi-hour task with breaking-change
                risk (DB schema, auth, external scraper). I&apos;d rather build them with you in the loop
                so you can verify before I commit to deployment. Confirm any/all tomorrow evening
                and I&apos;ll execute.
              </p>
            </Card>
          </Section>

          <Section title="What to do first when you sit down tonight" eyebrow="Pickup ritual">
            <Card>
              <ol className="space-y-2 text-[13.5px] leading-[1.55] text-zinc-200">
                {[
                  'Open `/vantage/hub/morning` — read this page.',
                  'Open `/vantage/hub/ideas` — scan the brainstormed improvements; tell me what to prioritize.',
                  'Confirm the 3 decisions above (domain · LLC name · Madison signature).',
                  'Confirm which of the 5 highest-leverage builds I should ship this session.',
                  'If you and Madison are on the call together: walk her through `/vantage/hub/discovery`, `/vantage/hub/email`, and `/vantage/hub/glossary` — that\'s her entire week-1 prep.',
                ].map((t, i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] font-mono text-[11px] tabular-nums text-zinc-400">
                      {i + 1}
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </Section>

          <Section title="Pulse" eyebrow="Where we are vs. the 90-day plan">
            <Card>
              <div className="grid gap-5 lg:grid-cols-3">
                <Pulse label="Day of plan" value="Day 2 of 90" />
                <Pulse label="Customers" value="0 of 10 · Year-1 target 25–100" />
                <Pulse label="MRR" value="$0 · target $1,500 by day 90" />
                <Pulse label="Pipeline" value="8 seed prospects · target 200 by week 2" />
                <Pulse label="LLC status" value="Not yet filed (Saturday)" />
                <Pulse label="Domain" value="Not yet locked (Saturday)" />
              </div>
              <p className="mt-5 border-t border-white/[0.05] pt-4 text-[13px] leading-[1.55] text-zinc-300/85">
                We&apos;re on day 2. The hub + landing page are built. The brand is locked. Pricing is
                set with defensible math. The next 5 days are about{' '}
                <span className="font-semibold text-amber-300">paperwork (Saturday)</span> and{' '}
                <span className="font-semibold text-amber-300">prospect list-building</span> so
                that Monday week 2 we can fire 100 cold emails and start measuring reply rate
                against the funnel page projections.
              </p>
            </Card>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Pulse({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-[15.5px] font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}
