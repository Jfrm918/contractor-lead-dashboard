import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, FactPill, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — Industry primer',
};

/* ============================================================
   Industry primer / glossary
   What Madison needs to know to sound credible on a discovery
   call. Standard commercial construction concepts.
   ============================================================ */

const PERMIT_TYPES: { name: string; what: string; cycle: string; matters: string }[] = [
  {
    name: 'New construction (ground-up)',
    what: 'Permit to build a new structure from scratch — vertical construction, foundation through finish.',
    cycle: '12–24 months from permit to substantial completion typical for commercial mid-size.',
    matters:
      'Highest dollar value per project. Subs spec\'d in months 1–3. Material orders weeks 4–12. This is the prime hunting ground.',
  },
  {
    name: 'Tenant improvement (TI)',
    what: 'Interior buildout of an existing leased space — common in retail, office, restaurant fit-outs.',
    cycle: '6–16 weeks from permit to occupancy.',
    matters:
      'Faster cycle, smaller dollar amounts, but high frequency. Good fit for HVAC, electrical, finishes subs.',
  },
  {
    name: 'Addition / alteration',
    what: 'Adding to or modifying an existing structure — expansion, rebuild after damage, modernization.',
    cycle: 'Varies wildly — a 6-month addition is common.',
    matters: 'Often spec\'d to match existing — easier sale if you already have a relationship with that GC.',
  },
  {
    name: 'Repair / replacement',
    what: 'Roof replacement, mechanical equipment swap, structural repair.',
    cycle: '2–10 weeks typical.',
    matters: 'Fast turn, recurring buyer relationships. Roofing/HVAC/foam reps live here.',
  },
  {
    name: 'Demolition',
    what: 'Permit to tear down a structure (often paired with a new-construction permit at the same site).',
    cycle: 'Usually 2–8 weeks before ground-up permit lands.',
    matters: 'Demo permit is an early signal a new project is coming. Track these as "future leads."',
  },
];

const GC_ROLES: { role: string; whatTheyDo: string; whoSellsThem: string }[] = [
  {
    role: 'Project Manager (PM)',
    whatTheyDo:
      'Owns the project end-to-end. Schedules subs, signs off on changes, manages the budget, signs invoices.',
    whoSellsThem:
      'Material reps and major subs (mechanical, structural). PM is who you want on Day 1 of a permit.',
  },
  {
    role: 'Estimator',
    whatTheyDo:
      'Builds the bid before the project wins. Scope-of-work documents, takeoffs, sub solicitations, pricing.',
    whoSellsThem:
      'Material reps trying to influence spec. Subs sending in bids. Estimator decides who gets invited to bid.',
  },
  {
    role: 'Superintendent (Super)',
    whatTheyDo:
      'On-site daily operations. Manages subs in the field, schedule, safety, quality, day-to-day execution.',
    whoSellsThem:
      'Subs already on the project who need product or scope changes mid-build.',
  },
  {
    role: 'Director of Operations / VP',
    whatTheyDo: 'Oversees multiple projects. Strategic relationships, vendor approvals, account-level decisions.',
    whoSellsThem:
      'Material reps doing master-agreement deals. Software/data vendors (us). Approves new vendors company-wide.',
  },
  {
    role: 'Owner / Principal',
    whatTheyDo: 'On smaller GCs (under ~50 employees), often still touches every deal personally.',
    whoSellsThem: 'Anyone trying to land a relationship-level account at a smaller firm.',
  },
];

const BID_TIMING: { phase: string; weekRange: string; whoMatters: string }[] = [
  {
    phase: 'Permit filed',
    weekRange: 'Week 0',
    whoMatters: 'PM is named, project goes public. This is the data we sell.',
  },
  {
    phase: 'Architect / engineering finalization',
    weekRange: 'Week 0–4',
    whoMatters:
      'Architect locks insulation, roofing, glazing specs. Material reps need to influence spec NOW.',
  },
  {
    phase: 'Sub bid solicitation',
    weekRange: 'Week 2–6',
    whoMatters: 'Estimator sends RFPs. Subs respond. Best window for an unknown sub to get on a bid list.',
  },
  {
    phase: 'Sub awards',
    weekRange: 'Week 4–8',
    whoMatters: 'Mechanical, electrical, plumbing, structural awards. Material orders go out shortly after.',
  },
  {
    phase: 'Material orders',
    weekRange: 'Week 6–12',
    whoMatters: 'Distributors and reps fulfilling. Lead times start mattering.',
  },
  {
    phase: 'Mobilization / groundbreaking',
    weekRange: 'Week 8–12',
    whoMatters: 'Site supers active. Day-of-construction subs (excavation, utilities) on site.',
  },
  {
    phase: 'Substantial completion',
    weekRange: 'Month 12–24',
    whoMatters:
      'CRE brokers start lease-up calls. Property managers active. Insurance binding.',
  },
];

