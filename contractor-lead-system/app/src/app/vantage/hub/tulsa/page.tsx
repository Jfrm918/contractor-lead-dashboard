import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import permitsData from '@/data/tulsa-permits-live.json';

export const metadata = {
  title: 'Vantage — Tulsa live permits',
  description: 'Live high-value Tulsa construction permits with verified contractor contacts.',
};

type Contact = {
  role: string | null;
  company: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  phoneType: string | null;
  address: string | null;
};

type Permit = {
  permitNumber: string;
  caseId: string;
  type: string;
  workClass: string | null;
  status: string;
  appliedDate: string;
  issuedDate: string | null;
  address: string;
  city: string | null;
  zip: string | null;
  parcel: string | null;
  description: string | null;
  valuation: number | null;
  squareFeet: number | null;
  contacts: Contact[];
  portalUrl: string;
};

type PermitsFile = {
  fetchedAt: string;
  source: string;
  windowDays: number;
  totalCandidates: number;
  enrichedCount: number;
  permits: Permit[];
};

const DATA = permitsData as PermitsFile;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatPhone(p: string | null) {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith('1')) return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return p;
}
function pickPrimaryContact(contacts: Contact[]): Contact | null {
  const byRole = (role: string) => contacts.find((c) => c.role?.toLowerCase() === role.toLowerCase() && (c.email || c.phone));
  return byRole('Contractor') || byRole('Applicant') || contacts.find((c) => c.email || c.phone) || contacts[0] || null;
}

export default function TulsaLivePermits() {
  const fetchedAt = new Date(DATA.fetchedAt);
  const fetchedLabel = fetchedAt.toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const withEmail = DATA.permits.filter((p) => p.contacts.some((c) => c.email)).length;
  const withPhone = DATA.permits.filter((p) => p.contacts.some((c) => c.phone)).length;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/tulsa" />
        <main className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
          <header className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
              Tulsa · live
            </p>
            <h1 className="mt-2 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
              {DATA.enrichedCount} high-value permits, {withEmail} verified contacts.
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-[1.6] text-zinc-300/85">
              The last {DATA.windowDays} days of Tulsa construction activity, pulled directly from
              the City of Tulsa Self-Service Portal. Every contact below is real, every email and
              phone is on the public record. This is what a Vantage subscriber sees Monday morning.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Source: {DATA.source}
              </span>
              <span>Fetched {fetchedLabel}</span>
              <span>{DATA.totalCandidates} candidates scanned</span>
              <span>{withEmail}/{DATA.enrichedCount} have email</span>
              <span>{withPhone}/{DATA.enrichedCount} have phone</span>
            </div>
          </header>

          <div className="space-y-3">
            {DATA.permits.map((p) => (
              <PermitCard key={p.caseId} permit={p} />
            ))}
          </div>

          <footer className="mt-12 rounded-lg border border-white/10 bg-white/[0.02] p-5 text-[13px] leading-[1.6] text-zinc-400">
            <p className="mb-2 font-medium text-zinc-200">Methodology</p>
            <p>
              Vantage queries the City of Tulsa Self-Service Portal (Tyler EnerGov) directly, filters
              for high-value construction work (commercial buildings, residential new construction,
              additions), and enriches each record with the project's billing applicant and
              contractor contacts on file with the city. No re-keying, no public-records requests,
              no scraping a competitor. Updated daily; weekly digest delivered Monday at 6:00 AM CT.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function PermitCard({ permit: p }: { permit: Permit }) {
  const primary = pickPrimaryContact(p.contacts);
  const tier = tierForType(p.type);

  return (
    <article className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-5 transition-colors hover:border-white/15 hover:bg-white/[0.04]">
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em]">
            <TierBadge tier={tier} />
            <span className="text-zinc-500">{p.type}</span>
          </div>
          <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.015em] text-white">
            {p.address}
          </h2>
          {p.description ? (
            <p className="mt-1.5 text-[14px] leading-[1.5] text-zinc-300/85">
              {p.description}
            </p>
          ) : (
            <p className="mt-1.5 text-[13px] italic text-zinc-500">
              No description on file.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-zinc-400">
            <span>
              <span className="text-zinc-500">Permit</span>{' '}
              <span className="font-mono text-zinc-300">{p.permitNumber}</span>
            </span>
            <span>
              <span className="text-zinc-500">Applied</span> {formatDate(p.appliedDate)}
            </span>
            {p.parcel && (
              <span>
                <span className="text-zinc-500">Parcel</span>{' '}
                <span className="font-mono text-zinc-400">{p.parcel}</span>
              </span>
            )}
            <span className="text-zinc-500">{p.status}</span>
          </div>
        </div>

        <div className="lg:border-l lg:border-white/10 lg:pl-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Decision-maker contact
          </p>
          {primary ? (
            <div className="mt-2">
              <p className="text-[15px] font-semibold text-white">
                {primary.firstName} {primary.lastName}
                {primary.role && (
                  <span className="ml-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-amber-300/80">
                    {primary.role}
                  </span>
                )}
              </p>
              {primary.company && (
                <p className="text-[13px] text-zinc-300/90">{primary.company}</p>
              )}
              <div className="mt-2 space-y-1 text-[13px]">
                {primary.email && (
                  <a
                    href={`mailto:${primary.email}`}
                    className="block truncate text-amber-200 hover:text-amber-100"
                  >
                    {primary.email}
                  </a>
                )}
                {primary.phone && (
                  <a
                    href={`tel:${primary.phone.replace(/\D/g, '')}`}
                    className="block text-zinc-300 hover:text-white"
                  >
                    {formatPhone(primary.phone)}
                  </a>
                )}
              </div>
              {p.contacts.length > 1 && (
                <p className="mt-2 text-[11px] text-zinc-500">
                  +{p.contacts.length - 1} additional {p.contacts.length === 2 ? 'contact' : 'contacts'} on the permit
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[13px] italic text-zinc-500">No contact on file.</p>
          )}
          <a
            href={p.portalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-[11px] text-zinc-500 hover:text-zinc-300"
          >
            View on city portal →
          </a>
        </div>
      </div>
    </article>
  );
}

function TierBadge({ tier }: { tier: 'commercial' | 'residential' | 'other' }) {
  const map = {
    commercial: { label: 'Commercial', color: 'text-amber-200 bg-amber-500/10 border-amber-400/30' },
    residential: { label: 'Residential', color: 'text-sky-200 bg-sky-500/10 border-sky-400/30' },
    other: { label: 'Other', color: 'text-zinc-300 bg-white/5 border-white/10' },
  } as const;
  const t = map[tier];
  return (
    <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${t.color}`}>
      {t.label}
    </span>
  );
}

function tierForType(type: string): 'commercial' | 'residential' | 'other' {
  const t = type.toLowerCase();
  if (t.includes('commercial')) return 'commercial';
  if (t.includes('residential')) return 'residential';
  return 'other';
}
