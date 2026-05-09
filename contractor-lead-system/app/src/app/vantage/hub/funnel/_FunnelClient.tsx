'use client';

import { useEffect, useState } from 'react';

type Stage = 'cold' | 'replied' | 'demo' | 'verbal' | 'customer' | 'lost';
type Prospect = { id: string; stage: Stage; metro: string; segment: string };
type HubState = { prospects: Prospect[] };

const STORAGE_KEY = 'vantage-hub-state-v1';

const TARGETS = {
  weekly_emails: 100,
  reply_rate: 0.07,
  demo_rate: 0.5,
  close_rate: 0.3,
  starter_arpu: 149,
};

export default function FunnelClient() {
  const [state, setState] = useState<HubState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HubState;
        if (parsed && Array.isArray(parsed.prospects)) {
          setState(parsed);
        }
      }
    } catch { /* ignore */ }
    if (!state) setState({ prospects: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute when localStorage changes (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!state) {
    return <div className="text-sm text-zinc-500">Loading pipeline...</div>;
  }

  const counts = countByStage(state.prospects);
  const total = state.prospects.length || 1;
  const customers = counts.customer;
  const verbal = counts.verbal;
  const demo = counts.demo;
  const replied = counts.replied + counts.demo + counts.verbal + counts.customer;
  const cold = counts.cold;

  const conv = {
    coldToReplied: total ? replied / total : 0,
    repliedToDemo: replied ? (counts.demo + counts.verbal + counts.customer) / replied : 0,
    demoToVerbal: counts.demo + counts.verbal + counts.customer
      ? (counts.verbal + counts.customer) / (counts.demo + counts.verbal + counts.customer)
      : 0,
    verbalToCustomer: counts.verbal + counts.customer
      ? customers / (counts.verbal + counts.customer)
      : 0,
  };

  const mrr = customers * TARGETS.starter_arpu;

  return (
    <div className="space-y-8">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pipeline total" value={total.toString()} />
        <Stat label="Replied / Active" value={replied.toString()} />
        <Stat label="Verbal commits" value={verbal.toString()} accent={verbal >= 3} />
        <Stat label="Customers · MRR" value={`${customers} · $${mrr.toLocaleString()}`} accent={customers >= 1} />
      </div>

      {/* Funnel visualization */}
      <div className="vantage-card rounded-2xl p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Funnel — current state
        </div>
        <div className="mt-5 space-y-3">
          <FunnelRow label="Cold" count={cold} of={total} />
          <FunnelRow label="Replied" count={replied} of={total} />
          <FunnelRow label="Demo booked" count={counts.demo + counts.verbal + counts.customer} of={total} />
          <FunnelRow label="Verbal commit" count={counts.verbal + counts.customer} of={total} />
          <FunnelRow label="Customer" count={customers} of={total} accent />
        </div>
      </div>

      {/* Conversion rates */}
      <div className="grid gap-4 lg:grid-cols-4">
        <ConvCard
          label="Cold → Replied"
          actual={conv.coldToReplied}
          target={TARGETS.reply_rate}
          help="Lemlist / Mailshake B2B benchmarks: 5–9% is the working range"
        />
        <ConvCard
          label="Replied → Demo"
          actual={conv.repliedToDemo}
          target={TARGETS.demo_rate}
          help="50% means our reply triage is converting; below 30% means we're attracting wrong-fit replies"
        />
        <ConvCard
          label="Demo → Verbal"
          actual={conv.demoToVerbal}
          target={TARGETS.close_rate}
          help="30% is solid for SMB B2B (SaaStr benchmark). Below 20% means qualification or pricing is off"
        />
        <ConvCard
          label="Verbal → Customer"
          actual={conv.verbalToCustomer}
          target={0.7}
          help="If verbal commits aren't converting to paid, the trial flow or onboarding has a problem"
        />
      </div>

      {/* Targets card */}
      <div className="vantage-card rounded-2xl p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Pace targets — to hit $1,500 MRR by day 90
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Pace label="Outbound emails / week" target={`${TARGETS.weekly_emails}+`} note="20/day × 5 days, Madison primary sender" />
          <Pace label="Reply rate" target={`${(TARGETS.reply_rate * 100).toFixed(0)}%+`} note="If <3%, fix subject + body before sending more" />
          <Pace label="Demos / week" target="3–5" note="Filter aggressively — only qualified prospects book" />
          <Pace label="Verbal commits / week" target="1–2" note="One per week sustained = 10 customers by day 90" />
          <Pace label="Customers / month" target="3–4" note="Conservative pace; one good week can add 5+" />
          <Pace label="MRR by day 90" target="$1,500" note="10 customers × ~$149 average ARPU" />
        </div>
      </div>
    </div>
  );
}

function countByStage(prospects: Prospect[]) {
  const c: Record<Stage, number> = {
    cold: 0, replied: 0, demo: 0, verbal: 0, customer: 0, lost: 0,
  };
  prospects.forEach((p) => { c[p.stage] = (c[p.stage] ?? 0) + 1; });
  return c;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="vantage-card rounded-xl px-5 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums tracking-[-0.02em] ${accent ? 'text-amber-300' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function FunnelRow({
  label,
  count,
  of,
  accent,
}: {
  label: string;
  count: number;
  of: number;
  accent?: boolean;
}) {
  const pct = of ? (count / of) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-zinc-300/85">{label}</span>
        <span className="font-mono tabular-nums text-zinc-300/85">
          {count} <span className="text-zinc-600">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            accent
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              : 'bg-gradient-to-r from-amber-400 to-amber-500/70'
          }`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
}

function ConvCard({
  label,
  actual,
  target,
  help,
}: {
  label: string;
  actual: number;
  target: number;
  help: string;
}) {
  const onPace = actual >= target * 0.85;
  return (
    <div className="vantage-card rounded-xl p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl font-semibold tabular-nums ${onPace ? 'text-emerald-300' : 'text-white'}`}>
          {(actual * 100).toFixed(1)}%
        </span>
        <span className="text-[11px] text-zinc-500">vs. {(target * 100).toFixed(0)}% target</span>
      </div>
      <p className="mt-2 text-[12px] leading-[1.5] text-zinc-400">{help}</p>
    </div>
  );
}

function Pace({ label, target, note }: { label: string; target: string; note: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-amber-300">{target}</div>
      <p className="mt-1 text-[12px] leading-[1.5] text-zinc-400">{note}</p>
    </div>
  );
}
