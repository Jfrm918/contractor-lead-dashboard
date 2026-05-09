import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, FactPill, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — Customer success playbook',
};

/* ============================================================
   Customer success playbook
   What happens after they sign up. Onboarding, first 30 days,
   churn signals, win-back, upsell.
   ============================================================ */

const ONBOARDING_DAY_1: { time: string; action: string; owner: string }[] = [
  {
    time: 'T+0 (signup)',
    action: 'Stripe checkout success → automated welcome email triggers from `welcome@vantageco.io`',
    owner: 'System',
  },
  {
    time: 'T+5 min',
    action: 'Madison sends a personal note from her real address: 1 line "saw you signed up — what metro and segment, want me to pull a custom first-week list?"',
    owner: 'Madison',
  },
  {
    time: 'T+1 hour',
    action: 'Calendar link sent for a 15-min "make sure you get value" check-in within the first week',
    owner: 'System',
  },
  {
    time: 'T+24 hours',
    action: 'First custom-filtered digest sent if signup was mid-week, or queue for next Monday if signup was Friday-Sunday',
    owner: 'System',
  },
  {
    time: 'T+72 hours',
    action: 'If they haven\'t opened the digest yet → Madison sends a 2-line nudge with the 3 most relevant permits cherry-picked',
    owner: 'Madison',
  },
];

const FIRST_30_DAYS: { milestone: string; signal: string; intervention: string }[] = [
  {
    milestone: 'Day 1: digest received',
    signal: 'Email opened within 24 hrs',
    intervention: "If not opened by day 3, Madison sends 'did this hit your inbox?' check.",
  },
  {
    milestone: 'Day 7: portal logged in',
    signal: 'At least one portal login',
    intervention: "If no login by day 7, send a 'want me to walk you through it?' offer.",
  },
  {
    milestone: 'Day 14: first action',
    signal: 'Customer reports calling/emailing one of the GCs from the digest, or marks a permit as "actioned" in the portal',
    intervention: "If no action signals, schedule a 15-min call: 'what would make this stick for you?'",
  },
  {
    milestone: 'Day 21: positive feedback or escalation',
    signal: 'Voluntary thumbs-up reply, testimonial, or a complaint we can address',
    intervention: 'Either ask for a one-line testimonial OR resolve the complaint same-day.',
  },
  {
    milestone: 'Day 30: success conversation',
    signal: 'Customer can answer "did Vantage pay for itself this month?" with a yes',
    intervention: "If no, this is the churn-fork moment. Reset expectations, customize filters, or part on good terms.",
  },
];

const CHURN_SIGNALS: { signal: string; severity: 'high' | 'med'; response: string }[] = [
  {
    signal: '14+ days without portal login',
    severity: 'high',
    response: 'Personal email from Madison: "noticed you haven\'t logged in — anything we can fix?"',
  },
  {
    signal: '3+ Monday digests unopened in a row',
    severity: 'high',
    response: 'Madison reaches out within 24 hours; offer to re-customize filters or pause briefly.',
  },
  {
    signal: 'Customer asked to "pause" or "skip a month"',
    severity: 'high',
    response: 'Yes to pause, but immediately schedule a check-in call. Pausers churn at high rates if not handled.',
  },
  {
    signal: 'Filter requests stop coming after week 4',
    severity: 'med',
    response: 'Healthy customers iterate filters. Silence = disengagement. Madison offers a 10-min review.',
  },
  {
    signal: 'Reduced digest "click through to portal" rate',
    severity: 'med',
    response: 'Tracked in Resend / Postmark analytics. If trending down 4 weeks straight, re-engage.',
  },
  {
    signal: 'Card declined / payment failed',
    severity: 'high',
    response: 'Stripe dunning + a personal "your card got bumped, no rush, here\'s the link" from Madison.',
  },
];

const UPSELL_TRIGGERS: { trigger: string; offer: string }[] = [
  {
    trigger: 'Starter customer adding a second metro to filters',
    offer: 'Move to Growth ($299) — 3 metros + CRM webhook. Frame as a $50 step up that includes a major workflow upgrade.',
  },
  {
    trigger: 'Growth customer asks about API access or a custom integration',
    offer: 'Move to Pro ($499) — full API + unlimited metros + dedicated onboarding.',
  },
  {
    trigger: 'Customer mentions they want to share digests with their team',
    offer: 'Either add seats (per-seat pricing, future feature) or upgrade to Growth/Pro for portal access.',
  },
  {
    trigger: 'Customer references a specific won deal off our digest',
    offer: 'No upsell — ask for a one-line testimonial AND a referral. The win turns into our marketing.',
  },
];

const WINBACK_SCRIPT = `Hey [first name],

Saw you cancelled last month. No hard feelings — just want to make sure I learn what didn't work.

Quick question: was it (a) data wasn't useful, (b) too pricey, (c) timing wasn't right, or (d) something else?

I'll keep your filters in the system for 90 days in case the timing changes. If it does, just hit reply.

— Madison`;

