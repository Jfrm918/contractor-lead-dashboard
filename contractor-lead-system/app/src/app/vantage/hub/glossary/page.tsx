import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, FactPill, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — Industry primer',
};

/* ============================================================
   Industry primer / glossary
   What Madison needs to know to sound credible on a discovery
   call. Commercial real estate, lending, title, and brokerage concepts.
   ============================================================ */

const PERMIT_TYPES: { name: string; what: string; cycle: string; matters: string }[] = [
  {
    name: 'New construction (ground-up)',
    what: 'Permit to build a new structure from scratch — vertical construction, foundation through finish.',
    cycle: '12–24 months from permit to substantial completion typical for commercial mid-size.',
    matters:
      'Highest dollar value per project. Lenders see construction-to-perm and draw opportunities; title teams see future closings; brokers see lease-up and investment-sale timing.',
  },
  {
    name: 'Tenant improvement (TI)',
    what: 'Interior buildout of an existing leased space — common in retail, office, restaurant fit-outs.',
    cycle: '6–16 weeks from permit to occupancy.',
    matters:
      'High-frequency churn signal. Brokers can spot tenant movement; lenders and title teams can track smaller refi or owner-occupier activity.',
  },
  {
    name: 'Addition / alteration',
    what: 'Adding to or modifying an existing structure — expansion, rebuild after damage, modernization.',
    cycle: 'Varies wildly — a 6-month addition is common.',
    matters: 'Expansion signals sponsor confidence, possible new debt, refi needs, and future valuation changes.',
  },
  {
    name: 'Repair / replacement',
    what: 'Major building-system replacement, structural repair, or capital improvement permit.',
    cycle: '2–10 weeks typical.',
    matters: 'Often hints at refinance prep, insurance events, deferred maintenance, or a property being readied for sale/lease.',
  },
  {
    name: 'Demolition',
    what: 'Permit to tear down a structure (often paired with a new-construction permit at the same site).',
    cycle: 'Usually 2–8 weeks before ground-up permit lands.',
    matters: 'Early signal a new project is coming. Useful for construction lenders, title teams, land brokers, and developers before public marketing catches up.',
  },
];

const GC_ROLES: { role: string; whatTheyDo: string; whoSellsThem: string }[] = [
  {
    role: 'Sponsor / borrower',
    whatTheyDo:
      'Controls the project economics, capital stack, lender selection, and exit/refi plan.',
    whoSellsThem:
      'Commercial lenders, title teams, brokers, insurance, and advisory relationships. This is often the highest-value contact.',
  },
  {
    role: 'Commercial lender',
    whatTheyDo:
      'Originates or manages construction loans, bridge loans, refis, and take-out financing.',
    whoSellsThem:
      'Sponsors seeking capital, brokers with borrower relationships, title teams with closing visibility, and data providers like us.',
  },
  {
    role: 'Title / closing officer',
    whatTheyDo:
      'Handles title commitments, escrow, closing coordination, lien searches, and policy issuance.',
    whoSellsThem:
      'Lenders, sponsors, CRE brokers, attorneys, and referral partners tied to upcoming transactions.',
  },
  {
    role: 'CRE broker',
    whatTheyDo:
      'Sources leasing, investment sales, land, owner-rep, or tenant-rep opportunities tied to project movement.',
    whoSellsThem:
      'Owners, sponsors, tenants, lenders with REO/distress signals, and investors needing market timing.',
  },
  {
    role: 'General contractor',
    whatTheyDo: 'Executes the build and often appears on permit records, but is no longer our primary buyer.',
    whoSellsThem: 'Useful context for credibility and project validation; buyer focus stays on capital/transaction stakeholders.',
  },
];

