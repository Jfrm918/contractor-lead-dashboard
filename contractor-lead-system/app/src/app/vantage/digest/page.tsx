/* ============================================================
   Vantage — sample Monday digest
   Liquid-glass surfaces, amber-on-midnight palette, no AI
   email-draft gimmicks.
   ============================================================ */

import Link from 'next/link';

export default function DigestPreview() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <Atmosphere />
      <div className="relative z-10">
        <PreviewBar />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <div className="glass-frosted glass-textured overflow-hidden">
            <span className="glass-grain" />
            <div className="relative z-10">
              <Envelope />
              <Opener />
              <Highlights />
              <FullTable />
              <Stats />
              <EmailFooter />
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-zinc-500">
            Sample digest · delivered every Monday at 6:00am local
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Atmospheric background ---------- */
function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(6,9,16,0.55) 0%, rgba(6,9,16,0.30) 28%, rgba(6,9,16,0.55) 58%, rgba(6,9,16,0.92) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 78% -5%, rgba(251,191,36,0.06) 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 50% at 5% 60%, rgba(99,102,241,0.04) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '180px 180px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 45%, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}

/* ---------- Preview chrome ---------- */
function PreviewBar() {
  return (
    <div className="glass-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm">
        <Link href="/vantage" className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8H3M7 4 3 8l4 4" />
          </svg>
          Back to Vantage
        </Link>
        <span className="text-xs text-zinc-500">Sample digest preview</span>
      </div>
    </div>
  );
}

