'use client';

import { useEffect, useMemo, useState } from 'react';

/* ============================================================
   Admin tabs — Customers / Revenue / Billing
   Stage 1: localStorage-backed, ready to swap to Stripe + DB
   when stepdad becomes customer #1 Saturday.
   ============================================================ */

export type Tier = 'starter' | 'growth' | 'pro' | 'pilot';
export type CustomerStatus = 'pilot' | 'active' | 'paused' | 'churned';

export type Customer = {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  metro: string;
  tier: Tier;
  monthlyAmount: number;
  status: CustomerStatus;
  startedAt: string;
  lastDigestSent?: string;
  lastLogin?: string;
  notes?: string;
};

export type BillingEvent = {
  id: string;
  customerId: string;
  type: 'charge_succeeded' | 'charge_failed' | 'subscription_renewed' | 'subscription_canceled' | 'pilot_started';
  amount: number;
  at: string;
  note?: string;
};

const STORAGE_KEY = 'vantage-admin-state-v1';

type AdminState = {
  customers: Customer[];
  events: BillingEvent[];
};

const SEED: AdminState = { customers: [], events: [] };

function useAdminState() {
  const [state, setState] = useState<AdminState>(SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AdminState;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe localStorage hydration on mount
        if (parsed.customers && parsed.events) setState(parsed);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, hydrated]);

  return [state, setState] as const;
}

/* ============================================================
   Customers tab — list + add form
   ============================================================ */