const WHO_SPECS_WHAT: { role: string; controls: string }[] = [
  { role: 'Architect', controls: 'Insulation, roofing, glazing, finishes, fire protection systems' },
  { role: 'MEP engineer', controls: 'HVAC, plumbing, electrical, controls, fire alarm' },
  { role: 'Structural engineer', controls: 'Steel, concrete, reinforcement, foundations' },
  { role: 'Civil engineer', controls: 'Sitework, utilities, drainage, paving' },
  { role: 'Owner', controls: 'Final budget approvals, brand-driven finish overrides' },
];

const ACRONYMS: { term: string; meaning: string }[] = [
  { term: 'GC', meaning: 'General contractor' },
  { term: 'PM', meaning: 'Project manager' },
  { term: 'TI', meaning: 'Tenant improvement' },
  { term: 'MEP', meaning: 'Mechanical, electrical, plumbing' },
  { term: 'BIM', meaning: 'Building information modeling — the 3D digital design model' },
  { term: 'CD', meaning: 'Construction documents — the final stamped drawings' },
  { term: 'RFI', meaning: 'Request for information — sub asks PM/architect a clarifying question' },
  { term: 'RFP / RFQ', meaning: 'Request for proposal / quote — formal bid solicitation' },
  { term: 'Sub', meaning: 'Subcontractor — performs a specific scope (insulation, HVAC, etc.)' },
  { term: 'Spec', meaning: 'Specification — written description of materials and methods' },
  { term: 'Submittal', meaning: 'Sub\'s formal product approval doc sent to architect/PM' },
  { term: 'Punch list', meaning: 'Final defect list before owner accepts the building' },
  { term: 'CO', meaning: 'Certificate of occupancy — building is legal to occupy' },
  { term: 'Substantial completion', meaning: 'Project usable for intended purpose; warranties begin' },
  { term: 'Closeout', meaning: 'Final payment + warranty transfer at project end' },
  { term: 'Change order (CO)', meaning: 'Mid-project scope or price modification' },
  { term: 'Bid leveling', meaning: 'Estimator normalizing competing bids to compare apples-to-apples' },
  { term: 'Buyout', meaning: 'GC has finished awarding all subs and locked the project budget' },
  { term: 'Master service agreement (MSA)', meaning: 'Pre-negotiated terms between two companies for repeat work' },
  { term: 'Pre-bid meeting', meaning: 'Walk-through of the project for interested subs before bids are due' },
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
            blurb="Permit types, GC org chart, bid timing windows, who specs what, and a working glossary. Designed to be skimmed in 10 minutes and re-referenced before any prospect call."
          />

          <Note>
            <FactPill /> Definitions and standard cycles below are drawn from CSI MasterFormat,
            AIA contract documents, ABC industry data, and standard commercial construction
            project management practice. Specific cycle ranges are typical commercial mid-size
            projects ($1–20M); larger/smaller projects vary.
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

          <Section title="GC roles — who to talk to" eyebrow="The org chart of a project">
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
                    <Field label="Who sells to them" value={r.whoSellsThem} />
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Bid timing windows" eyebrow="When each buyer cares about a project">
            <Note>
              The timing column is the most actionable part of our data. A material rep sees the
              "permit filed → architect spec finalization" window (week 0–4) as their golden
              hour. An HVAC sub sees "sub bid solicitation" (week 2–6).
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

          <Section title="Who specs what" eyebrow="Influence map">
            <Note>
              On a commercial project, the architect and engineers — not the GC — control most
              material and system decisions. Material reps spend 80% of their time on architects
              and engineers, not GCs. Knowing this is what separates a credible discovery call
              from a clueless one.
            </Note>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-[13.5px]">
                <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Role</th>
                    <th className="px-4 py-2.5 text-left">Controls the spec for</th>
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
                "We track every commercial construction permit filed in your metro. Every Monday
                morning we send you a verified list with the GC, project value, address, and the
                project manager's email and phone. Most of our customers use it to get on bids
                two weeks earlier than they would otherwise. $149 to $499 a month depending on
                metros and how you want the data delivered. That's it."
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
