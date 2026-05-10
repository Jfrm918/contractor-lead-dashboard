export type TradeCategory = 'core-supply' | 'finish' | 'services' | 'equipment' | 'professional';

export type Trade = {
  id: string;
  label: string;
  shortLabel: string;
  category: TradeCategory;
  // One-line vendor description for the dropdown / tabs
  vendorDescription: string;
  // Substrings that, if found in permit.type (case-insensitive), include the permit for this trade.
  // If a permit matches ANY include pattern, it's relevant to this trade.
  permitTypeIncludes: string[];
  // If a permit matches ANY exclude pattern, it's filtered out (overrides includes).
  permitTypeExcludes?: string[];
  // The week, after permit applied date, when this vendor optimally makes contact.
  whyNowWeek: number;
  whyNowLabel: string;
  // The pitch hook — why does this permit matter to this trade?
  pitchAngle: string;
  // Sample outreach email components (variables substituted at render time).
  sampleSubject: string;
  sampleOpener: string;
};

export const ALL_TRADES_ID = 'all';

export const TRADES: Trade[] = [
  // ─── CORE SUPPLY ───
  {
    id: 'insulation',
    label: 'Insulation & spray foam',
    shortLabel: 'Insulation',
    category: 'core-supply',
    vendorDescription: 'Insulation distributors, spray foam suppliers, fiberglass batt and blown-in.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'building: alteration'],
    permitTypeExcludes: ['changeout', 'water heater', 'sidewalk', 'driveway', 'row:'],
    whyNowWeek: 4,
    whyNowLabel: 'Email week 3-4 (after framing inspection)',
    pitchAngle: 'Framing typically wraps 3-4 weeks post-permit. Insulation buy decision happens that week.',
    sampleSubject: 'New {{type}} permit at {{address}} — insulation order coming up',
    sampleOpener: 'Hi {{firstName}}, just saw the {{type}} permit you pulled at {{address}} on {{appliedDate}}. Based on the work class, you\'ll be ready for insulation around week 3-4. We carry [your product line] in stock with next-day delivery to Tulsa job sites — happy to send a quote sheet for this project if helpful.',
  },
  {
    id: 'roofing-supply',
    label: 'Roofing supply',
    shortLabel: 'Roofing',
    category: 'core-supply',
    vendorDescription: 'Asphalt shingles, metal panels, membrane, underlayment, accessories.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'building: alteration', 'roof'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'water meter', 'row:'],
    whyNowWeek: 6,
    whyNowLabel: 'Email week 5-6 (after dry-in)',
    pitchAngle: 'Roof work happens after framing + dry-in, typically week 5-6 from permit.',
    sampleSubject: 'Roofing materials for {{address}} project',
    sampleOpener: 'Hi {{firstName}}, I noticed your {{type}} permit at {{address}}. For projects this size, we usually quote out roofing material around the dry-in stage (weeks 5-6 from permit). Want me to put together a budgetary quote for shingles + underlayment based on the typical sqft for this work class?',
  },
  {
    id: 'lumber',
    label: 'Lumber & framing',
    shortLabel: 'Lumber',
    category: 'core-supply',
    vendorDescription: 'Dimensional lumber, engineered wood, trusses, sheathing, fasteners.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'building: alteration'],
    permitTypeExcludes: ['certificate of occupancy', 'changeout', 'sidewalk', 'driveway', 'row:'],
    whyNowWeek: 1,
    whyNowLabel: 'Email week 1 (immediately after permit)',
    pitchAngle: 'Lumber is the FIRST material order. Get the bid in before the GC calls competitors.',
    sampleSubject: 'Lumber package for {{address}} — quote ready by Monday',
    sampleOpener: 'Hi {{firstName}}, congrats on the new {{type}} permit at {{address}}. We can have a full lumber + framing package quote ready for your project within 48 hours, with delivery scheduling tied to your foundation pour date. Want to lock in lumber pricing now while the market is steady?',
  },
  {
    id: 'drywall',
    label: 'Drywall & gypsum',
    shortLabel: 'Drywall',
    category: 'core-supply',
    vendorDescription: 'Sheetrock, joint compound, metal stud, gypsum products.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'building: alteration'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'row:'],
    whyNowWeek: 5,
    whyNowLabel: 'Email week 4-5 (after rough-in inspections)',
    pitchAngle: 'Drywall stage hits after electrical/plumbing/insulation rough-in — typically week 5.',
    sampleSubject: 'Drywall package for {{address}} project',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. We supply contractors across Tulsa with same-day drywall delivery — when you\'re ready for the rock-and-mud stage, we can have the order on your jobsite within 24 hours. Want to be in our weekly delivery loop for this project?',
  },
  {
    id: 'concrete',
    label: 'Concrete & aggregate',
    shortLabel: 'Concrete',
    category: 'core-supply',
    vendorDescription: 'Ready-mix concrete, aggregate, sand, foundation/slab pours.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'foundation', 'sidewalk', 'driveway'],
    permitTypeExcludes: ['certificate of occupancy', 'water heater', 'changeout', 'electrical:', 'plumbing:'],
    whyNowWeek: 1,
    whyNowLabel: 'Email week 1-2 (foundation prep)',
    pitchAngle: 'Foundation pour is the FIRST major site activity. Concrete buy happens 1-2 weeks post-permit.',
    sampleSubject: 'Ready-mix for {{address}} foundation',
    sampleOpener: 'Hi {{firstName}}, I saw the {{type}} permit you pulled at {{address}}. We\'re running daily delivery routes through that area — want me to slot you in for the foundation pour once you have a date locked? We can hold pricing for 30 days.',
  },
  {
    id: 'electrical-supply',
    label: 'Electrical supply',
    shortLabel: 'Electrical',
    category: 'core-supply',
    vendorDescription: 'Wholesale electrical: wire, panels, fixtures, conduit, gear.',
    permitTypeIncludes: ['electrical:', 'building: new construction', 'building: addition'],
    permitTypeExcludes: ['water heater', 'pool', 'sidewalk', 'driveway', 'row:'],
    whyNowWeek: 3,
    whyNowLabel: 'Email week 3-4 (rough-in stage)',
    pitchAngle: 'Electrical rough-in begins week 3-4. Materials list is the buy moment.',
    sampleSubject: 'Electrical materials for {{address}}',
    sampleOpener: 'Hi {{firstName}}, just noticed the {{type}} permit at {{address}}. We stock the full electrical materials list — wire, panels, fixtures — for projects this size with same-day will-call or jobsite delivery. Want me to send our current pricing sheet so you can pre-bid?',
  },
  {
    id: 'plumbing-hvac-supply',
    label: 'Plumbing & HVAC supply',
    shortLabel: 'Plumbing/HVAC',
    category: 'core-supply',
    vendorDescription: 'Wholesale plumbing/HVAC: pipe, fittings, fixtures, equipment.',
    permitTypeIncludes: ['plumbing:', 'mechanical:', 'building: new construction', 'building: addition'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'pool', 'row:'],
    whyNowWeek: 3,
    whyNowLabel: 'Email week 3-4 (rough-in stage)',
    pitchAngle: 'Plumbing/mechanical rough-in starts week 3-4. Get on the supplier shortlist now.',
    sampleSubject: 'Plumbing & mechanical for {{address}}',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. We carry the full plumbing/mechanical line for jobs this size — pipe, fittings, water heaters, HVAC equipment. Daily delivery to Tulsa job sites. Want me to put together a take-off based on the typical scope for this work class?',
  },

  // ─── FINISH WORK ───
  {
    id: 'windows-doors',
    label: 'Windows & doors',
    shortLabel: 'Windows/doors',
    category: 'finish',
    vendorDescription: 'Replacement and new construction windows, entry doors, patio doors.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'building: alteration', 'window', 'door'],
    permitTypeExcludes: ['certificate of occupancy', 'sidewalk', 'driveway', 'row:'],
    whyNowWeek: 4,
    whyNowLabel: 'Email week 3-5 (rough opening stage)',
    pitchAngle: 'Window/door orders typically lock in around the rough opening stage, week 3-5.',
    sampleSubject: 'Windows + doors for {{address}}',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. Our turnaround on windows + entry doors for projects this size is 2-3 weeks from order — perfect timing if you order now to hit your rough opening date. Want me to send our 2026 catalog and pricing?',
  },
  {
    id: 'glass-glazing',
    label: 'Glass & glazing',
    shortLabel: 'Glazing',
    category: 'finish',
    vendorDescription: 'Commercial storefronts, curtain walls, custom glass.',
    permitTypeIncludes: ['building: new construction (commercial)', 'building: alteration (commercial)', 'building: addition (commercial)'],
    permitTypeExcludes: ['certificate of occupancy', 'sidewalk', 'driveway', 'row:', 'tower', 'water heater'],
    whyNowWeek: 6,
    whyNowLabel: 'Email week 6-8 (after structural)',
    pitchAngle: 'Storefront glazing happens after structural is up — typically week 6-8 for commercial.',
    sampleSubject: 'Storefront glass for {{address}}',
    sampleOpener: 'Hi {{firstName}}, noticed the commercial {{type}} permit at {{address}}. We handle storefront and curtain wall installs across Tulsa — happy to send measurements/specs to your superintendent once you\'re ready for glazing. Want to be on our pre-bid list for this project?',
  },
  {
    id: 'flooring',
    label: 'Flooring & finishes',
    shortLabel: 'Flooring',
    category: 'finish',
    vendorDescription: 'Tile, LVP, hardwood, carpet, commercial flooring.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'building: alteration', 'certificate of occupancy'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'water heater', 'row:'],
    whyNowWeek: 8,
    whyNowLabel: 'Email week 8-10 (finish stage)',
    pitchAngle: 'Flooring is one of the LAST trades — but the order needs to be placed weeks ahead.',
    sampleSubject: 'Flooring materials for {{address}}',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. We help GCs lock in flooring orders 4-6 weeks ahead of finish-stage so material is on-site when the crew is ready. Want to share the spec or scope so we can put a budgetary quote together?',
  },
  {
    id: 'paint',
    label: 'Paint & coatings',
    shortLabel: 'Paint',
    category: 'finish',
    vendorDescription: 'Commercial paint, primers, coatings, application equipment.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'building: alteration', 'certificate of occupancy'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'water heater', 'row:'],
    whyNowWeek: 8,
    whyNowLabel: 'Email week 8-10 (post-drywall)',
    pitchAngle: 'Paint stage hits after drywall finish — typically week 8-10 for residential.',
    sampleSubject: 'Paint package for {{address}}',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. We\'re your local commercial paint supplier — full spec/color matching, contractor pricing, jobsite delivery. Happy to set up a contractor account for this project so your crew can will-call as needed.',
  },

  // ─── EQUIPMENT & SITE SERVICES ───
  {
    id: 'equipment-rental',
    label: 'Equipment rental',
    shortLabel: 'Equipment rental',
    category: 'equipment',
    vendorDescription: 'Skid steers, excavators, lifts, telehandlers — anything on rent.',
    permitTypeIncludes: ['building:', 'foundation', 'demolition', 'commercial'],
    permitTypeExcludes: ['certificate of occupancy', 'water heater', 'changeout', 'sidewalk', 'driveway', 'electrical:', 'plumbing:'],
    whyNowWeek: 1,
    whyNowLabel: 'Email week 1 (mobilization)',
    pitchAngle: 'Equipment rental gets booked at mobilization — week 1. First call wins the contract.',
    sampleSubject: 'Equipment rental for {{address}} jobsite',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. We have skid steers, mini excavators, and lifts available for the duration of your project — daily, weekly, or monthly. Want me to put a custom equipment package together based on your scope?',
  },
  {
    id: 'crane-rental',
    label: 'Crane & rigging',
    shortLabel: 'Crane',
    category: 'equipment',
    vendorDescription: 'All-terrain cranes, rough terrain, boom trucks, rigging services.',
    permitTypeIncludes: ['building: new construction (commercial)', 'building: addition (commercial)', 'tower'],
    permitTypeExcludes: ['certificate of occupancy', 'changeout', 'sidewalk', 'driveway', 'electrical:', 'plumbing:', 'water heater'],
    whyNowWeek: 4,
    whyNowLabel: 'Email week 4-5 (steel/structural stage)',
    pitchAngle: 'Crane bookings happen at the steel/structural stage. Lock in operator-on-the-job NOW.',
    sampleSubject: 'Crane services for {{address}}',
    sampleOpener: 'Hi {{firstName}}, noticed the commercial {{type}} permit at {{address}}. Our crane fleet handles steel erection through tilt-ups for jobs this size with NCCCO-certified operators. Want me to send our day-rate sheet so you can pencil us into your structural budget?',
  },
  {
    id: 'dumpster-rental',
    label: 'Dumpster & waste',
    shortLabel: 'Dumpster',
    category: 'equipment',
    vendorDescription: 'Roll-off dumpsters, construction debris removal.',
    permitTypeIncludes: ['building:', 'demolition'],
    permitTypeExcludes: ['certificate of occupancy', 'changeout', 'water heater'],
    whyNowWeek: 1,
    whyNowLabel: 'Email week 1 (jobsite mobilization)',
    pitchAngle: 'Every active jobsite needs disposal. First-call wins the recurring relationship.',
    sampleSubject: 'Dumpster service for {{address}} jobsite',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. We handle roll-off service across Tulsa — same-day delivery, swap-outs as you need them. Want me to drop a 20- or 30-yard at the site as soon as you mobilize?',
  },

  // ─── PROFESSIONAL SERVICES ───
  {
    id: 'lender-commercial',
    label: 'Commercial lender',
    shortLabel: 'Lending',
    category: 'professional',
    vendorDescription: 'Commercial real estate + construction loans.',
    permitTypeIncludes: ['building: new construction (commercial)', 'building: addition (commercial)', 'certificate of occupancy (commercial)'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'water heater', 'row:', 'pool', 'electrical:', 'plumbing:', 'mechanical:'],
    whyNowWeek: 2,
    whyNowLabel: 'Email week 1-3 (refi/construction loan window)',
    pitchAngle: 'Commercial projects either need construction financing or will refi at completion. Both are bank revenue.',
    sampleSubject: 'Construction financing for {{address}}',
    sampleOpener: 'Hi {{firstName}}, congrats on the {{type}} permit at {{address}}. If you haven\'t locked in construction-to-perm financing yet, I\'d love to share what we\'re currently quoting for projects this size. We can typically close in 30-45 days. Worth a 15-min conversation?',
  },
  {
    id: 'insurance-bonds',
    label: 'Construction insurance & bonds',
    shortLabel: 'Insurance',
    category: 'professional',
    vendorDescription: 'Surety bonds, builders risk, general liability for contractors.',
    permitTypeIncludes: ['building: new construction (commercial)', 'building: addition (commercial)'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'water heater', 'row:', 'pool', 'electrical:', 'plumbing:', 'mechanical:'],
    whyNowWeek: 1,
    whyNowLabel: 'Email week 1 (pre-construction binder)',
    pitchAngle: 'Builders risk + bonding has to be in place before steel goes up — week 1 conversation.',
    sampleSubject: 'Builders risk + bond review for {{address}}',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. Now\'s the right time to lock in builders risk coverage and confirm your performance bond capacity. Happy to do a quick coverage review at no charge — takes about 20 minutes.',
  },
  {
    id: 'survey-civil',
    label: 'Survey & civil engineering',
    shortLabel: 'Survey',
    category: 'professional',
    vendorDescription: 'Land surveying, construction staking, civil engineering services.',
    permitTypeIncludes: ['building: new construction', 'building: addition', 'foundation', 'sidewalk', 'driveway'],
    permitTypeExcludes: ['certificate of occupancy', 'water heater', 'changeout', 'electrical:', 'plumbing:', 'mechanical:', 'row:'],
    whyNowWeek: 1,
    whyNowLabel: 'Email week 1 (pre-mobilization)',
    pitchAngle: 'Construction staking and topo are needed BEFORE any earth moves — week 1 contact.',
    sampleSubject: 'Construction staking for {{address}}',
    sampleOpener: 'Hi {{firstName}}, saw the {{type}} permit at {{address}}. Before you mobilize, we can have construction staking, topo, and elevation marks done within 5 business days. Want me to send a fee schedule for projects this size?',
  },
  {
    id: 'security-lowvoltage',
    label: 'Security & low voltage',
    shortLabel: 'Security/AV',
    category: 'finish',
    vendorDescription: 'Access control, fire alarm, structured cabling, surveillance.',
    permitTypeIncludes: ['building: new construction (commercial)', 'fire alarm', 'building: addition (commercial)'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'water heater', 'row:', 'plumbing:', 'mechanical:'],
    whyNowWeek: 6,
    whyNowLabel: 'Email week 6-8 (rough-in stage)',
    pitchAngle: 'Low-voltage cabling has to be roughed in before drywall closes up the walls.',
    sampleSubject: 'Security + low-voltage rough-in for {{address}}',
    sampleOpener: 'Hi {{firstName}}, saw the commercial {{type}} permit at {{address}}. For builds this size, low-voltage rough-in (cabling, access control conduit, alarm wire) needs to be done before drywall close-up. Want me to send a scope template you can hand to your superintendent?',
  },
  {
    id: 'solar-commercial',
    label: 'Commercial solar',
    shortLabel: 'Solar',
    category: 'finish',
    vendorDescription: 'Commercial PV systems, rooftop and ground-mount.',
    permitTypeIncludes: ['building: new construction (commercial)', 'building: addition (commercial)', 'electrical: new construction (commercial)'],
    permitTypeExcludes: ['changeout', 'sidewalk', 'driveway', 'water heater', 'row:', 'plumbing:', 'mechanical:', 'pool'],
    whyNowWeek: 6,
    whyNowLabel: 'Email week 6-8 (post-roof structure)',
    pitchAngle: 'Commercial solar makes sense once the roof is structurally complete — week 6-8.',
    sampleSubject: 'Commercial solar evaluation for {{address}}',
    sampleOpener: 'Hi {{firstName}}, noticed the commercial {{type}} permit at {{address}}. We do free solar feasibility studies for projects this size — current ITC + Oklahoma incentives are paying back commercial PV in 4-6 years. Want a 1-pager on the project?',
  },
];

