import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — Ideas backlog',
};

/* ============================================================
   Ideas backlog — improvements Athena queues for review.
   Each idea: title, why it matters, effort, when to do it.
   Jason prioritizes, Athena ships.
   ============================================================ */

type Effort = 'S' | 'M' | 'L' | 'XL';
type Priority = 'P0' | 'P1' | 'P2' | 'P3';

type Idea = {
  title: string;
  why: string;
  effort: Effort;
  priority: Priority;
  category: string;
  doWhen: string;
};

const EFFORT_LABEL: Record<Effort, string> = {
  S: '< 30 min',
  M: '30 min – 2 hr',
  L: '2 – 6 hr',
  XL: '> 6 hr',
};

const PRIORITY_TONE: Record<Priority, string> = {
  P0: 'border-red-400/40 bg-red-400/[0.08] text-red-300',
  P1: 'border-amber-300/40 bg-amber-300/[0.08] text-amber-300',
  P2: 'border-blue-400/30 bg-blue-400/[0.08] text-blue-200',
  P3: 'border-white/10 bg-white/[0.04] text-zinc-400',
};

const IDEAS: { category: string; items: Idea[] }[] = [
  {
    category: 'Operational efficiency',
    items: [
      {
        title: 'Postgres-back the hub (replace localStorage)',
        why: "Right now Madison and Jason can't see each other's prospect updates. Multi-device sync via Prisma + API routes. Required before deployment.",
        effort: 'L',
        priority: 'P0',
        category: 'Infra',
        doWhen: 'Next session — confirmed scope, ready to build',
      },
      {
        title: 'Auth gate on /vantage/hub',
        why: 'Hub contains live prospect data and strategic context. Cannot be public when we deploy to vantageco.io. Cookie + env-var passcode middleware is the minimum.',
        effort: 'S',
        priority: 'P0',
        category: 'Security',
        doWhen: 'Saturday before Vercel deploy',
      },
      {
        title: 'Activity feed sidebar on the hub',
        why: 'Chronological log of every action either of you took (logged a reply, moved a stage, sent an email). Async sync without a sync meeting.',
        effort: 'M',
        priority: 'P2',
        category: 'Hub UX',
        doWhen: 'After Postgres lands',
      },
      {
        title: 'Pipeline staleness alerts',
        why: "If a prospect has been in 'replied' for 5+ days without a next-action update, surface it in today's actions panel. Catches drop-offs.",
        effort: 'M',
        priority: 'P2',
        category: 'Hub UX',
        doWhen: 'After Postgres lands',
      },
      {
        title: 'Mobile-optimized prospect pipeline',
        why: 'Madison probably works from her phone half the time. Right now the table is desktop-first. Tap-friendly stage chips + swipe actions.',
        effort: 'M',
        priority: 'P1',
        category: 'Hub UX',
        doWhen: 'Within 2 weeks of Madison going live',
      },
      {
        title: 'Keyboard shortcuts on hub (c, t, /)',
        why: '`c` to add prospect, `t` to toggle today action done, `/` to focus search. Power-user ergonomics for Jason.',
        effort: 'S',
        priority: 'P3',
        category: 'Hub UX',
        doWhen: 'Whenever — low risk',
      },
    ],
  },
  {
    category: 'Product (real data + scaling)',
    items: [
      {
        title: 'Tulsa permit scraper MVP',
        why: 'We currently demo from mock permits. We need to prove we can actually pull live data from Tulsa city + Tulsa County portals. Validates the entire business model.',
        effort: 'L',
        priority: 'P0',
        category: 'Backend',
        doWhen: 'Next session',
      },
      {
        title: 'Email rendering pipeline (Resend or Postmark)',
        why: 'The Monday digest needs to be a real automated send, not a manually-compiled email. Use a dynamic template that injects per-customer filtered permit list.',
        effort: 'L',
        priority: 'P0',
        category: 'Backend',
        doWhen: 'Week 4 (after first 3 verbal commits)',
      },
      {
        title: 'Stripe checkout MVP for Starter tier',
        why: "Moment a prospect says 'yes' on a discovery call, Madison should be able to send a pay-link instantly. Stripe Payment Links can do this in 30 min.",
        effort: 'M',
        priority: 'P1',
        category: 'Backend',
        doWhen: 'Next session — could ship same day as Postgres',
      },
      {
        title: 'Customer signup flow (account → first digest)',
        why: 'After payment, customer needs a portal account, filter selection, and queue for next Monday digest. End-to-end onboarding automation.',
        effort: 'L',
        priority: 'P1',
        category: 'Backend',
        doWhen: 'Week 5 — after first paid customer',
      },
      {
        title: 'Data quality dashboard (internal)',
        why: 'Permits scraped today, contact verification rate, dedup hits, errors. Madison should be able to spot a bad data day before customers do.',
        effort: 'M',
        priority: 'P2',
        category: 'Backend',
        doWhen: 'Once scraper is running for 2+ weeks',
      },
      {
        title: 'Filter customization UI for customers',
        why: "Customers self-serve their filter preferences (metro, asset type, value range, sponsor/borrower names, lender/title/broker use case). Reduces support load and improves digest relevance.",
        effort: 'L',
        priority: 'P2',
        category: 'Customer-facing',
        doWhen: 'After 5 paying customers (signal: filter requests piling up)',
      },
      {
        title: 'Webhook test harness',
        why: 'On the CRM webhook preview, let prospects fire a sample payload to their own endpoint live. Demo-to-trial conversion booster.',
        effort: 'M',
        priority: 'P3',
        category: 'Customer-facing',
        doWhen: 'After the first Pro-tier prospect asks about it',
      },
    ],
  },
  {
    category: 'Sales & marketing',
    items: [
      {
        title: 'Outreach personalization tokens (real permits per company)',
        why: "Cold emails currently use {{first_name}}. Add tokens that pull the prospect's company's actual recent permits from public records — 'saw [their actual company] just won the Mingo warehouse.' Reply rates jump.",
        effort: 'M',
        priority: 'P1',
        category: 'Outbound',
        doWhen: 'After scraper lands',
      },
      {
        title: 'Live ticker on landing page',
        why: 'Show last-24-hours permits indexed in real time once we have real data. Credibility signal — every prospect who lands sees a system that\'s actually running.',
        effort: 'M',
        priority: 'P2',
        category: 'Landing',
        doWhen: 'After scraper feeds production data',
      },
      {
        title: 'Referral program ($50 credit per closed referral)',
        why: 'Built-in growth loop. Customers who closed a deal off our digest are our best evangelists. Track via referral codes.',
        effort: 'M',
        priority: 'P2',
        category: 'Growth',
        doWhen: 'After 5 paying customers',
      },
      {
        title: 'Weekly "State of construction in [metro]" SEO blog posts',
        why: 'Free SEO + thought leadership. Auto-generated from each Monday\'s digest data. "Tulsa commercial permits this week" is a search anyone hunting projects might run.',
        effort: 'M',
        priority: 'P3',
        category: 'SEO',
        doWhen: '90 days in (after data archive has substance)',
      },
      {
        title: 'Case study scaffolding (template + first customer)',
        why: 'First customer who reports a closed deal off our digest becomes the testimonial that converts the next 10. Have the template ready.',
        effort: 'S',
        priority: 'P2',
        category: 'Marketing',
        doWhen: 'After first customer hits 30 days',
      },
      {
        title: 'About page (Jason + Madison story)',
        why: "Authenticity beats polish. 'Built by a Tulsa operator and his wife using real permit data plus family CRE/lending relationships' is a stronger founding story than enterprise-pitched competitors can match.",
        effort: 'S',
        priority: 'P2',
        category: 'Landing',
        doWhen: 'Saturday with the LLC paperwork — write it once you have a real entity name',
      },
      {
        title: '"Built in public" Twitter/X presence',
        why: 'Madison or Jason tweets weekly milestone updates (MRR, customer count, lessons). Side benefit: SEO + audience for any future product launch.',
        effort: 'S',
        priority: 'P3',
        category: 'Marketing',
        doWhen: 'After first paying customer (something to actually report)',
      },
    ],
  },
  {
    category: 'Hub & internal tools',
    items: [
      {
        title: 'Daily standup view',
        why: 'What Madison did yesterday, plans today, blockers. Same for Jason. Async sync without a meeting — saves 15 min/day, more on weeks Madison or Jason are heads-down.',
        effort: 'M',
        priority: 'P2',
        category: 'Hub UX',
        doWhen: 'After Postgres lands',
      },
      {
        title: 'Bulk actions on prospect pipeline',
        why: "Madison drops 50 new prospects in one day — needs to bulk-tag, bulk-move stage, bulk-assign. Right now it's one row at a time.",
        effort: 'M',
        priority: 'P2',
        category: 'Hub UX',
        doWhen: 'After Madison hits 50 prospects manually',
      },
      {
        title: 'Inbound reply triage view',
        why: "Connect Gmail or IMAP. Show all unread replies inline in the hub. Mark as 'positive / neutral / negative' with a single click. Madison doesn't context-switch to inbox.",
        effort: 'XL',
        priority: 'P2',
        category: 'Hub UX',
        doWhen: 'After 100 cold emails sent and replies start volume',
      },
      {
        title: 'Daily briefing auto-generation',
        why: "This morning briefing page is hand-coded. Make it pull live state from the DB so each morning's briefing is automatic — no Athena rewrite needed.",
        effort: 'M',
        priority: 'P1',
        category: 'Hub UX',
        doWhen: 'After Postgres lands',
      },
    ],
  },
  {
    category: 'Strategic / longer-horizon',
    items: [
      {
        title: 'Second-metro launch (OKC, Madison WI, or Dallas)',
        why: 'Tulsa proves the model. Adding a second metro proves it scales. Pick based on first-customer signal (where are they asking us to expand?).',
        effort: 'XL',
        priority: 'P1',
        category: 'Expansion',
        doWhen: 'After 10 paying Tulsa customers OR strong demand signal',
      },
      {
        title: 'Annual pricing tier (12 mo prepay, 15% discount)',
        why: "Locks in revenue and reduces churn. SMB SaaS standard. Frame: 'pay for 10 months, get 12.'",
        effort: 'S',
        priority: 'P2',
        category: 'Pricing',
        doWhen: 'After 5 paying customers (validate base price first)',
      },
      {
        title: 'Slack-based delivery channel',
        why: "Some buyers prefer Slack to email. Bot delivers Monday digest into a private channel. Upmarket buyers (regional lenders, title teams, broker teams) love this.",
        effort: 'L',
        priority: 'P3',
        category: 'Customer-facing',
        doWhen: 'When 3+ prospects ask "do you have Slack?"',
      },
      {
        title: 'Multi-seat accounts for sales teams',
        why: 'Growth-tier customer with a 4-person sales team needs to share access. Per-seat pricing or org-account model.',
        effort: 'L',
        priority: 'P2',
        category: 'Pricing',
        doWhen: 'When the first customer asks about adding teammates',
      },
      {
        title: 'White-label resale to title/lending networks',
        why: "Title groups, community banks, and CRE brokerages can package permit intel as a value-add for producers and referral partners. Reseller deal pipeline.",
        effort: 'XL',
        priority: 'P3',
        category: 'Channel',
        doWhen: '6+ months in, after Tulsa is profitable',
      },
    ],
  },
];