const BID_TIMING: { phase: string; weekRange: string; whoMatters: string }[] = [
  {
    phase: 'Permit filed',
    weekRange: 'Week 0',
    whoMatters: 'Project becomes public. Vantage flags sponsor/applicant, asset type, value, and potential lender/title/broker angle.',
  },
  {
    phase: 'Construction loan / capital stack check',
    weekRange: 'Week 0–4',
    whoMatters:
      'Lenders verify whether the project is already financed, whether take-out/refi timing exists, and whether sponsor relationship outreach is worth it.',
  },
  {
    phase: 'Title and entity diligence',
    weekRange: 'Week 0–8',
    whoMatters: 'Title teams map ownership entities, parcel history, lien risk, and upcoming closing/refi work.',
  },
  {
    phase: 'Broker market mapping',
    weekRange: 'Week 2–12',
    whoMatters: 'CRE brokers track lease-up, owner-rep, tenant-rep, land, and investment-sale angles before the project is widely marketed.',
  },
  {
    phase: 'Construction draw cycle',
    weekRange: 'Month 1–18',
    whoMatters: 'Lenders monitor progress, draw timing, distress signals, and borrower performance.',
  },
  {
    phase: 'Stabilization / lease-up',
    weekRange: 'Month 12–24',
    whoMatters: 'Brokers, lenders, and title teams prepare lease-up, refi, sale, and take-out conversations.',
  },
];

const WHO_SPECS_WHAT: { role: string; controls: string }[] = [
  { role: 'Sponsor / borrower', controls: 'Capital stack, lender selection, hold/sell/refi decision, project budget' },
  { role: 'Commercial lender', controls: 'LTC/LTV limits, covenants, draw process, rate/spread, maturity/take-out requirements' },
  { role: 'Title / closing', controls: 'Title commitment, escrow process, closing timeline, lien exceptions, policy issuance' },
  { role: 'CRE broker', controls: 'Lease-up strategy, buyer/tenant relationships, market comps, assignment timing' },
  { role: 'Developer', controls: 'Site control, entitlement path, project scope, sponsor equity story' },
];

const ACRONYMS: { term: string; meaning: string }[] = [
  { term: 'CRE', meaning: 'Commercial real estate' },
  { term: 'Sponsor', meaning: 'Borrower/developer/operator behind the project and capital stack' },
  { term: 'LTC', meaning: 'Loan-to-cost — loan amount divided by total project cost' },
  { term: 'LTV', meaning: 'Loan-to-value — loan amount divided by stabilized/current property value' },
  { term: 'Construction-to-perm', meaning: 'Construction loan designed to convert into permanent financing after stabilization' },
  { term: 'Mini-perm', meaning: 'Shorter-term permanent loan used after construction before long-term take-out/refi' },
  { term: 'Refi', meaning: 'Refinance — replacing existing debt with new debt, often after value creation' },
  { term: 'Take-out', meaning: 'Permanent loan or sale proceeds used to pay off construction/bridge debt' },
  { term: 'Capital stack', meaning: 'Full mix of senior debt, mezz debt, preferred equity, and sponsor equity' },
  { term: 'NOI', meaning: 'Net operating income — property income after operating expenses, before debt service' },
  { term: 'DSCR', meaning: 'Debt service coverage ratio — NOI divided by required debt payments' },
  { term: 'Bridge loan', meaning: 'Short-term debt used before permanent financing, sale, or stabilization' },
  { term: 'Draw', meaning: 'Scheduled construction-loan disbursement tied to progress and inspections' },
  { term: 'Title commitment', meaning: 'Title company promise to issue policy subject to listed requirements/exceptions' },
  { term: 'Escrow', meaning: 'Neutral closing account/process that holds funds and documents until conditions are met' },
  { term: 'Lease-up', meaning: 'Period after delivery when vacant space/units are being leased' },
  { term: 'Comps', meaning: 'Comparable sales or leases used for valuation and pricing' },
  { term: 'Cap rate', meaning: 'NOI divided by property value; shorthand for market yield/pricing' },
  { term: 'CO', meaning: 'Certificate of occupancy — building is legal to occupy' },
  { term: 'GC', meaning: 'General contractor — executes the build; useful context, not our primary buyer' },
];

