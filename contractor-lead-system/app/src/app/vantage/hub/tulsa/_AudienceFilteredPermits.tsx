'use client';

import { useMemo, useState } from 'react';
import {
  ALL_AUDIENCES_ID,
  AUDIENCES,
  AUDIENCES_BY_CATEGORY,
  AUDIENCES_BY_ID,
  CATEGORY_LABELS,
  permitMatchesAudience,
  renderOutreachEmail,
  type Audience,
  type AudienceCategory,
} from '@/data/audiences';

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

const CATEGORY_ORDER: AudienceCategory[] = ['lender', 'title', 'broker', 'developer'];

export default function AudienceFilteredPermits({ permits }: { permits: Permit[] }) {
  const [selectedId, setSelectedId] = useState<string>(ALL_AUDIENCES_ID);
  const selectedAudience: Audience | null =
    selectedId === ALL_AUDIENCES_ID ? null : AUDIENCES_BY_ID[selectedId] || null;

  const filtered = useMemo(() => {
    if (!selectedAudience) return permits;
    return permits.filter((p) =>
      permitMatchesAudience({ type: p.type, valuation: p.valuation }, selectedAudience),
    );
  }, [permits, selectedAudience]);

  // Counts per audience for the pill badges
  const countsByAudience = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of AUDIENCES) {
      counts[a.id] = permits.filter((p) =>
        permitMatchesAudience({ type: p.type, valuation: p.valuation }, a),
      ).length;
    }
    return counts;
  }, [permits]);

  return (
    <>
      {/* Audience selector */}
      <div className="mb-8 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Filter by audience
          </p>
          <p className="text-[11px] text-zinc-500">
            {selectedAudience
              ? `${filtered.length} permit${filtered.length === 1 ? '' : 's'} match — ${selectedAudience.label}`
              : `Showing all ${permits.length} permits`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedId(ALL_AUDIENCES_ID)}
          className={`mb-3 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
            selectedId === ALL_AUDIENCES_ID
              ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
              : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:text-white'
          }`}
        >
          All audiences
          <span className="text-[10.5px] text-zinc-500">{permits.length}</span>
        </button>

        <div className="space-y-2.5">
          {CATEGORY_ORDER.map((cat) => {
            const audiencesInCat = AUDIENCES_BY_CATEGORY[cat];
            if (!audiencesInCat?.length) return null;
            return (
              <div key={cat} className="flex flex-wrap items-center gap-2">
                <span className="w-[110px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  {CATEGORY_LABELS[cat]}
                </span>
                {audiencesInCat.map((a) => {
                  const c = countsByAudience[a.id] || 0;
                  const selected = selectedId === a.id;
                  const dim = c === 0 && !selected;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      disabled={c === 0}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                        selected
                          ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                          : dim
                            ? 'border-white/5 bg-transparent text-zinc-600'
                            : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {a.shortLabel}
                      <span className="text-[10px] text-zinc-500">{c}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {selectedAudience && (
          <div className="mt-4 border-t border-white/5 pt-3">
            <p className="text-[12px] text-zinc-300">{selectedAudience.buyerDescription}</p>
            <p className="mt-1 text-[11.5px] text-zinc-500">
              <span className="font-medium text-amber-300/80">Why this matters:</span>{' '}
              {selectedAudience.signalAngle}
            </p>
          </div>
        )}
      </div>

      {/* Filtered permit list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-[14px] text-zinc-300">
            No permits in the last 14 days match the {selectedAudience?.label} filter.
          </p>
          <p className="mt-1 text-[12px] text-zinc-500">
            This audience tracks larger or different work — check back next week or pick another audience above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <PermitCard key={p.caseId} permit={p} audience={selectedAudience} />
          ))}
        </div>
      )}
    </>
  );
}

function PermitCard({ permit: p, audience }: { permit: Permit; audience: Audience | null }) {
  const [showEmail, setShowEmail] = useState(false);
  const primary = pickPrimaryContact(p.contacts, audience?.primaryContactRole);
  const tier = tierForType(p.type);

  // Compute why-now date when audience is selected
  const whyNowDate = audience
    ? new Date(new Date(p.appliedDate).getTime() + audience.whyNowWeek * 7 * 24 * 3600 * 1000)
    : null;

  // Render outreach email if audience selected
  const outreach = audience
    ? renderOutreachEmail(audience, {
        type: p.type,
        address: p.address,
        appliedDate: p.appliedDate,
        firstName: primary?.firstName,
        valuation: p.valuation,
      })
    : null;

  return (
    <article className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-5 transition-colors hover:border-white/15 hover:bg-white/[0.04]">
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em]">
            <TierBadge tier={tier} />
            <span className="text-zinc-500">{p.type}</span>
            {p.valuation && p.valuation > 0 && (
              <span className="ml-auto rounded-sm border border-emerald-400/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                {formatMoney(p.valuation)}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.015em] text-white">
            {p.address}
          </h2>
          {p.description ? (
            <p className="mt-1.5 text-[14px] leading-[1.5] text-zinc-300/85">{p.description}</p>
          ) : (
            <p className="mt-1.5 text-[13px] italic text-zinc-500">No description on file.</p>
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

          {audience && whyNowDate && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-400/25 bg-amber-500/[0.06] px-2.5 py-1.5">
              <svg className="h-3.5 w-3.5 text-amber-300/90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 4.5V8l2.25 1.5" />
              </svg>
              <span className="text-[11.5px] text-amber-100/95">
                <span className="font-semibold">{audience.shortLabel} contact window:</span>{' '}
                {audience.whyNowLabel} · target send by{' '}
                <span className="font-mono text-amber-200">
                  {formatDate(whyNowDate.toISOString())}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="lg:border-l lg:border-white/10 lg:pl-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Sponsor / decision-maker
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
                  +{p.contacts.length - 1} additional{' '}
                  {p.contacts.length === 2 ? 'contact' : 'contacts'} on the permit
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

      {/* Per-audience outreach draft (only shown when an audience is selected) */}
      {audience && outreach && primary?.email && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setShowEmail((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-zinc-400 hover:text-zinc-200">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="12" height="10" rx="1" />
                <path d="M2 5l6 4 6-4" />
              </svg>
              Sample outreach email — {audience.shortLabel}
            </span>
            <span className="text-[11px] text-zinc-500">{showEmail ? 'Hide' : 'Show'}</span>
          </button>
          {showEmail && (
            <div className="mt-3 rounded-md border border-white/10 bg-black/30 p-4 text-[13px] leading-[1.55] text-zinc-300">
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Subject</p>
              <p className="mt-1 text-zinc-100">{outreach.subject}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-zinc-500">Body</p>
              <p className="mt-1 whitespace-pre-line text-zinc-200">{outreach.body}</p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href={`mailto:${primary.email}?subject=${encodeURIComponent(outreach.subject)}&body=${encodeURIComponent(outreach.body)}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-[12px] font-medium text-amber-100 hover:bg-amber-500/15"
                >
                  Open in mail client
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(`${outreach.subject}\n\n${outreach.body}`)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-zinc-300 hover:border-white/20 hover:text-white"
                >
                  Copy to clipboard
                </button>
                <span className="text-[11px] text-zinc-500">
                  Tailored to {audience.shortLabel} · personalize before sending
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatPhone(p: string | null) {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith('1'))
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return p;
}
function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
function pickPrimaryContact(contacts: Contact[], preferredRole?: 'Applicant' | 'Contractor'): Contact | null {
  const byRole = (role: string) =>
    contacts.find((c) => c.role?.toLowerCase() === role.toLowerCase() && (c.email || c.phone));
  if (preferredRole) {
    const preferred = byRole(preferredRole);
    if (preferred) return preferred;
  }
  // Fallback chain: Applicant > Contractor > anyone-with-contact
  return byRole('Applicant') || byRole('Contractor') || contacts.find((c) => c.email || c.phone) || contacts[0] || null;
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
