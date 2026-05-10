'use client';

import { useEffect, useState } from 'react';

type Decision = {
  id: string;
  date: string;
  title: string;
  reasoning: string;
  decidedBy: 'Jason' | 'Madison' | 'Both';
  category: 'Pricing' | 'Product' | 'Brand' | 'Strategy' | 'Hiring' | 'Process' | 'Other';
};

const STORAGE_KEY = 'vantage-decisions-v1';

const SEED: Decision[] = [
  {
    id: 'd10',
    date: '2026-05-10',
    title: 'Pivot Vantage to CRE capital/transaction intelligence',
    reasoning:
      'Stepdad market signal showed raw contractor permit feeds are saturated and price-anchored around raw lists. New ICP: commercial lenders, title/closing companies, CRE brokers, sponsors, and developers in Tulsa. Same permit/data engine, but positioned around origination, refi/take-out timing, future closings, lease-up, sponsor mapping, capital stack, and distress signals. Warm intro path is stronger through family lending/title/CRE relationships.',
    decidedBy: 'Jason',
    category: 'Strategy',
  },
  {
    id: 'd1',
    date: '2026-05-04',
    title: 'Greenlit Vantage as primary venture',
    reasoning:
      "Replaces 'passive revenue search.' BuiltWith does ~$22M ARR solo with this exact model (data subscription) — 90%+ margin, near-zero support, compounds via data archive + brand + SEO. Plays to our edge: human + always-on AI ops at solo-operator cost.",
    decidedBy: 'Jason',
    category: 'Strategy',
  },
  {
    id: 'd2',
    date: '2026-05-04',
    title: 'Brand name: Vantage',
    reasoning:
      'Picked Vantage over Bellwether, Plumb, Forepost, Daybreak, Cleared, Fulcrum after research. Reads as a finance/intel firm — confident, knowing, scales beyond Tulsa permits to other verticals. Domain target: vantageco.io (held until product proven).',
    decidedBy: 'Jason',
    category: 'Brand',
  },
  {
    id: 'd3',
    date: '2026-05-04',
    title: 'Madison joins as co-founder, owns customer ops + sender voice',
    reasoning:
      "Female senders show ~30% higher reply rate in B2B (Mailshake / Lemlist data). Madison handles outbound, customer relationships, social. Jason builds + closes Pro-tier. Athena handles 24/7 ops.",
    decidedBy: 'Both',
    category: 'Hiring',
  },
  {
    id: 'd4',
    date: '2026-05-04',
    title: 'First 4 metros: Tulsa, OKC, Madison (WI), Dallas',
    reasoning:
      "Tulsa = home market, Jason's industry knowledge. OKC = adjacent, easy expansion. Madison (WI) = hat tip + mid-size metro test. Dallas = commercial volume validation. Each metro hand-launched.",
    decidedBy: 'Both',
    category: 'Strategy',
  },
  {
    id: 'd5',
    date: '2026-05-04',
    title: 'Pricing: $149 / $299 / $499',
    reasoning:
      'Starter below the $200 friction line for solo decision-makers. Growth at $299 includes CRM webhook (the upgrade trigger). Pro at $499 includes API + unlimited metros. Math: 1 closed deal pays back 3+ years at any tier (NIA / NAR commission benchmarks).',
    decidedBy: 'Jason',
    category: 'Pricing',
  },
  {
    id: 'd6',
    date: '2026-05-05',
    title: 'Killed AI-drafted email feature from product',
    reasoning:
      "Looked like AI slop and cheapened the brand. Buyers paying for verified data don't want an AI to write their outreach for them — they want raw intelligence. Replaced with stakeholder panel (owner / architect / engineer from permit doc) + GC pattern strip.",
    decidedBy: 'Jason',
    category: 'Product',
  },
  {
    id: 'd7',
    date: '2026-05-05',
    title: 'Each preview tab gets its own URL (/vantage/preview/digest, /portal, /webhook)',
    reasoning:
      "Tabs that swap content inline felt fake. Real navigation (Link to a route per tab) gives each surface its own canonical URL — shareable, bookmarkable, more credible.",
    decidedBy: 'Jason',
    category: 'Product',
  },
  {
    id: 'd9',
    date: '2026-05-06',
    title: 'Raw contractor permit feeds are not the wedge',
    reasoning:
      'A Tulsa contractor reference showed raw weekly permit feeds can be price-anchored around ~$25/week. Decision: do not chase raw contractor workflows. Use the lesson as competitor research only, then reposition Vantage above raw permit lists for CRE buyers who can monetize one signal through origination, refi/take-out, title closing, or brokerage fees.',
    decidedBy: 'Jason',
    category: 'Strategy',
  },
  {
    id: 'd8',
    date: '2026-05-05',
    title: 'All Vantage content must be data-backed (FACT vs THESIS labels)',
    reasoning:
      "We're a credibility play. Fabricated stats kill trust on first contact. Every claim on hub/landing/pitch must cite a source OR be labeled THESIS with reasoning shown. Locked into core operating rules.",
    decidedBy: 'Jason',
    category: 'Process',
  },
];

