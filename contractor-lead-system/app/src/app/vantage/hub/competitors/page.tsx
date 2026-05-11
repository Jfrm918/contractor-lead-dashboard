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
    name: 'Reonomy',
    category: 'Direct CRE data competitor — national property intelligence',
    founded: '2013 (acquired by Altus Group in 2021)',
    pricing: 'Enterprise / sales quote — commonly benchmarked around $400+/mo per user',
    pricingSource:
      'No current public list price. Public reviews and prior buyer reports commonly cite mid-hundreds per month; enterprise quotes vary.',
    who: 'CRE brokers, investors, lenders, and owners needing national property/owner data',
    strengths: [
      'Deep national property and ownership graph',
      'Strong owner/entity search and parcel-level coverage',
      'Recognized CRE-data brand',
      'Useful for broad market prospecting beyond permits',
    ],
    weaknesses: [
      'Not Tulsa-first and not permit-timing-first',
      'National database can miss local nuance and warm relationship context',
      'Pricing and contracts create friction for small regional teams',
      'Does not package weekly lender/title/broker action lists out of Tulsa permits',
    ],
    ourWedge:
      "We are the local action layer Reonomy doesn't try to be: fresh Tulsa permit signals translated into lender origination, title future-closing, broker lease-up, refi/take-out, and sponsor follow-up timing.",
  },
  {
    name: 'CompStak',
    category: 'Direct CRE data competitor — lease/sales comps',
    founded: '2011',
    pricing: 'Enterprise quote / data-exchange model',
    pricingSource:
      'CompStak does not publish list pricing. Public materials describe a broker data-exchange plus paid enterprise access.',
    who: 'CRE brokers, appraisers, investors, lenders, and asset managers needing lease/sale comps',
    strengths: [
      'Strong lease and sale comps where the exchange has coverage',
      'Trusted by institutional CRE users',
      'Useful for valuation, underwriting, and market benchmarking',
    ],
    weaknesses: [
      'Comps are backward-looking; permits are forward-looking',
      'Exchange model is not a simple weekly pipeline product',
      'Local coverage quality depends on contributor density',
      'Not designed around sponsor outreach or construction-loan timing',
    ],
    ourWedge:
      'CompStak helps price what already happened. Vantage flags what just started, who is behind it, and which lender/title/broker action should happen next.',
  },
  {
    name: 'Crexi',
    category: 'Adjacent CRE competitor — marketplace + broker tools',
    founded: '2015',
    pricing: 'Marketplace free tiers + paid broker/auction/listing tools',
    pricingSource:
      'Crexi publishes product pages but not a simple one-seat list price for all workflows; paid plans vary by product and market.',
    who: 'CRE brokers, investors, buyers, sellers, and tenants using marketplace/listing workflows',
    strengths: [
      'Large marketplace mindshare in CRE',
      'Listings, comps, auctions, and broker marketing in one workflow',
      'Buyers already search it when actively looking for assets',
    ],
    weaknesses: [
      'Listing-led; misses projects before they become public listings',
      'Not a construction-permit intelligence feed',
      'Does not map early sponsor movement to lender/title/broker timing',
      'Competitive marketplace can be noisy once a deal is already marketed',
    ],
    ourWedge:
      'Crexi is where a property may show up later. Vantage is the earlier signal: permit filed, sponsor identified, capital/closing/broker angle ready before broad market exposure.',
  },
  {
    name: 'Dodge Construction Network',
    category: 'Adjacent construction-data incumbent — targets contractors more than lenders',
    founded: '1891 (as McGraw-Hill Construction; rebranded Dodge in 2014)',
    pricing: 'Enterprise quote — typically $2,000–$10,000+/mo',
    pricingSource:
      'No public list price. Pricing widely reported in trade press and reseller listings; sales reps give custom quotes.',
    who: 'GCs, subcontractors, building-product manufacturers, and construction material sellers — not our new lender/title/broker ICP',
    strengths: [
      'National construction-project coverage',
      'Deep historical data going back decades',
      'Established brand among contractors and enterprise construction teams',
      'Robust integrations with enterprise CRMs',
    ],
    weaknesses: [
      'Construction workflow focus, not CRE capital/transaction timing',
      'Pricing and procurement are too heavy for local Tulsa relationship sales',
      'Overkill if the buyer only needs local permit signals tied to loans, closings, and brokerage timing',
      'Does not package warm local CRE context around Jason\'s relationship network',
    ],
    ourWedge:
      "Dodge is the contractor-world incumbent. Vantage now borrows useful permit context but sells a different outcome: CRE pipeline intelligence for lenders, title teams, brokers, and sponsors.",
  },
  {
    name: 'Construction Monitor',
    category: 'Adjacent raw permit feed — targets contractors, useful contrast only',
    founded: '1989 (originally a mailed weekly newsletter)',
    pricing: 'Likely $20–30/week effective in Tulsa metro (NOT publicly listed)',
    pricingSource:
      'Pricing scaled by market size + permit volume. Only public benchmark: 2012 trade-press article reported Los Angeles at $96/mo ($540/6mo, $960/yr). Tulsa is a smaller market so price is plausibly $80–120/mo (~$20–30/wk effective). NOT publicly verified for Tulsa specifically — research 2026-05-06.',
    who: 'Trade contractors and material sellers who want raw weekly permit lists; explicitly not the lender/title/broker buyer we are pivoting toward',
    strengths: [
      'Weekly editions — explicitly delivered each week',
      'Oklahoma coverage on order page; covers all 50 states',
      'Legacy mailed-newsletter heritage (1989) builds trust with low-tech buyers',
      'Multiple delivery formats: PDF + CSV email + REST API + FTP',
    ],
    weaknesses: [
      'Raw permit dump, not CRE capital/transaction intelligence',
      'No lender/title/broker segmentation or refi/take-out timing',
      'No sponsor relationship map, capital stack context, or distress signal layer',
      'Price anchors contractor buyers too low; that is exactly why we pivoted',
    ],
    ourWedge:
      'Construction Monitor proves permits are valuable, but its buyer is raw construction-permit workflow. Vantage repackages the signal for higher-value CRE outcomes: origination, closings, brokerage timing, and sponsor intelligence.',
  },
  {
    name: 'Public city/county permit portals',
    category: 'Indirect — the free alternative we automate',
    pricing: 'Free',
    pricingSource: 'Public records — Tulsa County, City of Tulsa, etc., openly accessible.',
    who: 'Anyone willing to grind portals manually',
    strengths: [
      'Free',
      'Authoritative — primary source data',
      'Available immediately on filing',
    ],
    weaknesses: [
      'No sponsor/entity normalization or contact context',
      'No parcel-to-owner-to-capital-stack enrichment',
      'No lender/title/broker workflow packaging',
      'Different format per city/county — every metro is a different grind',
      'Pure time sink for high-value producers',
    ],
    ourWedge:
      'We are this — automated, normalized, enriched, and delivered as a weekly CRE action list instead of a portal-grinding chore.',
  },
];

