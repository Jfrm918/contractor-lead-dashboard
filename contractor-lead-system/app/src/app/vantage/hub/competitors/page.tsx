import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, FactPill, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — Competitor intelligence',
};

/* ============================================================
   Competitor intelligence
   Deep-ish dive on the 5 companies that matter to our positioning.
   Numbers are sourced (FACT) or labeled (THESIS).
   ============================================================ */

type Competitor = {
  name: string;
  category: string;
  founded?: string;
  pricing: string;
  pricingSource: string;
  who: string;
  strengths: string[];
  weaknesses: string[];
  ourWedge: string;
};

const COMPETITORS: Competitor[] = [
  {
    name: 'Dodge Construction Network',
    category: 'Direct competitor — enterprise tier',
    founded: '1891 (as McGraw-Hill Construction; rebranded Dodge in 2014)',
    pricing: 'Enterprise quote — typically $2,000–$10,000+/mo',
    pricingSource:
      'No public list price. Pricing widely reported in trade press and reseller listings; sales reps give custom quotes.',
    who: 'Mid-market and enterprise GCs, building product manufacturers, large material distributors',
    strengths: [
      'National coverage — every metro in the US',
      'Deep historical data going back decades',
      'Established brand among the largest GCs',
      'Robust integrations with enterprise CRMs',
    ],
    weaknesses: [
      'Pricing locks out the entire SMB market — solo reps, 5–20 person subs',
      'Bloated UI; old enterprise design',
      'Long sales cycles (30–90 day procurement)',
      'Annual contracts, not monthly — wrong for small operators',
    ],
    ourWedge:
      "We sit one tier below them. Buyers who'd never qualify for Dodge's $5K/mo quote — and don't need national coverage — pay us $149–499/mo. Same data shape, smaller scope, dramatically lower friction.",
  },
  {
    name: 'ConstructConnect',
    category: 'Direct competitor — mid-market',
    founded: '2016 (formed from iSqFt + BidClerk + others)',
    pricing: '~$200–$800/mo (varies by metro and tier)',
    pricingSource:
      'ConstructConnect public pages and reseller listings. Specific pricing shown to logged-in users; reported widely in industry forums.',
    who: 'Subcontractors, material reps, small GCs',
    strengths: [
      'Strong bid-management workflow (RFP/RFQ tooling)',
      'National permit + project data',
      'Established network of GCs sending invitations',
    ],
    weaknesses: [
      'Bid-management focus, not pure lead intel — overweight on workflow, light on contact data',
      "Generic data — every customer sees the same pile, no curation",
      'Verified contact info inconsistent (often missing PM email/phone)',
      "UI feels enterprise — not designed for solo operators",
    ],
    ourWedge:
      "We're sharper on lead intel: every permit ships with the verified PM contact and a 'top 3 worth your attention' curation. ConstructConnect is the wide-net option; we're the curated weekly digest.",
  },
  {
    name: 'BuiltWith',
    category: 'Indirect — the model we copy (different vertical)',
    founded: '2007',
    pricing: '$295 / $495 / $995 per month',
    pricingSource: 'BuiltWith public pricing page (builtwith.com/pricing).',
    who: 'B2B sales teams selling to web-based companies (different buyer entirely)',
    strengths: [
      "Solo / very small team running ~$15–22M ARR (per industry estimates and IndieHackers reporting)",
      'Subscription model with 90%+ gross margins',
      'Data archive compounds in value over time (their moat)',
      'Pure-data product — no professional services drag',
    ],
    weaknesses: [
      'Different vertical (web tech) — not actually competing for the same buyers',
      'No moat against well-funded entrant (model is replicable)',
    ],
    ourWedge:
      "Not a competitor — a model. We're applying their playbook (data subscription, niche vertical, solo operator economics) to construction permits instead of website tech profiling.",
  },
  {
    name: 'BidClerk / Building Connected (Autodesk)',
    category: 'Adjacent — bid invitations, not lead intel',
    founded: 'BidClerk: 2002 · Building Connected: 2012 (acquired by Autodesk 2018)',
    pricing: 'Custom / varies — often free for subs (paid by GCs)',
    pricingSource:
      'Building Connected pricing model is GC-funded; subs typically receive bid invitations free. Source: Autodesk product pages.',
    who: 'Subs receiving bid invitations from GCs',
    strengths: [
      'Owned by Autodesk, integrated with Revit / BIM 360 ecosystem',
      'Free for subs — GCs pay',
      'Strong network effect once a GC standardizes on it',
    ],
    weaknesses: [
      "Reactive not proactive — subs only see projects GCs invite them to",
      "No discovery — you can't find new GCs you don't already know",
      'Still requires the sub to grind a different tool for upstream lead intel',
    ],
    ourWedge:
      "We're proactive intelligence (here's what's being permitted right now), they're reactive workflow (here are bids people sent you). Most subs use both.",
  },
  {
    name: 'Construction Monitor',
    category: 'Direct — likely the $25/week service Jason\'s stepdad pays',
    founded: '1989 (originally a mailed weekly newsletter)',
    pricing: 'Likely $20–30/week effective in Tulsa metro (NOT publicly listed)',
    pricingSource:
      'Pricing scaled by market size + permit volume. Only public benchmark: 2012 trade-press article reported Los Angeles at $96/mo ($540/6mo, $960/yr). Tulsa is a smaller market so price is plausibly $80–120/mo (~$20–30/wk effective), matching stepdad\'s $25/wk. NOT publicly verified for Tulsa specifically — research 2026-05-06.',
    who: 'Trade subs, material reps, small contractors; signature buyer is older operator who values weekly delivery in PDF/CSV',
    strengths: [
      'Weekly editions — explicitly delivered each week (matches stepdad\'s cadence claim)',
      'Oklahoma coverage on order page; covers all 50 states',
      'Legacy "mailed newsletter" heritage (1989) — buyer trust + low-tech buyers stick with it',
      'Multiple delivery formats: PDF + CSV email + REST API + FTP',
      'Covers residential, commercial, solar, pool permits',
    ],
    weaknesses: [
      'Raw permit dump — owner names + addresses + scope + value, but NO verified PM contact / email / phone on most permits (especially residential)',
      'No enrichment — no GC pattern, no contact verification, no signal scoring',
      'No GC normalization — same GC under multiple LLC entities looks like multiple GCs',
      'PDF/CSV only — buyer must skip-trace contacts manually and dial cold',
      'No CRM integration out of the box',
      'Pricing not transparent — buyer can\'t self-serve sign-up at a known price',
      'Static data — no "this just permitted, addition project, high-intent insulation prospect" signal scoring',
    ],
    ourWedge:
      "We sell what Construction Monitor doesn't include: verified PM contacts (name + email + phone, bounce-tested), GC 90-day pattern history, stakeholder map (owner / architect / engineer pulled from the permit doc), and a curated weekly top-3. Pitch frame: 'keep your $25/wk feed for raw coverage — add us at $149 to get the answers (who to call, what they spec, when to call) instead of doing the homework yourself.' At $40/hr, saving 5 hrs/wk of skip-tracing alone pays back our Starter in week 1. CRITICAL: get Jason's stepdad to confirm the company. The signature confirmation question is: 'Do you get a weekly PDF or spreadsheet emailed every Monday morning?' — that's Construction Monitor's tell.",
  },
  {
    name: 'BuildChek (secondary candidate)',
    category: 'Indirect — possible alternate $25/wk match, but contradicts the "all permits" claim',
    pricing: '$2.50/report pay-as-you-go OR $34.99–$649/mo tiered (publicly listed)',
    pricingSource: 'buildchek.com/pricing — public.',
    who: 'Trade contractors looking up specific properties (lookup tool, not push feed)',
    strengths: [
      'Transparent public pricing',
      'Oklahoma coverage including Tulsa, OKC, Norman, Broken Arrow',
      'Self-serve sign-up at low entry price',
    ],
    weaknesses: [
      'Pay-per-report or per-month tier — not a "weekly all permits" feed; contradicts stepdad\'s description',
      'Lookup tool, not push delivery — buyer must actively pull data, easier to forget',
      'Discourages volume usage — paying per pull means buyers leave leads on the table',
    ],
    ourWedge:
      "Different product entirely. BuildChek is reactive lookup; we're proactive Monday digest with verified contacts and curation.",
  },
  {
    name: 'Public city/county permit portals',
    category: 'Indirect — the free alternative we displace',
    pricing: 'Free',
    pricingSource: 'Public records — Tulsa County, City of Tulsa, etc., openly accessible.',
    who: 'Operators willing to grind portals manually',
    strengths: [
      'Free',
      'Authoritative — primary source data',
      'Available immediately on filing',
    ],
    weaknesses: [
      'No contact info attached — just owner name and address',
      'No GC normalization (Crossland filed under 17 LLC entities looks like 17 different GCs)',
      'No project value enrichment',
      'No verification — emails/phones must be researched separately',
      'Different format per city/county — every metro is a different grind',
      "Pure time sink: industry estimates 4–8 hrs/week to keep current on one metro",
    ],
    ourWedge:
      "We are this — automated, normalized, enriched, verified, delivered. Customer math: at $40/hour wage equivalent, 5 hrs/week of grinding = $200/week of saved time. Our Starter tier is $149/month. Pays back week 1.",
  },
];

