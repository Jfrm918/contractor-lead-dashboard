/* Three product surfaces rendered as standalone components.
   Reused by the landing page teaser cards and by each
   /vantage/preview/* route. */

export function DigestPreview() {
  return (
    <div>
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3 text-sm">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-[10px] font-semibold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          AD
        </div>
        <div className="flex-1">
          <div className="text-zinc-100">
            <span className="font-medium">Madison @ Vantage</span>
            <span className="ml-2 text-zinc-500">madison@vantageco.io</span>
          </div>
          <div className="font-medium text-zinc-300">
            47 new permits in Tulsa — week of May 4
          </div>
        </div>
        <div className="text-xs text-zinc-500">Mon, 6:00 AM</div>
      </div>

      <div className="grid gap-8 px-6 py-8 lg:grid-cols-2 lg:px-10">
        <div className="space-y-4">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
              TUL-2026-04832
            </div>
            <div className="mt-2 font-semibold text-white">
              24,800 sf warehouse · 3104 N Mingo Rd
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-zinc-500">GC</dt>
              <dd className="text-zinc-100">Crossland Construction</dd>
              <dt className="text-zinc-500">Est. value</dt>
              <dd className="font-medium tabular-nums text-zinc-100">$2.4M – $3.2M</dd>
              <dt className="text-zinc-500">Filed</dt>
              <dd className="text-zinc-100">Apr 28, 2026</dd>
            </dl>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
              TUL-2026-04829
            </div>
            <div className="mt-2 font-semibold text-white">
              128-unit multi-family · 8420 E 71st St
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-zinc-500">GC</dt>
              <dd className="text-zinc-100">Manhattan Construction</dd>
              <dt className="text-zinc-500">Est. value</dt>
              <dd className="font-medium tabular-nums text-zinc-100">$18M – $22M</dd>
              <dt className="text-zinc-500">Filed</dt>
              <dd className="text-zinc-100">Apr 28, 2026</dd>
            </dl>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/20 backdrop-blur-sm">
          <div className="border-b border-white/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            All 47 permits · sorted by filing date
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              ['TUL-04832', 'Warehouse', 'Crossland', '$2.4M'],
              ['TUL-04829', 'Multi-family', 'Manhattan', '$18M'],
              ['TUL-04841', 'Self-storage', 'BL Harbert', '$4.1M'],
              ['TUL-04847', 'Restaurant TI', 'Wallace', '$680K'],
              ['TUL-04851', 'Office reno', 'Flintco', '$1.1M'],
              ['TUL-04863', 'School addition', 'Manhattan', '$3.8M'],
              ['TUL-04871', 'Medical office', 'Crossland', '$2.2M'],
              ['TUL-04882', 'Apartment 64u', 'Murray Co', '$9.6M'],
            ].map((r) => (
              <div
                key={r[0]}
                className="grid grid-cols-[80px,1fr,90px,64px] items-center gap-2 px-4 py-2 text-[13px]"
              >
                <span className="font-mono text-[11px] text-amber-400">{r[0]}</span>
                <span className="truncate text-zinc-100">{r[1]}</span>
                <span className="truncate text-zinc-500">{r[2]}</span>
                <span className="text-right font-medium tabular-nums text-zinc-100">{r[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortalPreview() {
  const stats = [
    { value: '47', label: 'New this week', trend: '+9%' },
    { value: '$38.2M', label: 'Total project value', trend: '+12%' },
    { value: '12', label: 'Matching your filters' },
  ] as const;
  const filters = [
    { key: 'Metro', value: 'Tulsa' },
    { key: 'Type', value: 'Industrial, Multi-family' },
    { key: 'Min value', value: '$500K' },
    { key: 'GC', value: 'Any' },
  ];

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Active filters
            </div>
            <dl className="mt-3 space-y-2.5 text-sm">
              {filters.map((f) => (
                <div key={f.key} className="flex items-baseline justify-between gap-3">
                  <dt className="text-zinc-500">{f.key}</dt>
                  <dd className="text-right text-zinc-100">{f.value}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              className="mt-4 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.06]"
            >
              Edit filters
            </button>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Saved searches
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {['Industrial · $1M+', 'Multi-family · 50+ units', 'Crossland projects'].map((s) => (
                <li
                  key={s}
                  className="flex items-center justify-between rounded px-2 py-1 text-zinc-300 transition-colors hover:bg-white/[0.03]"
                >
                  <span>{s}</span>
                  <span className="text-[11px] text-zinc-500">→</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  {s.label}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold tabular-nums tracking-tight text-white">
                    {s.value}
                  </span>
                  {'trend' in s && s.trend && (
                    <span className="text-[11px] font-medium text-emerald-300">{s.trend}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <span>Permits matching · sorted by value</span>
              <span className="font-mono normal-case tracking-normal text-zinc-600">
                Updated 11m ago
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                ['TUL-04829', 'Multi-family · 128u', 'Manhattan', '$18M', 'Multi-family'],
                ['TUL-04882', 'Apartment · 64u', 'Murray Co', '$9.6M', 'Multi-family'],
                ['TUL-04841', 'Self-storage', 'BL Harbert', '$4.1M', 'Industrial'],
                ['TUL-04863', 'School addition', 'Manhattan', '$3.8M', 'Institutional'],
                ['TUL-04832', 'Warehouse · 24.8k sf', 'Crossland', '$2.4M', 'Industrial'],
                ['TUL-04871', 'Medical office', 'Crossland', '$2.2M', 'Commercial'],
              ].map((r) => (
                <div
                  key={r[0]}
                  className="grid grid-cols-[80px,1fr,1fr,80px] items-center gap-2 px-4 py-2.5 text-[13px] transition-colors hover:bg-white/[0.025]"
                >
                  <span className="font-mono text-[11px] text-amber-400">{r[0]}</span>
                  <div>
                    <div className="text-zinc-100">{r[1]}</div>
                    <div className="text-[11px] text-zinc-500">{r[4]}</div>
                  </div>
                  <span className="text-zinc-400">{r[2]}</span>
                  <span className="text-right font-medium tabular-nums text-zinc-100">{r[3]}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2 text-[11px] text-zinc-500">
              <span>Showing 6 of 12 matches</span>
              <button className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-medium text-zinc-200 transition-colors hover:bg-white/[0.07]">
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WebhookPreview() {
  const json = `{
  "permit_id": "TUL-2026-04832",
  "city": "Tulsa, OK",
  "filed_at": "2026-04-28T00:00:00Z",
  "project": {
    "title": "24,800 sf warehouse",
    "address": "3104 N Mingo Rd",
    "type": "industrial",
    "estimated_value_min": 2400000,
    "estimated_value_max": 3200000
  },
  "general_contractor": {
    "name": "Crossland Construction",
    "permits_90d": 11,
    "avg_value_90d": 2800000
  },
  "primary_contact": {
    "name": "Mike Petrowski",
    "title": "Project Manager",
    "email": "mpetrowski@crossland.com",
    "phone": "+19185550142",
    "verified_at": "2026-05-01T14:22:00Z"
  },
  "stakeholders": [
    { "role": "owner", "name": "Mingo Industrial LLC" },
    { "role": "architect", "name": "Bockus Payne Architects" },
    { "role": "engineer", "name": "Wallace Engineering" }
  ]
}`;

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
        <div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Endpoints
            </div>
            <div className="mt-3 space-y-3">
              <div className="rounded border border-white/[0.06] bg-black/20 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 font-mono font-semibold text-emerald-300">
                    POST
                  </span>
                  <span className="font-mono text-zinc-300">https://hooks.your-crm.com/vantage</span>
                </div>
                <div className="mt-1.5 text-[11px] text-zinc-500">
                  Fires within 5 minutes of any new matching permit
                </div>
              </div>
              <div className="rounded border border-white/[0.06] bg-black/20 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-amber-400/15 px-1.5 py-0.5 font-mono font-semibold text-amber-300">
                    GET
                  </span>
                  <span className="font-mono text-zinc-300">api.vantageco.io/v1/permits</span>
                </div>
                <div className="mt-1.5 text-[11px] text-zinc-500">
                  Pull permits on demand · cursor-paginated
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-[11px]">
              {['HubSpot', 'Salesforce', 'Pipedrive', 'Zapier', 'Slack', 'Custom'].map((dest) => (
                <div
                  key={dest}
                  className="rounded border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-center text-zinc-300"
                >
                  {dest}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Sample payload · application/json</span>
            <span className="font-mono normal-case tracking-normal text-zinc-600">200 OK · 143ms</span>
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-zinc-200">
            <code>{json}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

/* Tab metadata shared across landing teasers and route nav */
export const PREVIEW_TABS = [
  {
    label: 'Monday digest',
    subtitle: 'The email',
    href: '/vantage/preview/digest',
    blurb:
      'A curated Monday email with the top three permits and a full sortable table of every new project this week.',
  },
  {
    label: 'Live portal',
    subtitle: 'The dashboard',
    href: '/vantage/preview/portal',
    blurb:
      'Filter, search, and export every permit in your metros. Saved searches, type filters, custom alerts, CSV export.',
  },
  {
    label: 'CRM webhook',
    subtitle: 'The integration',
    href: '/vantage/preview/webhook',
    blurb:
      'POST every new matching permit straight into HubSpot, Salesforce, or any endpoint you point at us. JSON payload included.',
  },
] as const;