export default function DecisionsClient() {
  const [decisions, setDecisions] = useState<Decision[]>(SEED);
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Partial<Decision>>({
    date: new Date().toISOString().slice(0, 10),
    decidedBy: 'Both',
    category: 'Strategy',
  });
  const [filter, setFilter] = useState<Decision['category'] | 'all'>('all');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Decision[];
        if (Array.isArray(parsed)) setDecisions(parsed);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
    } catch { /* ignore */ }
  }, [decisions, hydrated]);

  const submit = () => {
    if (!draft.title || !draft.reasoning) return;
    const next: Decision = {
      id: `d-${Date.now()}`,
      date: draft.date ?? new Date().toISOString().slice(0, 10),
      title: draft.title,
      reasoning: draft.reasoning,
      decidedBy: (draft.decidedBy as Decision['decidedBy']) ?? 'Both',
      category: (draft.category as Decision['category']) ?? 'Strategy',
    };
    setDecisions([next, ...decisions]);
    setDraft({
      date: new Date().toISOString().slice(0, 10),
      decidedBy: 'Both',
      category: 'Strategy',
    });
    setShowForm(false);
  };

  const remove = (id: string) =>
    setDecisions(decisions.filter((d) => d.id !== id));

  const reset = () => setDecisions(SEED);

  const cats: (Decision['category'] | 'all')[] = [
    'all',
    'Pricing',
    'Product',
    'Brand',
    'Strategy',
    'Hiring',
    'Process',
    'Other',
  ];

  const filtered = filter === 'all' ? decisions : decisions.filter((d) => d.category === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`rounded border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
              filter === c
                ? 'border-amber-300/40 bg-amber-300/[0.10] text-amber-200'
                : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:text-white'
            }`}
          >
            {c === 'all' ? 'All' : c}
            <span className="ml-1 tabular-nums text-zinc-500">
              {c === 'all' ? decisions.length : decisions.filter((d) => d.category === c).length}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="vantage-cta-spring ml-auto rounded bg-white px-3 py-1.5 text-[12px] font-semibold text-black"
        >
          {showForm ? 'Close' : '+ Log decision'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[11px] text-zinc-500 hover:border-white/15 hover:text-zinc-200"
          title="Reset to seed"
        >
          Reset
        </button>
      </div>

      {showForm && (
        <div className="mt-4 grid gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 md:grid-cols-2">
          <div>
            <Label>Date</Label>
            <input
              type="date"
              value={draft.date ?? ''}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="mt-1 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-amber-300/40 focus:outline-none"
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              value={draft.category ?? 'Strategy'}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as Decision['category'] })}
              className="mt-1 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-amber-300/40 focus:outline-none"
            >
              {cats.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c} className="bg-[#0a0e18]">{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Decision title</Label>
            <input
              type="text"
              value={draft.title ?? ''}
              placeholder="e.g. Switched outbound from contractor leads to lender/title/broker CRE signals"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-amber-300/40 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Reasoning (the WHY — this is what we re-read in 6 months)</Label>
            <textarea
              rows={4}
              value={draft.reasoning ?? ''}
              placeholder="Data, observations, what we learned, what alternatives we considered..."
              onChange={(e) => setDraft({ ...draft, reasoning: e.target.value })}
              className="mt-1 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-amber-300/40 focus:outline-none"
            />
          </div>
          <div>
            <Label>Decided by</Label>
            <select
              value={draft.decidedBy ?? 'Both'}
              onChange={(e) => setDraft({ ...draft, decidedBy: e.target.value as Decision['decidedBy'] })}
              className="mt-1 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-amber-300/40 focus:outline-none"
            >
              <option value="Jason" className="bg-[#0a0e18]">Jason</option>
              <option value="Madison" className="bg-[#0a0e18]">Madison</option>
              <option value="Both" className="bg-[#0a0e18]">Both</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={submit}
              className="vantage-cta-spring rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300"
            >
              Log this decision
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.map((d) => (
          <article
            key={d.id}
            className="vantage-card rounded-xl p-5"
          >
            <header className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-[11.5px] tabular-nums text-amber-300">{d.date}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-300">
                  {d.category}
                </span>
                <span className="text-[11px] text-zinc-500">decided by {d.decidedBy}</span>
              </div>
              <button
                type="button"
                onClick={() => remove(d.id)}
                className="text-[11px] text-zinc-600 hover:text-red-300"
                title="Remove"
              >
                ×
              </button>
            </header>
            <h3 className="mt-2 text-[15.5px] font-semibold leading-[1.4] text-white">{d.title}</h3>
            <p className="mt-2 text-[13.5px] leading-[1.6] text-zinc-300/85">{d.reasoning}</p>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-5 py-10 text-center text-sm text-zinc-500">
            No decisions logged in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
      {children}
    </span>
  );
}