const POSITIONING: { x: string; y: string; label: string; us?: boolean }[] = [
  { x: 'low', y: 'low', label: 'Public portals (free, manual)' },
  { x: 'high', y: 'high', label: 'Reonomy / CompStak (national CRE data)' },
  { x: 'med', y: 'med', label: 'Crexi (marketplace)' },
  { x: 'high', y: 'med', label: 'Dodge (contractor-focused)' },
  { x: 'low', y: 'low-mid', label: 'Construction Monitor (raw permits for contractors)' },
  { x: 'low-mid', y: 'mid-high', label: 'Vantage ($299–999/mo)', us: true },
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
            blurb="One-page profiles of the CRE data companies a lender, title team, broker, or sponsor will compare us to. Strengths, weaknesses, and the specific wedge we exploit."
          />

          <Note>
            <FactPill /> Pricing rows below are sourced from public product pages, public reviews, trade press, or
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
              <ThesisPill /> A buyer&apos;s mental map: cost on one axis, &quot;how directly it maps to my CRE workflow&quot; on the other. Free portals cost nothing but require all the work. National CRE data tools are broad but expensive. Construction products like Dodge and Construction Monitor mostly target contractors. We sit deliberately in the local-action lane — focused scope, CRE-specific workflow, real intelligence.
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
                  &quot;We already use Reonomy / CompStak&quot;
                </div>
                <p className="mt-2 text-[13.5px] italic leading-[1.55] text-zinc-200">
                  &quot;Got it — those are strong national CRE datasets. We&apos;re not replacing them. We&apos;re the Tulsa action layer: fresh permits translated into sponsor, lending, title, refi/take-out, and broker timing. Want me to send next Monday&apos;s list so you can compare the local signal quality?&quot;
                </p>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  &quot;We already use Crexi&quot;
                </div>
                <p className="mt-2 text-[13.5px] italic leading-[1.55] text-zinc-200">
                  &quot;Crexi is great once a property is being marketed. We&apos;re earlier: permits that show sponsor movement before lease-up, refi, take-out, sale, or tenant-rep opportunities are obvious. Different layer.&quot;
                </p>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  &quot;We just check the city portal ourselves&quot;
                </div>
                <p className="mt-2 text-[13.5px] italic leading-[1.55] text-zinc-200">
                  &quot;Totally — that&apos;s how everyone starts. Two questions: how many hours a week
                  does that take, and what is one missed loan, closing, listing, or referral worth? Vantage saves the portal grind and adds sponsor/entity context, project value, parcel/address, and the CRE workflow angle the portal does not give you.&quot;
                </p>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                  &quot;We pay for a permit feed already&quot;
                </div>
                <p className="mt-2 text-[13.5px] italic leading-[1.55] text-zinc-200">
                  &quot;Good — that proves the raw feed matters. We are not selling raw permits to contractors. We turn permits into CRE actions: which sponsor moved, what loan/refi/title/broker angle exists, what to watch next, and why it matters this week. Want me to send our Monday view side-by-side with the raw feed?&quot;
                </p>
              </Card>
            </div>
          </Section>

          <Section title="Questions for warm CRE intro calls" eyebrow="Lender/title/broker validation">
            <Card>
              <p className="mb-4 text-[13.5px] leading-[1.55] text-zinc-200">
                The pivot customer is no longer a construction-supply buyer. Use warm lender, title, and CRE broker relationships to validate whether permit signals create enough origination, closing, refi/take-out, or lease-up value to support $299–999/mo.
              </p>
              <ol className="space-y-2 text-[13.5px] leading-[1.55] text-zinc-200">
                {[
                  '"Which data tools do you already trust — Reonomy, CompStak, Crexi, county records, internal analyst, or none?"',
                  "What missing local signal would make you take a call immediately?",
                  'Which use case has the highest value: origination, refi/take-out, future title closings, lease-up, or investment sales?',
                  "What do you do after seeing a new permit — call sponsor, route to lender, flag title follow-up, update CRM, or ignore?",
                  "If Vantage surfaced one qualified loan/closing/listing per quarter, what is that worth in fees or relationship value?",
                  'Would you review the Monday CRE view for 2 weeks and tell us what is missing before we ask for money?',
                  'Who else in Tulsa lending, title, brokerage, or development would have a sharp opinion on this?',
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