export function CustomersClient() {
  const [state, setState] = useAdminState();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Partial<Customer>>({
    tier: 'pilot',
    monthlyAmount: 99,
    status: 'pilot',
    metro: 'Tulsa',
  });

  const tierMonthly: Record<Tier, number> = { pilot: 99, starter: 149, growth: 299, pro: 499 };

  function addCustomer() {
    if (!draft.company || !draft.contactName || !draft.email) return;
    const id = `c-${Date.now()}`;
    const monthlyAmount = draft.monthlyAmount ?? tierMonthly[(draft.tier as Tier) ?? 'pilot'];
    const customer: Customer = {
      id,
      company: draft.company,
      contactName: draft.contactName,
      email: draft.email,
      phone: draft.phone,
      metro: draft.metro ?? 'Tulsa',
      tier: (draft.tier as Tier) ?? 'pilot',
      monthlyAmount,
      status: (draft.status as CustomerStatus) ?? 'pilot',
      startedAt: new Date().toISOString(),
      notes: draft.notes,
    };
    const event: BillingEvent = {
      id: `e-${Date.now()}`,
      customerId: id,
      type: customer.tier === 'pilot' ? 'pilot_started' : 'charge_succeeded',
      amount: monthlyAmount,
      at: new Date().toISOString(),
      note: `${customer.company} started on ${customer.tier} tier`,
    };
    setState((s) => ({
      customers: [customer, ...s.customers],
      events: [event, ...s.events],
    }));
    setDraft({ tier: 'pilot', monthlyAmount: 99, status: 'pilot', metro: 'Tulsa' });
    setShowForm(false);
  }

  function removeCustomer(id: string) {
    setState((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
      events: s.events.filter((e) => e.customerId !== id),
    }));
  }

  function changeStatus(id: string, status: CustomerStatus) {
    setState((s) => ({
      ...s,
      customers: s.customers.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Paying customers
          </div>
          <div className="mt-0.5 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-white">
            {state.customers.length}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="vantage-cta-spring ml-auto rounded bg-amber-400 px-3 py-1.5 text-[12px] font-semibold text-black hover:bg-amber-300"
        >
          {showForm ? 'Close' : '+ Add customer'}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 grid gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 md:grid-cols-2">
          <Input label="Company *" value={draft.company} onChange={(v) => setDraft({ ...draft, company: v })} />
          <Input label="Contact name *" value={draft.contactName} onChange={(v) => setDraft({ ...draft, contactName: v })} />
          <Input label="Email *" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
          <Input label="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
          <Input label="Metro" value={draft.metro ?? 'Tulsa'} onChange={(v) => setDraft({ ...draft, metro: v })} />
          <Select
            label="Tier"
            value={draft.tier ?? 'pilot'}
            options={[
              ['pilot', 'Pilot ($99/mo)'],
              ['starter', 'Starter ($149/mo)'],
              ['growth', 'Growth ($299/mo)'],
              ['pro', 'Pro ($499/mo)'],
            ]}
            onChange={(v) => setDraft({ ...draft, tier: v as Tier, monthlyAmount: tierMonthly[v as Tier] })}
          />
          <Input
            label="Monthly $"
            value={String(draft.monthlyAmount ?? 99)}
            onChange={(v) => setDraft({ ...draft, monthlyAmount: Number(v) || 0 })}
          />
          <Select
            label="Status"
            value={draft.status ?? 'pilot'}
            options={[
              ['pilot', 'Pilot (free trial / discount)'],
              ['active', 'Active (paying)'],
              ['paused', 'Paused'],
              ['churned', 'Churned'],
            ]}
            onChange={(v) => setDraft({ ...draft, status: v as CustomerStatus })}
          />
          <div className="md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Notes</span>
            <textarea
              rows={2}
              value={draft.notes ?? ''}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              className="mt-1 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={addCustomer}
              className="vantage-cta-spring rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300"
            >
              Add to customers
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-[13px]">
          <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 text-left">Customer</th>
              <th className="px-4 py-2.5 text-left">Metro</th>
              <th className="px-4 py-2.5 text-left">Tier</th>
              <th className="px-4 py-2.5 text-right">$/mo</th>
              <th className="px-4 py-2.5 text-left">Status</th>
              <th className="px-4 py-2.5 text-left">Started</th>
              <th className="px-4 py-2.5 text-right">·</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {state.customers.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 align-top">
                  <div className="font-medium text-white">{c.company}</div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">{c.contactName} · {c.email}</div>
                </td>
                <td className="px-4 py-2.5 align-top text-zinc-300/85">{c.metro}</td>
                <td className="px-4 py-2.5 align-top text-zinc-300/85 capitalize">{c.tier}</td>
                <td className="px-4 py-2.5 text-right align-top font-medium tabular-nums text-amber-300">
                  ${c.monthlyAmount}
                </td>
                <td className="px-4 py-2.5 align-top">
                  <select
                    value={c.status}
                    onChange={(e) => changeStatus(c.id, e.target.value as CustomerStatus)}
                    className="rounded border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[11.5px] text-zinc-200"
                  >
                    <option value="pilot" className="bg-[#0a0e18]">Pilot</option>
                    <option value="active" className="bg-[#0a0e18]">Active</option>
                    <option value="paused" className="bg-[#0a0e18]">Paused</option>
                    <option value="churned" className="bg-[#0a0e18]">Churned</option>
                  </select>
                </td>
                <td className="px-4 py-2.5 align-top text-[11.5px] text-zinc-500">
                  {new Date(c.startedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-right align-top">
                  <button
                    type="button"
                    onClick={() => removeCustomer(c.id)}
                    className="text-[11px] text-zinc-600 hover:text-red-300"
                    title="Remove"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {state.customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">
                  No customers yet. The &quot;+ Add customer&quot; button is ready for the moment stepdad says yes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   Revenue tab — MRR / ARR / counts wired to customer state
   ============================================================ */
export function RevenueClient() {
  const [state] = useAdminState();
  const m = useMemo(() => computeMetrics(state), [state]);

  const monthlyTargets = [
    { month: 'May', target: 500 },
    { month: 'Jun', target: 1500 },
    { month: 'Jul', target: 2500 },
    { month: 'Aug', target: 4500 },
    { month: 'Sep', target: 5500 },
    { month: 'Oct', target: 7000 },
    { month: 'Nov', target: 8500 },
    { month: 'Dec', target: 9500 },
    { month: 'Jan', target: 10000 },
  ];

  const maxTarget = Math.max(...monthlyTargets.map((t) => t.target), m.mrr * 1.1, 1000);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="MRR" value={`$${m.mrr.toLocaleString()}`} accent={m.mrr > 0} />
        <Stat label="ARR (annualized)" value={`$${m.arr.toLocaleString()}`} accent={m.arr > 0} />
        <Stat label="Active customers" value={m.activeCount.toString()} accent={m.activeCount > 0} />
        <Stat label="Pilots in flight" value={m.pilotCount.toString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="vantage-card rounded-2xl p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Tier mix
          </div>
          {m.tierBreakdown.length === 0 ? (
            <div className="mt-4 text-sm text-zinc-500">No customers yet.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {m.tierBreakdown.map((t) => (
                <div key={t.tier}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="capitalize text-zinc-300/85">{t.tier}</span>
                    <span className="font-mono tabular-nums text-zinc-300/85">
                      {t.count} · ${t.mrr.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500/70"
                      style={{ width: `${(t.mrr / Math.max(m.mrr, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="vantage-card rounded-2xl p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            MRR vs. plan target
          </div>
          <div className="mt-4 space-y-2">
            {monthlyTargets.map((t) => (
              <div key={t.month} className="flex items-center gap-3">
                <span className="w-12 text-[11px] uppercase tracking-wider text-zinc-500">{t.month}</span>
                <div className="flex-1">
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400/40 to-amber-500/30"
                      style={{ width: `${(t.target / maxTarget) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-16 text-right font-mono text-[11px] tabular-nums text-zinc-400">
                  ${t.target.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="vantage-card rounded-2xl p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Year 1 trajectory
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4 lg:grid-cols-6">
          {[
            ['Today', m.mrr],
            ['90d goal', 1500],
            ['180d goal', 4500],
            ['270d goal', 7000],
            ['365d goal', 10000],
            ['Bull', 15000],
          ].map(([label, val]) => (
            <div key={label as string}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {label}
              </div>
              <div className="mt-1 text-[15px] font-semibold tabular-nums text-white">
                ${(val as number).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Billing events tab — recent transactions
   ============================================================ */
export function BillingClient() {
  const [state] = useAdminState();
  const eventsByDate = useMemo(
    () => [...state.events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [state.events],
  );
  const customersById = useMemo(() => {
    const m: Record<string, string> = {};
    state.customers.forEach((c) => { m[c.id] = c.company; });
    return m;
  }, [state.customers]);

  return (
    <div className="space-y-6">
      <div className="vantage-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Recent billing events
          </div>
          <span className="text-[11px] text-zinc-600">
            Stripe webhook integration: pending. Currently logs from Customers tab actions.
          </span>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-[13px]">
            <thead className="bg-white/[0.02] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-4 py-2.5 text-left">When</th>
                <th className="px-4 py-2.5 text-left">Customer</th>
                <th className="px-4 py-2.5 text-left">Event</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
                <th className="px-4 py-2.5 text-left">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {eventsByDate.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2.5 align-top text-zinc-400 text-[11.5px]">
                    {new Date(e.at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 align-top text-white">
                    {customersById[e.customerId] ?? e.customerId}
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <span className={badgeForEvent(e.type)}>{labelForEvent(e.type)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right align-top font-medium tabular-nums text-amber-300">
                    ${e.amount}
                  </td>
                  <td className="px-4 py-2.5 align-top text-zinc-300/85">{e.note ?? ''}</td>
                </tr>
              ))}
              {eventsByDate.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">
                    No billing events yet. Adding a customer creates the first event.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="vantage-card rounded-2xl p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Stripe integration status
        </div>
        <ul className="mt-4 space-y-2 text-[13.5px] leading-[1.55] text-zinc-200">
          {[
            ['Stripe account', '⚠️  Not connected — needs LLC + bank to set up'],
            ['Pay-link for $99 pilot', '⚠️  Pending — Friday build'],
            ['Webhook endpoint', '⚠️  Pending — wires in once Stripe account is live'],
            ['Recurring subscriptions', '⚠️  Pending — Friday build'],
            ['Failed-charge dunning emails', '⚠️  Roadmap — week 4+'],
          ].map(([k, v]) => (
            <li key={k as string} className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-2">
              <span>{k}</span>
              <span className="text-[12.5px] text-zinc-400">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
   helpers
   ============================================================ */
function computeMetrics(s: AdminState) {
  const active = s.customers.filter((c) => c.status === 'active' || c.status === 'pilot');
  const mrr = active.reduce((sum, c) => sum + c.monthlyAmount, 0);
  const arr = mrr * 12;
  const tierAgg: Record<string, { tier: string; count: number; mrr: number }> = {};
  active.forEach((c) => {
    if (!tierAgg[c.tier]) tierAgg[c.tier] = { tier: c.tier, count: 0, mrr: 0 };
    tierAgg[c.tier].count += 1;
    tierAgg[c.tier].mrr += c.monthlyAmount;
  });
  return {
    mrr,
    arr,
    activeCount: s.customers.filter((c) => c.status === 'active').length,
    pilotCount: s.customers.filter((c) => c.status === 'pilot').length,
    tierBreakdown: Object.values(tierAgg).sort((a, b) => b.mrr - a.mrr),
  };
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="vantage-card rounded-xl px-5 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-semibold tabular-nums tracking-[-0.02em] ${
          accent ? 'text-amber-300' : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-[#0a0e18]">{l}</option>
        ))}
      </select>
    </div>
  );
}

function labelForEvent(t: BillingEvent['type']) {
  return ({
    charge_succeeded: 'Charge succeeded',
    charge_failed: 'Charge failed',
    subscription_renewed: 'Renewed',
    subscription_canceled: 'Canceled',
    pilot_started: 'Pilot started',
  })[t];
}

function badgeForEvent(t: BillingEvent['type']) {
  const base = 'inline-block rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider';
  switch (t) {
    case 'charge_succeeded':
    case 'subscription_renewed':
      return `${base} border-emerald-400/30 bg-emerald-400/10 text-emerald-300`;
    case 'charge_failed':
    case 'subscription_canceled':
      return `${base} border-red-400/30 bg-red-400/10 text-red-300`;
    case 'pilot_started':
      return `${base} border-amber-300/30 bg-amber-300/10 text-amber-300`;
    default:
      return `${base} border-white/[0.08] bg-white/[0.02] text-zinc-300`;
  }
}