// Build a quick lookup
export const TRADES_BY_ID: Record<string, Trade> = Object.fromEntries(TRADES.map((t) => [t.id, t]));

// Categorized for UI grouping
export const TRADES_BY_CATEGORY: Record<TradeCategory, Trade[]> = {
  'core-supply': TRADES.filter((t) => t.category === 'core-supply'),
  finish: TRADES.filter((t) => t.category === 'finish'),
  services: TRADES.filter((t) => t.category === 'services'),
  equipment: TRADES.filter((t) => t.category === 'equipment'),
  professional: TRADES.filter((t) => t.category === 'professional'),
};

export const CATEGORY_LABELS: Record<TradeCategory, string> = {
  'core-supply': 'Core supply',
  finish: 'Finish work',
  services: 'Services',
  equipment: 'Equipment',
  professional: 'Professional',
};

// Filter logic: does this permit match a trade?
export function permitMatchesTrade(permitType: string, trade: Trade): boolean {
  const t = (permitType || '').toLowerCase();
  const matchesInclude = trade.permitTypeIncludes.some((p) => t.includes(p.toLowerCase()));
  if (!matchesInclude) return false;
  if (trade.permitTypeExcludes?.some((p) => t.includes(p.toLowerCase()))) return false;
  return true;
}

// Render a sample outreach email by substituting permit data into the trade template.
export function renderOutreachEmail(
  trade: Trade,
  permit: { type: string; address: string; appliedDate: string; firstName?: string | null },
): { subject: string; body: string } {
  const vars: Record<string, string> = {
    type: shortenType(permit.type),
    address: permit.address,
    appliedDate: formatShortDate(permit.appliedDate),
    firstName: permit.firstName || 'there',
  };
  return {
    subject: substitute(trade.sampleSubject, vars),
    body: substitute(trade.sampleOpener, vars),
  };
}

function substitute(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

function shortenType(type: string): string {
  // "Building: Alteration (Commercial)" → "commercial alteration"
  return type
    .replace(/^Building:\s*/i, '')
    .replace(/\s*\(/g, ' (')
    .toLowerCase();
}

function formatShortDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