/* ---------- Email envelope ---------- */
function Envelope() {
  return (
    <div className="border-b border-white/[0.06] px-6 py-5 sm:px-10">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-xs font-semibold text-[#1a1306] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_2px_6px_rgba(251,191,36,0.25)]">
          AD
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">
            <span className="font-medium text-white">Madison @ Vantage</span>
            <span className="ml-2 text-zinc-500">&lt;madison@vantageco.io&gt;</span>
          </div>
          <div className="text-xs text-zinc-500">to you · Mon, May 4 · 6:00 AM CDT</div>
        </div>
      </div>
      <div className="mt-5">
        <div className="text-xl font-semibold tracking-tight text-white">
          47 new permits in Tulsa — week of May 4
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span>$38.2M total project value</span>
          <span>·</span>
          <span>11 industrial</span>
          <span>·</span>
          <span>18 commercial</span>
          <span>·</span>
          <span>18 multi-family</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Opener ---------- */
function Opener() {
  return (
    <div className="border-b border-white/[0.04] px-6 py-8 text-[15px] leading-relaxed text-zinc-300 sm:px-10">
      <p>
        Hey — Madison here. Three projects worth your attention this week.{' '}
        <span className="font-medium text-white">Crossland Construction</span> filed three
        commercial permits in five days, and there's a 24,800 sf warehouse on Mingo Rd that's
        likely to move quickly. Top three are below, full table at the bottom.
      </p>
      <p className="mt-4 text-zinc-500">— Madison</p>
    </div>
  );
}

/* ---------- Top 3 highlights ---------- */
type Stakeholder = { role: string; name: string; contact?: string };
type GCStat = { label: string; value: string };

function Highlights() {
  const cards: Array<{
    tag: string;
    title: string;
    address: string;
    type: string;
    gc: string;
    value: string;
    filed: string;
    contactName: string;
    contactTitle: string;
    contactEmail: string;
    contactPhone: string;
    stakeholders: Stakeholder[];
    gcStats: GCStat[];
  }> = [
    {
      tag: 'TUL-2026-04832',
      title: '24,800 sf warehouse',
      address: '3104 N Mingo Rd · Tulsa, OK',
      type: 'Industrial',
      gc: 'Crossland Construction',
      value: '$2.4M – $3.2M',
      filed: 'Apr 28, 2026',
      contactName: 'Mike Petrowski',
      contactTitle: 'Project Manager',
      contactEmail: 'mpetrowski@crossland.com',
      contactPhone: '(918) 555-0142',
      stakeholders: [
        { role: 'Owner', name: 'Mingo Industrial LLC' },
        { role: 'Architect', name: 'Bockus Payne Architects' },
        { role: 'Structural eng.', name: 'Wallace Engineering' },
      ],
      gcStats: [
        { label: '90-day permit volume', value: '11 commercial' },
        { label: 'Avg project value', value: '$2.8M' },
        { label: 'Typical sub award', value: 'Week 3–4 of 12' },
      ],
    },
    {
      tag: 'TUL-2026-04829',
      title: '128-unit multi-family complex',
      address: '8420 E 71st St · Tulsa, OK',
      type: 'Multi-family',
      gc: 'Manhattan Construction',
      value: '$18M – $22M',
      filed: 'Apr 28, 2026',
      contactName: 'Sarah Chen',
      contactTitle: 'Senior Project Manager',
      contactEmail: 'schen@manhattanco.com',
      contactPhone: '(918) 555-0218',
      stakeholders: [
        { role: 'Owner', name: '71st Street Partners LP' },
        { role: 'Architect', name: 'TSP Architects' },
        { role: 'MEP eng.', name: 'Wallace Engineering' },
      ],
      gcStats: [
        { label: '12-mo multi-family', value: '7 projects' },
        { label: 'Avg project value', value: '$14.6M' },
        { label: 'Typical mech award', value: 'Week 6–8' },
      ],
    },
    {
      tag: 'TUL-2026-04841',
      title: 'Self-storage facility · 3 buildings',
      address: '11200 S Memorial Dr · Tulsa, OK',
      type: 'Commercial',
      gc: 'BL Harbert International',
      value: '$4.1M – $5.5M',
      filed: 'Apr 29, 2026',
      contactName: 'Dan Whitcomb',
      contactTitle: 'Project Manager',
      contactEmail: 'dwhitcomb@blharbert.com',
      contactPhone: '(918) 555-0463',
      stakeholders: [
        { role: 'Owner', name: 'Public Storage Operating Co.' },
        { role: 'Architect', name: 'ARCO Design/Build' },
        { role: 'Civil eng.', name: 'Caleb Robinson PE' },
      ],
      gcStats: [
        { label: '24-mo OK self-storage', value: '4 projects' },
        { label: 'Avg project value', value: '$4.7M' },
        { label: 'Standard config', value: '3-bldg, 540 units' },
      ],
    },
  ];

  return (
    <div className="border-b border-white/[0.04] px-6 py-8 sm:px-10">
      <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Top three this week
      </div>
      <div className="space-y-4">
        {cards.map((c) => (
          <article
            key={c.tag}
            className="overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/[0.04] px-5 py-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                  Permit · {c.tag}
                </div>
                <div className="mt-1.5 text-base font-semibold text-white">{c.title}</div>
                <div className="mt-0.5 text-sm text-zinc-500">{c.address}</div>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {c.type}
              </span>
            </header>

            <div className="grid gap-6 px-5 py-5 sm:grid-cols-2">
              <dl className="space-y-3 text-sm">
                <Field label="Builder on file" value={c.gc} />
                <Field label="Filed" value={c.filed} />
                <Field label="Estimated value" value={c.value} bold />
              </dl>
              <dl className="space-y-3 text-sm">
                <Field label="Contact" value={`${c.contactName} · ${c.contactTitle}`} />
                <Field label="Email" value={c.contactEmail} mono />
                <Field label="Phone" value={c.contactPhone} mono />
              </dl>
            </div>

            <div className="border-t border-white/[0.04] px-5 py-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Stakeholders on file
                </div>
                <span className="text-[11px] text-zinc-600">From permit document</span>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                {c.stakeholders.map((s) => (
                  <div key={s.role}>
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      {s.role}
                    </dt>
                    <dd className="mt-0.5 text-sm text-zinc-100">{s.name}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border-t border-white/[0.04] bg-white/[0.015]">
              <div className="px-5 py-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    GC pattern · {c.gc.split(' ')[0]}
                  </div>
                  <span className="text-[11px] text-zinc-600">From public records</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {c.gcStats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-500">
                        {s.label}
                      </div>
                      <div className="mt-0.5 text-[13px] font-medium tabular-nums text-zinc-100">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
              <a
                href="#"
                className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                Open full record →
              </a>
              <a
                href="#"
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
              >
                View on city portal
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd
        className={[
          'mt-0.5 text-zinc-100',
          mono ? 'font-mono text-[13px]' : '',
          bold ? 'font-semibold tabular-nums' : '',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}

/* ---------- Full table ---------- */
function FullTable() {
  const rows = [
    ['TUL-2026-04832', 'Warehouse — 24.8k sf', 'N Mingo Rd', 'Crossland', '$2.4M', 'Industrial', 'Apr 28'],
    ['TUL-2026-04829', 'Multi-family — 128u', 'E 71st St', 'Manhattan', '$18M', 'Multi-family', 'Apr 28'],
    ['TUL-2026-04841', 'Self-storage — 3 bldg', 'S Memorial', 'BL Harbert', '$4.1M', 'Commercial', 'Apr 29'],
    ['TUL-2026-04847', 'Restaurant TI — Chick-fil-A', 'S Yale Ave', 'Wallace', '$680K', 'Commercial', 'Apr 29'],
    ['TUL-2026-04851', 'Office reno — 12k sf', 'E 41st St', 'Flintco', '$1.1M', 'Commercial', 'Apr 30'],
    ['TUL-2026-04863', 'School addition', 'E 81st St', 'Manhattan', '$3.8M', 'Institutional', 'Apr 30'],
    ['TUL-2026-04871', 'Medical office', 'S Lewis Ave', 'Crossland', '$2.2M', 'Commercial', 'May 1'],
    ['TUL-2026-04882', 'Apartment — 64u', 'E Pine St', 'Murray Co', '$9.6M', 'Multi-family', 'May 1'],
    ['TUL-2026-04895', 'Industrial shop', 'W 21st St', 'Crossland', '$890K', 'Industrial', 'May 2'],
    ['TUL-2026-04903', 'Retail strip — 8 bay', 'S Memorial', 'Wallace', '$1.4M', 'Commercial', 'May 2'],
  ];

  return (
    <div className="border-b border-white/[0.04] px-6 py-8 sm:px-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            All 47 permits
          </div>
          <div className="mt-1 text-sm text-zinc-500">Sorted by filing date</div>
        </div>
        <a
          href="#"
          className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
        >
          Open full table →
        </a>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/20 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-2.5 text-left">Permit</th>
              <th className="px-4 py-2.5 text-left">Project</th>
              <th className="hidden px-4 py-2.5 text-left sm:table-cell">Location</th>
              <th className="px-4 py-2.5 text-left">GC</th>
              <th className="px-4 py-2.5 text-right">Value</th>
              <th className="hidden px-4 py-2.5 text-left md:table-cell">Type</th>
              <th className="hidden px-4 py-2.5 text-left sm:table-cell">Filed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((r) => (
              <tr key={r[0]} className="transition-colors hover:bg-white/[0.025]">
                <td className="px-4 py-2.5 font-mono text-[11px] text-amber-400">{r[0]}</td>
                <td className="px-4 py-2.5 text-zinc-100">{r[1]}</td>
                <td className="hidden px-4 py-2.5 text-zinc-400 sm:table-cell">{r[2]}</td>
                <td className="px-4 py-2.5 text-zinc-400">{r[3]}</td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums text-zinc-100">
                  {r[4]}
                </td>
                <td className="hidden px-4 py-2.5 text-zinc-400 md:table-cell">{r[5]}</td>
                <td className="hidden px-4 py-2.5 text-zinc-500 sm:table-cell">{r[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-500">
        + 37 more permits in the portal
      </p>
    </div>
  );
}

/* ---------- Week-over-week stats ---------- */
function Stats() {
  return (
    <div className="grid grid-cols-3 divide-x divide-white/[0.04] border-b border-white/[0.04] text-center">
      {[
        ['47', 'permits this week'],
        ['+9%', 'vs. 4-week average'],
        ['$38.2M', 'total project value'],
      ].map(([v, l]) => (
        <div key={l} className="px-4 py-6">
          <div className="text-2xl font-semibold tracking-tight tabular-nums text-white">{v}</div>
          <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{l}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Footer ---------- */
function EmailFooter() {
  return (
    <div className="px-6 py-7 text-center text-xs text-zinc-500 sm:px-10">
      <div className="font-semibold text-zinc-300">Vantage</div>
      <div className="mt-1">Permit intelligence for the people who build things.</div>
      <div className="mt-5 flex justify-center gap-5">
        <a href="#" className="hover:text-white">Open portal</a>
        <a href="#" className="hover:text-white">Manage subscription</a>
        <a href="#" className="hover:text-white">Unsubscribe</a>
      </div>
    </div>
  );
}
