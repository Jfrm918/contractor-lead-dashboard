// Vantage 2.0 audiences — commercial real estate intelligence buyers in Tulsa.
// Pivoted 2026-05-10 from contractor-vendor (saturated buyer) to lender/title/broker
// (real demand, larger budgets, family-network warm-intro path).

export type AudienceCategory = 'lender' | 'title' | 'broker' | 'developer';

export type Audience = {
  id: string;
  label: string;
  shortLabel: string;
  category: AudienceCategory;
  // Plain-English description of who the buyer is
  buyerDescription: string;
  // What signal in the permit data they care about most
  signalAngle: string;
  // What permit types matter (case-insensitive substring match against permit.type)
  permitTypeIncludes: string[];
  permitTypeExcludes?: string[];
  // Minimum project size signal — if valuation < this, lower priority for this audience
  minValuation?: number;
  // Which contact role (Applicant / Contractor) is more relevant for this audience
  primaryContactRole: 'Applicant' | 'Contractor';
  // The week, post-permit-applied, when this audience optimally makes contact.
  whyNowWeek: number;
  whyNowLabel: string;
  // The pitch hook — why does this permit matter to this audience?
  pitchAngle: string;
  // Sample outreach email components (variables substituted at render time).
  sampleSubject: string;
  sampleOpener: string;
};

export const ALL_AUDIENCES_ID = 'all';

export const AUDIENCES: Audience[] = [
  // ─── LENDERS ───
  {
    id: 'commercial-lender',
    label: 'Commercial lender',
    shortLabel: 'Lender',
    category: 'lender',
    buyerDescription:
      'Commercial banks + private lenders pitching construction-to-perm loans, mini-perm refinance, and bridge financing on Tulsa CRE projects.',
    signalAngle:
      'New commercial permits = future construction loan + future take-out / refi opportunity. Earlier you reach the sponsor, more likely you bank the deal.',
    permitTypeIncludes: [
      'building: new construction (commercial)',
      'building: addition (commercial)',
      'certificate of occupancy (commercial)',
    ],
    permitTypeExcludes: [
      'changeout',
      'water heater',
      'pool',
      'sidewalk',
      'driveway',
      'row:',
      'electrical:',
      'plumbing:',
      'mechanical:',
    ],
    minValuation: 500_000,
    primaryContactRole: 'Applicant',
    whyNowWeek: 1,
    whyNowLabel: 'Email week 1-2 (financing window)',
    pitchAngle:
      'Sponsors of $500K+ commercial projects often haven’t locked construction-to-perm terms when permits drop. First lender to call has the inside track.',
    sampleSubject: 'Construction-to-perm financing for {{address}}',
    sampleOpener:
      'Hi {{firstName}}, congrats on the {{type}} permit at {{address}}. Reaching out before you lock construction-to-perm terms — we’re currently quoting {{loan_offer_summary_or_blank}} for projects this size and can typically close in 30-45 days. Worth a 15-minute conversation while pricing is fresh?',
  },

  // ─── TITLE & CLOSING ───
  {
    id: 'title-closing',
    label: 'Title & closing company',
    shortLabel: 'Title',
    category: 'title',
    buyerDescription:
      'Title agencies + closing attorneys watching commercial transactions for upcoming files. Relationships drive who gets the closing — early signal = first call advantage.',
    signalAngle:
      'New commercial permits today → certificate of occupancy + likely sale or refi closing in 6-18 months. Get on the file before the sponsor selects a title agent.',
    permitTypeIncludes: [
      'building: new construction (commercial)',
      'building: addition (commercial)',
      'certificate of occupancy (commercial)',
    ],
    permitTypeExcludes: [
      'changeout',
      'water heater',
      'sidewalk',
      'driveway',
      'row:',
      'pool',
      'electrical:',
      'plumbing:',
      'mechanical:',
    ],
    minValuation: 250_000,
    primaryContactRole: 'Applicant',
    whyNowWeek: 2,
    whyNowLabel: 'Email week 2-4 (relationship-build window)',
    pitchAngle:
      'Sponsors will need title work for the construction loan now AND the eventual refi/sale. A relationship started at permit-pull lasts the whole project lifecycle.',
    sampleSubject: 'Title services for {{address}} project',
    sampleOpener:
      'Hi {{firstName}}, saw the new {{type}} permit at {{address}}. Wanted to introduce ourselves before you lock title for the construction loan — we handle commercial closings across Tulsa metro and would love to be on the list. Quick call this week?',
  },

  // ─── CRE BROKERS ───
  {
    id: 'broker-tenant-rep',
    label: 'CRE broker (tenant + landlord rep)',
    shortLabel: 'Broker',
    category: 'broker',
    buyerDescription:
      'Commercial real estate brokers chasing tenant-rep, landlord-rep, and investment-sale opportunities on new Tulsa builds and existing inventory turnover.',
    signalAngle:
      'New commercial buildings = future leasing demand. Permits issued now = lease-up campaign in 6-12 months. Owner contact = chance to win listing.',
    permitTypeIncludes: [
      'building: new construction (commercial)',
      'building: addition (commercial)',
    ],
    permitTypeExcludes: [
      'changeout',
      'water heater',
      'sidewalk',
      'driveway',
      'row:',
      'pool',
      'tower',
      'electrical:',
      'plumbing:',
      'mechanical:',
    ],
    minValuation: 1_000_000,
    primaryContactRole: 'Applicant',
    whyNowWeek: 6,
    whyNowLabel: 'Email week 6-10 (post-shell, pre-lease-up)',
    pitchAngle:
      'New commercial shells need tenants. Owner relationships established during construction often get the leasing assignment.',
    sampleSubject: 'Leasing strategy for {{address}}',
    sampleOpener:
      'Hi {{firstName}}, noticed the {{type}} permit at {{address}}. As you head toward lease-up, we represent active tenants in the Tulsa market and would love to discuss the leasing plan. Open to a brief intro this week?',
  },

  // ─── DEVELOPERS / INVESTORS ───
  {
    id: 'developer-investor',
    label: 'Commercial developer / investor',
    shortLabel: 'Developer',
    category: 'developer',
    buyerDescription:
      'Active developers + private commercial investors tracking the Tulsa pipeline for competitive intelligence, JV opportunities, and acquisition targets.',
    signalAngle:
      'Knowing what’s being built where shapes site selection, comp data, and competitive positioning. Permit data = real-time market map.',
    permitTypeIncludes: [
      'building: new construction (commercial)',
      'building: addition (commercial)',
    ],
    permitTypeExcludes: [
      'changeout',
      'water heater',
      'sidewalk',
      'driveway',
      'row:',
      'pool',
      'electrical:',
      'plumbing:',
      'mechanical:',
    ],
    minValuation: 1_000_000,
    primaryContactRole: 'Applicant',
    whyNowWeek: 0,
    whyNowLabel: 'Continuous monitoring',
    pitchAngle:
      'Real-time visibility into Tulsa’s commercial development pipeline. Use it for site selection, comp data, and identifying JV / acquisition opportunities.',
    sampleSubject: 'New {{type}} development at {{address}}',
    sampleOpener:
      'Hi {{firstName}}, flagging the {{type}} permit at {{address}} for your pipeline tracking. If you’d like to compare notes on the Tulsa market or discuss potential JV / co-investment opportunities on similar projects, happy to connect.',
  },
];