export default function GlossaryPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/glossary" />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Industry primer · internal"
            title="Read this once and sound credible on every call."
            blurb="Permit signals, capital/closing stakeholders, CRE timing windows, who controls what, and a working glossary. Designed to be skimmed in 10 minutes and re-referenced before any prospect call."
          />

          <Note>
            <FactPill /> Definitions below blend standard commercial construction permit timing with CRE finance, title, and brokerage terminology. Specific cycle ranges are typical commercial mid-size projects ($1–20M); larger/smaller projects vary.
          </Note>

          <div className="mt-10" />

          <Section title="Permit types" eyebrow="What you'll see in our data">
            <div className="space-y-3">
              {PERMIT_TYPES.map((p) => (
                <Card key={p.name}>
                  <div className="grid gap-4 lg:grid-cols-[200px,1fr,1fr,1.4fr]">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                        Type
                      </div>
                      <div className="mt-1 text-[14.5px] font-semibold text-white">{p.name}</div>
                    </div>
                    <Field label="What it means" value={p.what} />
                    <Field label="Typical cycle" value={p.cycle} />
                    <Field label="Why it matters to us" value={p.matters} />
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Stakeholder roles — who to talk to" eyebrow="Capital + transaction map">
            <div className="space-y-3">
              {GC_ROLES.map((r) => (
                <Card key={r.role}>
                  <div className="grid gap-4 lg:grid-cols-[200px,1fr,1.2fr]">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                        Role
                      </div>
                      <div className="mt-1 text-[14.5px] font-semibold text-white">{r.role}</div>
                    </div>
                    <Field label="What they do" value={r.whatTheyDo} />
                    <Field label="Why we care" value={r.whoSellsThem} />
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="CRE timing windows" eyebrow="When each buyer cares about a project">
            <Note>
              The timing column is the most actionable part of our data. Lenders care when a project needs construction debt, refi, or take-out. Title teams care before closings. Brokers care before lease-up, sale, or tenant movement becomes obvious.
            </Note>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-[13px]">
                <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Phase</th>
                    <th className="px-4 py-2.5 text-left">Week range</th>
                    <th className="px-4 py-2.5 text-left">Why it matters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {BID_TIMING.map((b) => (
                    <tr key={b.phase}>
                      <td className="px-4 py-3 align-top font-medium text-white">{b.phase}</td>
                      <td className="px-4 py-3 align-top font-mono text-amber-300/90">
                        {b.weekRange}
                      </td>
                      <td className="px-4 py-3 align-top text-zinc-300/85">{b.whoMatters}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Who controls what" eyebrow="CRE influence map">
            <Note>
              On a commercial project, the sponsor controls the capital decision, lenders shape leverage and take-out options, title teams control closing risk, and brokers control market relationships. Knowing who controls which lever is what separates a credible discovery call from a clueless one.
            </Note>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-[13.5px]">
                <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Role</th>
                    <th className="px-4 py-2.5 text-left">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {WHO_SPECS_WHAT.map((w) => (
                    <tr key={w.role}>
                      <td className="px-4 py-3 font-medium text-white">{w.role}</td>
                      <td className="px-4 py-3 text-zinc-300/85">{w.controls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Acronym dictionary" eyebrow="Don't get caught not knowing">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {ACRONYMS.map((a) => (
                <div
                  key={a.term}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3"
                >
                  <div className="font-mono text-[12.5px] font-semibold text-amber-300">
                    {a.term}
                  </div>
                  <div className="mt-1 text-[13px] leading-[1.5] text-zinc-300/85">
                    {a.meaning}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="The 60-second elevator framing" eyebrow="If a prospect asks 'so what do you do'">
            <Card>
              <p className="text-[14.5px] italic leading-[1.65] text-zinc-200/95">
                "We track every commercial construction permit filed in your metro and turn it into CRE pipeline intelligence. Every Monday you get sponsor/applicant, asset type, project value, address, and likely lender/title/broker angle. Lenders use it for origination and refi timing, title teams for future closings, and brokers for lease-up or investment-sale timing. $299 to $999 a month depending on audience and access. That's it."
              </p>
            </Card>
            <p className="mt-4 text-[13px] leading-[1.6] text-zinc-400">
              No buzzwords. Names what we do, who buys, what they get. Memorize it.
            </p>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <p className="mt-1 text-[13px] leading-[1.55] text-zinc-300/90">{value}</p>
    </div>
  );
}
