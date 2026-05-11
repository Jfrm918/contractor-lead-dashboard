import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import permitsData from '@/data/tulsa-permits-live.json';
import AudienceFilteredPermits from './_AudienceFilteredPermits';

export const metadata = {
  title: 'Vantage — Tulsa commercial real estate signal',
  description:
    'Live Tulsa commercial construction permits with sponsor contacts — filtered for lenders, title companies, brokers, and developers.',
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

export default function TulsaLivePermits() {
  const fetchedAt = new Date(DATA.fetchedAt);
  const fetchedLabel = fetchedAt.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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
              Tulsa · live · commercial real estate signal
            </p>
            <h1 className="mt-2 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
              {DATA.enrichedCount} commercial permits, {withEmail} verified sponsor contacts.
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-[1.6] text-zinc-300/85">
              The last {DATA.windowDays} days of Tulsa commercial construction activity, pulled
              directly from the City of Tulsa Self-Service Portal. Filter the same dataset by
              audience — lenders see refinance &amp; construction-loan opportunities, title
              companies see future closings, brokers see leasing &amp; investment plays. Each gets
              the right outreach window and a draft email ready to send.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Source: {DATA.source}
              </span>
              <span>Fetched {fetchedLabel}</span>
              <span>{DATA.totalCandidates} candidates scanned</span>
              <span>
                {withEmail}/{DATA.enrichedCount} have email
              </span>
              <span>
                {withPhone}/{DATA.enrichedCount} have phone
              </span>
            </div>
          </header>

          <AudienceFilteredPermits permits={DATA.permits} />

          <footer className="mt-12 rounded-lg border border-white/10 bg-white/[0.02] p-5 text-[13px] leading-[1.6] text-zinc-400">
            <p className="mb-2 font-medium text-zinc-200">Methodology</p>
            <p>
              Vantage queries the City of Tulsa Self-Service Portal (Tyler EnerGov) directly,
              filters for commercial work above each audience&apos;s materiality threshold, and
              enriches every record with the sponsor (applicant) and contractor on file with the
              city. The same dataset feeds every audience — what changes per subscriber is the
              filter, the outreach timing, and the draft email tailored to their workflow
              (construction-to-perm financing, closing pipeline, leasing strategy, etc.). Updated
              daily; weekly digest delivered Monday at 6:00 AM CT.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