export default function CustomerSuccessPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/success" />
        <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Customer success playbook · internal"
            title="What happens after they sign up."
            blurb="Onboarding sequence, first-30-days success milestones, churn signals to watch, win-back script. Treat the first 30 days as the highest-leverage time we'll ever have with a customer — fail here and they're gone forever."
          />

          <Note>
            <FactPill /> Industry data: B2B SMB SaaS customers who don't reach a "first value
            moment" within 14 days churn at ~3× the rate of those who do (per ChartMogul,
            Profitwell, and OpenView Partners published reports). The day-1 through day-30 plan
            below is calibrated to engineer a first-value moment fast.
          </Note>

          <div className="mt-10" />

          <Section title="Day 1 onboarding — the first 24 hours" eyebrow="Setup">
            <Note>
              <ThesisPill /> Day 1 sets the tone for the relationship. Generic SaaS sends a
              confirmation email and disappears. We send a personal note from a real human
              within 5 minutes — that's our entire customer-experience moat against the bigger
              players.
            </Note>
            <div className="mt-5 space-y-3">
              {ONBOARDING_DAY_1.map((s) => (
                <Card key={s.time}>
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[11.5px] tabular-nums text-amber-300 shrink-0 w-24">
                      {s.time}
                    </span>
                    <p className="flex-1 text-[13.5px] leading-[1.55] text-zinc-200">{s.action}</p>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-300">
                      {s.owner}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="First 30 days — milestone map" eyebrow="From signup to sticky">
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-[13px]">
                <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Milestone</th>
                    <th className="px-4 py-2.5 text-left">Healthy signal</th>
                    <th className="px-4 py-2.5 text-left">If signal missing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {FIRST_30_DAYS.map((m) => (
                    <tr key={m.milestone}>
                      <td className="px-4 py-3 align-top font-medium text-white">{m.milestone}</td>
                      <td className="px-4 py-3 align-top text-zinc-300/85">{m.signal}</td>
                      <td className="px-4 py-3 align-top text-amber-300/90">{m.intervention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Churn signals — what to watch" eyebrow="Catch it early">
            <div className="space-y-3">
              {CHURN_SIGNALS.map((c) => (
                <Card key={c.signal}>
                  <div className="grid gap-4 lg:grid-cols-[1fr,80px,1.5fr]">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Signal
                      </div>
                      <div className="mt-1 text-[13.5px] text-white">{c.signal}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Severity
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${
                            c.severity === 'high'
                              ? 'border-red-400/30 bg-red-400/10 text-red-300'
                              : 'border-amber-300/30 bg-amber-300/10 text-amber-300'
                          }`}
                        >
                          {c.severity}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Response
                      </div>
                      <p className="mt-1 text-[13px] leading-[1.55] text-zinc-300/85">{c.response}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Upsell triggers" eyebrow="Grow the account">
            <Note>
              <ThesisPill /> Don't push upsell on day one. Wait for the customer to display
              behavior that <em>creates</em> the upsell case naturally — then offer it as the
              obvious next step.
            </Note>
            <div className="mt-5 space-y-3">
              {UPSELL_TRIGGERS.map((u) => (
                <Card key={u.trigger}>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                        Trigger
                      </div>
                      <div className="mt-1 text-[13.5px] text-zinc-100">{u.trigger}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300/80">
                        Offer
                      </div>
                      <div className="mt-1 text-[13.5px] text-zinc-100">{u.offer}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Win-back script (when they cancel)" eyebrow="Don't beg, listen">
            <Card>
              <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-[1.6] text-zinc-100">
                {WINBACK_SCRIPT}
              </pre>
            </Card>
            <p className="mt-4 text-[13px] leading-[1.6] text-zinc-400">
              Multiple-choice format makes it easy to reply (a/b/c/d) — way higher response rate
              than open-ended "why did you leave." The 90-day filter retention is genuine — keep
              it. We get back ~10–15% of churned customers within 90 days when we don't burn the
              relationship on exit.
            </p>
          </Section>

          <Section title="Operating cadence" eyebrow="Weekly / monthly rhythm">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  Weekly
                </div>
                <ul className="mt-2 space-y-1.5 text-[13px] leading-[1.5] text-zinc-300/85">
                  <li>· Check digest open rate per customer</li>
                  <li>· Review portal login activity (Mon morning)</li>
                  <li>· Reply triage: any in-bound feedback or filter requests</li>
                  <li>· Action any "high severity" churn signals same-day</li>
                </ul>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  Monthly
                </div>
                <ul className="mt-2 space-y-1.5 text-[13px] leading-[1.5] text-zinc-300/85">
                  <li>· "Did Vantage pay for itself this month?" check-in (NPS-light)</li>
                  <li>· Review every customer's filter freshness — propose updates</li>
                  <li>· Pull churn list, run win-back on anyone gone 30+ days</li>
                  <li>· Identify upsell candidates from behavior signals</li>
                </ul>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  Quarterly
                </div>
                <ul className="mt-2 space-y-1.5 text-[13px] leading-[1.5] text-zinc-300/85">
                  <li>· Customer success review — what's working, what's broken</li>
                  <li>· Pricing model audit (raise, hold, restructure)</li>
                  <li>· Product feedback synthesis → roadmap input</li>
                  <li>· Win/loss report on cancelled customers</li>
                </ul>
              </Card>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