export default function IdeasBacklogPage() {
  const totalIdeas = IDEAS.reduce((acc, c) => acc + c.items.length, 0);
  const p0 = IDEAS.flatMap((c) => c.items).filter((i) => i.priority === 'P0').length;
  const p1 = IDEAS.flatMap((c) => c.items).filter((i) => i.priority === 'P1').length;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/ideas" />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Ideas backlog · internal"
            title="Improvements I'm queueing for your review."
            blurb={`${totalIdeas} ideas across 5 categories. ${p0} P0 (blockers), ${p1} P1 (high-leverage). Tag the ones you want me to ship next; everything else parks.`}
          />

          <Note>
            <ThesisPill /> Priorities and effort estimates are Athena's call. Effort sizes:{' '}
            <span className="font-mono">S</span> = under 30 min,{' '}
            <span className="font-mono">M</span> = 30 min–2 hr,{' '}
            <span className="font-mono">L</span> = 2–6 hr,{' '}
            <span className="font-mono">XL</span> = larger. Most can be shipped in a single
            evening session if scoped tight.
          </Note>

          <div className="mt-10" />

          {IDEAS.map((cat) => (
            <Section key={cat.category} title={cat.category} eyebrow={`${cat.items.length} ideas`}>
              <div className="space-y-3">
                {cat.items.map((idea) => (
                  <Card key={idea.title}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span
                            className={`inline-block rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${PRIORITY_TONE[idea.priority]}`}
                          >
                            {idea.priority}
                          </span>
                          <span className="rounded border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">
                            {idea.effort} · {EFFORT_LABEL[idea.effort]}
                          </span>
                          <span className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-500">
                            {idea.category}
                          </span>
                        </div>
                        <h3 className="mt-2 text-[15px] font-semibold leading-[1.4] text-white">
                          {idea.title}
                        </h3>
                        <p className="mt-1.5 text-[13px] leading-[1.55] text-zinc-300/85">
                          {idea.why}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-white/[0.05] pt-3 text-[12px] text-zinc-400">
                      <span className="font-semibold uppercase tracking-wider text-zinc-500">
                        Do when ·{' '}
                      </span>
                      {idea.doWhen}
                    </div>
                  </Card>
                ))}
              </div>
            </Section>
          ))}

          <Section title="How to use this list" eyebrow="Process">
            <Card>
              <ol className="space-y-2 text-[13.5px] leading-[1.55] text-zinc-200">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[11px] font-semibold text-amber-300">
                    1
                  </span>
                  <span>
                    Skim the P0s first — those are blockers. They have to land before we can take
                    money or deploy publicly.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[11px] font-semibold text-amber-300">
                    2
                  </span>
                  <span>
                    Tell me which 1–3 P1s you want shipped this week. I'll execute in order of your
                    pick.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[11px] font-semibold text-amber-300">
                    3
                  </span>
                  <span>
                    P2/P3 stay parked unless conditions change. I'll surface them on the morning
                    briefing when their "do when" trigger fires.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[11px] font-semibold text-amber-300">
                    4
                  </span>
                  <span>
                    I add new ideas to this list any time I find something that could move the
                    business. You don't have to do anything with them until you want to.
                  </span>
                </li>
              </ol>
            </Card>
          </Section>
        </main>
      </div>
    </div>
  );
}