export const AUDIENCES_BY_ID: Record<string, Audience> = Object.fromEntries(
  AUDIENCES.map((a) => [a.id, a]),
);

export const AUDIENCES_BY_CATEGORY: Record<AudienceCategory, Audience[]> = {
  lender: AUDIENCES.filter((a) => a.category === 'lender'),
  title: AUDIENCES.filter((a) => a.category === 'title'),
  broker: AUDIENCES.filter((a) => a.category === 'broker'),
  developer: AUDIENCES.filter((a) => a.category === 'developer'),
};

export const CATEGORY_LABELS: Record<AudienceCategory, string> = {
  lender: 'Lending',
  title: 'Title & closing',
  broker: 'Brokerage',
  developer: 'Development',
};

// Filter logic: does this permit match an audience?
export function permitMatchesAudience(
  permit: { type: string; valuation?: number | null },
  audience: Audience,
): boolean {
  const t = (permit.type || '').toLowerCase();
  const matchesInclude = audience.permitTypeIncludes.some((p) => t.includes(p.toLowerCase()));
  if (!matchesInclude) return false;
  if (audience.permitTypeExcludes?.some((p) => t.includes(p.toLowerCase()))) return false;
  if (audience.minValuation && permit.valuation && permit.valuation < audience.minValuation) return false;
  return true;
}

// Render a sample outreach email by substituting permit data into the audience template.
export function renderOutreachEmail(
  audience: Audience,
  permit: { type: string; address: string; appliedDate: string; firstName?: string | null; valuation?: number | null },
): { subject: string; body: string } {
  const vars: Record<string, string> = {
    type: shortenType(permit.type),
    address: permit.address,
    appliedDate: formatShortDate(permit.appliedDate),
    firstName: permit.firstName || 'there',
    loan_offer_summary_or_blank: permit.valuation
      ? `60-75% LTC on a ${formatMoney(permit.valuation)} project`
      : 'competitive construction-to-perm rates',
  };
  return {
    subject: substitute(audience.sampleSubject, vars),
    body: substitute(audience.sampleOpener, vars),
  };
}

function substitute(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

function shortenType(type: string): string {
  return type.replace(/^Building:\s*/i, '').replace(/\s*\(/g, ' (').toLowerCase();
}

function formatShortDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