const POSITIONING: { x: string; y: string; label: string; us?: boolean }[] = [
  { x: 'low', y: 'low', label: 'Public portals (free, manual)' },
  { x: 'low', y: 'low-mid', label: '$25/wk feeds (~$100/mo, raw)' },
  { x: 'high', y: 'high', label: 'Dodge ($2K+/mo, national)' },
  { x: 'med', y: 'med', label: 'ConstructConnect (~$300/mo)' },
  { x: 'low', y: 'high', label: 'Building Connected (free for subs, narrow)' },
  { x: 'low-mid', y: 'mid-high', label: 'Vantage ($149–499/mo)', us: true },
];

export default function CompetitorsPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/competitors" />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Competitor intelligence · internal"
            title="Who we're up against, where they're soft, where we win."
            blurb="One-page profiles of the five companies a buyer will compare us to (or already uses). Strengths, weaknesses, and the specific wedge we exploit."
          />

          <Note>
            <FactPill /> Pricing rows below are sourced from public vendor pages, trade press, or
            reseller listings — source named explicitly in each profile. <ThesisPill /> Strengths
            / weaknesses / our wedge are our analysis based on industry knowledge.
          </Note>

          <div className="mt-10" />

          {COMPETITORS.map((c) => (
            <Section key={c.name} title={c.name} eyebrow={c.category}>
              <Card>
                <div className="grid gap-5 lg:grid-cols-[1fr,1fr]">
                  <div className="space-y-4">
                    {c.founded && (
                      <div>
                        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                          Founded
                        </div>
                        <div className="mt-0.5 text-[13.5px] text-zinc-200">{c.founded}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Pricing
                      </div>
                      <div className="mt-0.5 text-[13.5px] font-medium text-amber-300">{c.pricing}</div>
                      <div className="mt-1 text-[11px] leading-[1.5] text-zinc-500">
                        Source · {c.pricingSource}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Primary buyer
                      </div>
                      <div className="mt-0.5 text-[13.5px] text-zinc-200">{c.who}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-emerald-300/80">
                        Strengths
                      </div>
                      <ul className="mt-1.5 space-y-1 text-[13px] leading-[1.5] text-zinc-300/85">
                        {c.strengths.map((s) => (
                          <li key={s} className="flex items-start gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-red-300/80">
                        Weaknesses
                      </div>
                      <ul className="mt-1.5 space-y-1 text-[13px] leading-[1.5] text-zinc-300/85">
                        {c.weaknesses.map((w) => (
                          <li key={w} className="flex items-start gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-400/80" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/[0.04] px-4 py-3">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                    Our wedge
                  </div>
                  <p className="mt-1 text-[13.5px] leading-[1.55] text-zinc-100">{c.ourWedge}</p>
                </div>
              </Card>
            </Section>
          ))}

          <Section title="Where we sit on the price/scope grid" eyebrow="Positioning">
            <Note>
              <ThesisPill /> A buyer's mental map: cost on one axis, "how much hand-holding it
              gives me" on the other. Free portals cost nothing but require all the work. Dodge
              costs everything and gives you everything. We sit deliberately in the middle-low
              right — small spend, focused scope, real intelligence.
            </Note>
            <div className="mt-5 grid gap-3 lg:grid-cols-5">
              {POSITIONING.map((p) => (
                <div
                  key={p.label}
                  className={`rounded-lg border p-4 ${
                    p.us
                      ? 'border-amber-300/40 bg-amber-300/[0.06] shadow-[0_0_24px_rgba(251,191,36,0.08)]'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <div
                    className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      p.us ? 'text-amber-300' : 'text-zinc-500'
                    }`}
                  >
                    {p.us ? 'Us' : 'Them'}
                  </div>
                  <div className="mt-1 text-[13.5px] font-medium leading-[1.45] text-white">
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Talking-track defenses" eyebrow="When a prospect mentions a competitor">
            <div className="space-y-4">
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  "We already use Dodge"
                </div>
                <p className="mt-2 text-[13.5px] italic leading-[1.55] text-zinc-200">
                  "Got it — Dodge is great for the national / enterprise scope. We're built for
                  operators who want a curated weekly list focused on their metros, at one-tenth
                  the price. Most folks who use both keep Dodge for nationwide and us for the
                  Tulsa / OKC slice. Want me to send next Monday's list so you can compare?"
                </p>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  "We already use ConstructConnect"
                </div>
                <p className="mt-2 text-[13.5px] italic leading-[1.55] text-zinc-200">
                  "ConstructConnect's bid-management piece is solid. We're not that — we're
                  upstream lead intel: who broke ground, who's the GC, who's the PM, before a bid
                  invitation hits anyone's inbox. Different layer. Most subs we work with use
                  both."
                </p>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  "We just check the city portal ourselves"
                </div>
                <p className="mt-2 text-[13.5px] italic leading-[1.55] text-zinc-200">
                  "Totally — that's how everyone starts. Two questions: how many hours a week
                  does that take, and what's that hour worth to you? Most operators we talk to
                  are at 4–6 hours a week and say it'd be worth $40–80/hour. At Starter ($149) we
                  pay back in week 1. And you get the verified PM contact — that's the part the
                  portal doesn't give you."
                </p>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  "We pay $25/week for permits already"
                </div>
                <p className="mt-2 text-[13.5px] italic leading-[1.55] text-zinc-200">
                  "Sweet — keep it. Different product. Most $25/wk feeds give you the permit
                  itself: number, address, applicant. We give you the verified project manager's
                  email and phone, the GC's last 90 days of activity, the architect and engineer
                  on file, and a curated top-3 every Monday so you know which three to call this
                  week. Want me to send next Monday's list side-by-side with what your $25 feed
                  gave you? You'll see the difference in 5 minutes."
                </p>
              </Card>
            </div>
          </Section>

          <Section title="Questions to ask Jason's stepdad" eyebrow="Customer #1 prospect — the perfect first sale">
            <Card>
              <p className="mb-4 text-[13.5px] leading-[1.55] text-zinc-200">
                He runs the exact ICP company we target — Tulsa-area insulation sub. He's
                already paying for permit data ($25/wk). Either he upgrades to us (and becomes
                customer #1 + reference), or he tells us exactly why he won't (and we adjust).
                Either outcome is gold.
              </p>
              <ol className="space-y-2 text-[13.5px] leading-[1.55] text-zinc-200">
                {[
                  '"Do you get a weekly PDF or spreadsheet emailed every Monday morning?" — if YES, it\'s almost certainly Construction Monitor. (Top research candidate as of 2026-05-06.)',
                  "What's the company name? Confirm the service so we can study the exact gap.",
                  'What does the $25/week service actually include? Permits only, or with applicant name, contact info, GC history?',
                  "What does he have to do AFTER getting their email/CSV that he wishes was already done? (Where's the friction we solve?)",
                  "If he had verified PM contacts + a curated weekly top-3 + the GC's 90-day permit history, what would 1 closed commercial deal a quarter be worth to his company?",
                  'Would he be willing to be customer #1 at a discount in exchange for honest feedback over the first 60 days?',
                  'Who else does he know in his world (other Tulsa-area subs / material reps / small contractors) that pays for permit data?',
                ].map((q, i) => (
                  <li key={q} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[11px] font-semibold text-amber-300">
                      {i + 1}
                    </span>
                    <span>{q}</span>
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
