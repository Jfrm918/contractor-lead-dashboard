'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  GOALS_90D,
  LAUNCH_DATE,
  MISSION,
  PLAN_LENGTH_DAYS,
  SEED_ACTIONS,
  SEED_PROSPECTS,
} from './seed';
import {
  STAGE_LABEL,
  STAGE_ORDER,
  type Action,
  type Prospect,
  type Stage,
} from './types';

const STORAGE_KEY = 'vantage-hub-state-v1';

type HubState = {
  prospects: Prospect[];
  actions: Action[];
};

export default function HubClient() {
  const [state, setState] = useState<HubState>({
    prospects: SEED_PROSPECTS,
    actions: SEED_ACTIONS,
  });
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HubState;
        if (parsed.prospects && parsed.actions) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe localStorage hydration on mount
          setState(parsed);
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist on changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const updateProspect = (id: string, patch: Partial<Prospect>) =>
    setState((s) => ({
      ...s,
      prospects: s.prospects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const addProspect = (p: Prospect) =>
    setState((s) => ({ ...s, prospects: [p, ...s.prospects] }));

  const removeProspect = (id: string) =>
    setState((s) => ({ ...s, prospects: s.prospects.filter((p) => p.id !== id) }));

  const toggleAction = (id: string) =>
    setState((s) => ({
      ...s,
      actions: s.actions.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    }));

  const resetActions = () =>
    setState((s) => ({ ...s, actions: SEED_ACTIONS.map((a) => ({ ...a, done: false })) }));

  const stats = useMemo(() => computeStats(state), [state]);

  return (
    <div className="space-y-6">
      <StatsStrip stats={stats} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <Mission />
        <Goals stats={stats} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TodayPanel
          who="Madison"
          actions={state.actions.filter((a) => a.who === 'Madison')}
          onToggle={toggleAction}
        />
        <TodayPanel
          who="Jason"
          actions={state.actions.filter((a) => a.who === 'Jason')}
          onToggle={toggleAction}
          onReset={resetActions}
        />
      </div>
      <ProspectPipeline
        prospects={state.prospects}
        onUpdate={updateProspect}
        onAdd={addProspect}
        onRemove={removeProspect}
      />
    </div>
  );
}

/* ============================================================
   Stats strip
   ============================================================ */
function StatsStrip({
  stats,
}: {
  stats: ReturnType<typeof computeStats>;
}) {
  const items = [
    {
      label: 'Day of plan',
      value: `${stats.day} / ${PLAN_LENGTH_DAYS}`,
      tone: 'neutral' as const,
    },
    {
      label: 'Customers',
      value: `${stats.customers} / 10`,
      tone: stats.customers >= 5 ? 'good' : 'neutral',
    },
    {
      label: 'MRR',
      value: `$${stats.mrr.toLocaleString()}`,
      tone: stats.mrr >= 500 ? 'good' : 'neutral',
    },
    {
      label: 'Pipeline',
      value: stats.pipelineCount.toString(),
      tone: 'neutral' as const,
    },
    {
      label: 'Replied',
      value: stats.replied.toString(),
      tone: 'neutral' as const,
    },
    {
      label: 'Verbal commits',
      value: stats.verbal.toString(),
      tone: stats.verbal >= 5 ? 'good' : 'neutral',
    },
  ];
  return (
    <div className="vantage-card grid grid-cols-3 overflow-hidden rounded-2xl lg:grid-cols-6">
      {items.map((s) => (
        <div
          key={s.label}
          className="border-b border-r border-white/[0.05] px-5 py-5 last:border-r-0 lg:border-b-0"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {s.label}
          </div>
          <div
            className={`mt-1.5 text-2xl font-semibold tabular-nums tracking-[-0.02em] ${
              s.tone === 'good' ? 'text-amber-300' : 'text-white'
            }`}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Mission card
   ============================================================ */
function Mission() {
  return (
    <div className="vantage-card rounded-2xl p-7">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
        Mission
      </div>
      <p className="mt-3 text-balance text-[19px] font-medium leading-[1.45] tracking-[-0.01em] text-white">
        {MISSION}
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.05] pt-5">
        <Pillar title="Verified" body="Every contact bounce-tested before delivery." />
        <Pillar title="Fast" body="Fresh permits in your inbox by Monday 6am." />
        <Pillar title="Specific" body="Sponsor, value, loan/refi signal — not just an address." />
      </div>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </div>
      <p className="mt-1 text-[13px] leading-[1.5] text-zinc-300/85">{body}</p>
    </div>
  );
}

/* ============================================================
   90-day goals
   ============================================================ */
function Goals({ stats }: { stats: ReturnType<typeof computeStats> }) {
  return (
    <div className="vantage-card rounded-2xl p-7">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
          90-day goals
        </div>
        <div className="text-[11px] tabular-nums text-zinc-500">
          Week {Math.ceil(stats.day / 7)} of {Math.ceil(PLAN_LENGTH_DAYS / 7)}
        </div>
      </div>
      <ol className="mt-4 space-y-2.5">
        {GOALS_90D.map((g) => {
          const week = Math.ceil(stats.day / 7);
          const past = week > g.week;
          const current = week === g.week;
          return (
            <li
              key={g.label}
              className="flex items-baseline gap-3 text-[13.5px]"
            >
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  past ? 'text-emerald-300' : current ? 'text-amber-300' : 'text-zinc-600'
                }`}
              >
                W{String(g.week).padStart(2, '0')}
              </span>
              <span
                className={
                  past ? 'text-zinc-400 line-through decoration-zinc-700' : current ? 'text-white' : 'text-zinc-300/85'
                }
              >
                {g.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ============================================================
   Today panel — per-person actions
   ============================================================ */
function TodayPanel({
  who,
  actions,
  onToggle,
  onReset,
}: {
  who: 'Madison' | 'Jason';
  actions: Action[];
  onToggle: (id: string) => void;
  onReset?: () => void;
}) {
  const remaining = actions.filter((a) => !a.done).length;
  return (
    <div className="vantage-card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Today · {who}
          </div>
          <div className="mt-1 text-base font-semibold text-white">
            {remaining === 0 ? 'All done — log a win.' : `${remaining} to clear`}
          </div>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-white/15 hover:text-white"
            title="Reset to today's defaults"
          >
            Reset
          </button>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {actions.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onToggle(a.id)}
              className="group flex w-full items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3.5 py-3 text-left transition-colors hover:border-amber-300/20 hover:bg-white/[0.03]"
            >
              <span
                className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  a.done
                    ? 'border-amber-300 bg-amber-300 text-black'
                    : 'border-white/20 bg-transparent text-transparent group-hover:border-amber-300/50'
                }`}
              >
                <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l3.5 3.5L13 4.5" />
                </svg>
              </span>
              <span className="flex-1">
                <span
                  className={`text-[14px] leading-[1.45] ${
                    a.done ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-100'
                  }`}
                >
                  {a.text}
                </span>
                {a.priority === 'high' && !a.done && (
                  <span className="ml-2 rounded border border-amber-300/30 bg-amber-300/[0.08] px-1.5 py-0.5 align-middle text-[9.5px] font-semibold uppercase tracking-wider text-amber-300">
                    High
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   Prospect pipeline
   ============================================================ */
function ProspectPipeline({
  prospects,
  onUpdate,
  onAdd,
  onRemove,
}: {
  prospects: Prospect[];
  onUpdate: (id: string, patch: Partial<Prospect>) => void;
  onAdd: (p: Prospect) => void;
  onRemove: (id: string) => void;
}) {
  const [filterStage, setFilterStage] = useState<Stage | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<Prospect>>({});

  const filtered = useMemo(
    () => (filterStage === 'all' ? prospects : prospects.filter((p) => p.stage === filterStage)),
    [filterStage, prospects],
  );

  const stageCounts = useMemo(() => {
    const c: Record<Stage, number> = {
      cold: 0,
      replied: 0,
      demo: 0,
      verbal: 0,
      customer: 0,
      lost: 0,
    };
    prospects.forEach((p) => (c[p.stage] = (c[p.stage] ?? 0) + 1));
    return c;
  }, [prospects]);

  const submitAdd = () => {
    if (!draft.company || !draft.contactName) return;
    const id = `p-${Date.now()}`;
    onAdd({
      id,
      company: draft.company ?? '',
      contactName: draft.contactName ?? '',
      role: draft.role ?? '',
      email: draft.email ?? '',
      phone: draft.phone,
      metro: draft.metro ?? 'Tulsa',
      segment: (draft.segment as Prospect['segment']) ?? 'Commercial lender',
      stage: 'cold',
      lastTouchAt: '',
      nextAction: draft.nextAction ?? 'Initial cold email',
      owner: (draft.owner as Prospect['owner']) ?? 'Madison',
    });
    setDraft({});
    setShowAdd(false);
  };

  return (
    <div className="vantage-card overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.05] px-5 py-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Prospect pipeline
          </div>
          <div className="mt-0.5 text-base font-semibold text-white">
            {prospects.length} prospects in flight
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterStage('all')}
            className={chipClass(filterStage === 'all')}
          >
            All <span className="ml-1 tabular-nums text-zinc-500">{prospects.length}</span>
          </button>
          {STAGE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStage(s)}
              className={chipClass(filterStage === s)}
            >
              {STAGE_LABEL[s]}{' '}
              <span className="ml-1 tabular-nums text-zinc-500">{stageCounts[s]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="vantage-cta-spring rounded bg-white px-3 py-1.5 text-[12px] font-semibold text-black"
          >
            {showAdd ? 'Close' : '+ Add prospect'}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="grid gap-3 border-b border-white/[0.05] bg-white/[0.015] px-5 py-5 md:grid-cols-3">
          <Input placeholder="Company *" value={draft.company} onChange={(v) => setDraft({ ...draft, company: v })} />
          <Input placeholder="Contact name *" value={draft.contactName} onChange={(v) => setDraft({ ...draft, contactName: v })} />
          <Input placeholder="Role" value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} />
          <Input placeholder="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
          <Input placeholder="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
          <Select
            value={draft.segment ?? 'Commercial lender'}
            onChange={(v) => setDraft({ ...draft, segment: v as Prospect['segment'] })}
            options={['Commercial lender', 'Title / closing', 'CRE broker', 'Sponsor / borrower', 'Developer']}
          />
          <Input placeholder="Metro" value={draft.metro ?? 'Tulsa'} onChange={(v) => setDraft({ ...draft, metro: v })} />
          <Select
            value={draft.owner ?? 'Madison'}
            onChange={(v) => setDraft({ ...draft, owner: v as 'Madison' | 'Jason' })}
            options={['Madison', 'Jason']}
          />
          <Input placeholder="Next action" value={draft.nextAction} onChange={(v) => setDraft({ ...draft, nextAction: v })} />
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={submitAdd}
              className="vantage-cta-spring rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300"
            >
              Add to pipeline
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 text-left">Company</th>
              <th className="px-4 py-2.5 text-left">Contact</th>
              <th className="px-4 py-2.5 text-left">Segment</th>
              <th className="px-4 py-2.5 text-left">Metro</th>
              <th className="px-4 py-2.5 text-left">Stage</th>
              <th className="px-4 py-2.5 text-left">Next action</th>
              <th className="px-4 py-2.5 text-left">Owner</th>
              <th className="px-4 py-2.5 text-right">·</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 align-top">
                  <div className="font-medium text-white">{p.company}</div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">{p.email}</div>
                </td>
                <td className="px-4 py-2.5 align-top">
                  <div className="text-zinc-100">{p.contactName}</div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">{p.role}</div>
                </td>
                <td className="px-4 py-2.5 align-top text-zinc-300/85">{p.segment}</td>
                <td className="px-4 py-2.5 align-top text-zinc-300/85">{p.metro}</td>
                <td className="px-4 py-2.5 align-top">
                  <select
                    value={p.stage}
                    onChange={(e) =>
                      onUpdate(p.id, {
                        stage: e.target.value as Stage,
                        lastTouchAt: new Date().toISOString(),
                      })
                    }
                    className={`rounded border px-2 py-1 text-[12px] font-medium transition-colors ${stageBadgeClass(p.stage)}`}
                  >
                    {STAGE_ORDER.map((s) => (
                      <option key={s} value={s} className="bg-[#0a0e18] text-white">
                        {STAGE_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2.5 align-top text-zinc-300/85">{p.nextAction}</td>
                <td className="px-4 py-2.5 align-top">
                  <select
                    value={p.owner}
                    onChange={(e) => onUpdate(p.id, { owner: e.target.value as 'Madison' | 'Jason' })}
                    className="rounded border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[12px] text-zinc-200"
                  >
                    <option value="Madison" className="bg-[#0a0e18]">Madison</option>
                    <option value="Jason" className="bg-[#0a0e18]">Jason</option>
                  </select>
                </td>
                <td className="px-4 py-2.5 text-right align-top">
                  <button
                    type="button"
                    onClick={() => onRemove(p.id)}
                    className="text-[11px] text-zinc-500 hover:text-red-300"
                    title="Remove"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-500">
                  No prospects in this stage yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/15"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/15"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#0a0e18] text-white">
          {o}
        </option>
      ))}
    </select>
  );
}

function chipClass(active: boolean) {
  return `rounded border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
    active
      ? 'border-amber-300/40 bg-amber-300/[0.10] text-amber-200'
      : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:text-white'
  }`;
}

function stageBadgeClass(stage: Stage) {
  const map: Record<Stage, string> = {
    cold: 'border-white/[0.08] bg-white/[0.02] text-zinc-300',
    replied: 'border-blue-400/30 bg-blue-400/10 text-blue-200',
    demo: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
    verbal: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
    customer: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    lost: 'border-zinc-700 bg-zinc-800/40 text-zinc-500',
  };
  return map[stage];
}

/* ============================================================
   Stats helpers
   ============================================================ */
function computeStats({ prospects }: HubState) {
  const launch = new Date(LAUNCH_DATE);
  const now = new Date();
  const day = Math.max(
    1,
    Math.floor((now.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const customers = prospects.filter((p) => p.stage === 'customer').length;
  const verbal = prospects.filter((p) => p.stage === 'verbal').length;
  const replied = prospects.filter((p) =>
    ['replied', 'demo', 'verbal', 'customer'].includes(p.stage),
  ).length;
  const pipelineCount = prospects.filter((p) => p.stage !== 'lost').length;
  const mrr = customers * 149;
  return { day, customers, verbal, replied, pipelineCount, mrr };
}
