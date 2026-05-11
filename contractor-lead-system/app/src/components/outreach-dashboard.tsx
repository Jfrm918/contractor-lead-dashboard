'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Heart, Mail, Phone, Search, Send, Sparkles, StickyNote, Target } from 'lucide-react';
import { tulsaProspects, type ProspectTrade, type TulsaProspect } from '@/lib/tulsa-prospects';

type OutreachStatus = 'Not Contacted' | 'Email Sent' | 'Follow-Up 1' | 'Follow-Up 2' | 'Replied' | 'Demo Booked' | 'Pilot Offered' | 'Won' | 'Lost';

const statuses: OutreachStatus[] = ['Not Contacted', 'Email Sent', 'Follow-Up 1', 'Follow-Up 2', 'Replied', 'Demo Booked', 'Pilot Offered', 'Won', 'Lost'];
const trades: ('All' | ProspectTrade)[] = ['All', 'Plumbing', 'HVAC', 'Roofing', 'Electrical', 'Restoration', 'Garage Doors', 'Insulation', 'Pest Control'];

interface OutreachState {
  [name: string]: { status: OutreachStatus; note: string; lastTouched?: string };
}

type OutreachProspect = TulsaProspect & {
  status: OutreachStatus;
  note: string;
  lastContactedAt: string | null;
  followUpDueAt: string | null;
  lastTouchedAt: string | null;
};

function emailOne(name: string, trade: ProspectTrade, angle: string) {
  return `Subject: Quick question about missed ${trade.toLowerCase()} leads\n\nHi ${name} team,\n\nI'm reaching out because we're helping Tulsa-area contractors catch leads that slip through when calls are missed or follow-up is slow.\n\nFor ${trade.toLowerCase()} companies, the leak is usually simple: a customer calls about something urgent, does not get a fast response, then calls the next company.\n\n${angle}\n\nWould it be worth a quick look at where leads may be leaking in your follow-up?\n\nBest,\nMadison\nVantage`;
}

function followUpOne(name: string) {
  return `Subject: Re: missed lead follow-up\n\nHi ${name} team,\n\nJust wanted to bump this up once.\n\nThe quick version: Vantage helps contractors respond when calls get missed, qualify the lead, and show the owner which opportunities are still alive.\n\nIf you're already covered on every call, no worries. If a few slip through during busy hours or after hours, this may be worth a 10-minute look.\n\nBest,\nMadison`;
}

function breakupEmail(name: string) {
  return `Subject: Should I close this out?\n\nHi ${name} team,\n\nI don't want to clutter your inbox. Should I close this out, or would you want us to run a quick missed-lead / response-speed check for your company?\n\nEither way is fine.\n\nBest,\nMadison`;
}

export default function OutreachDashboard() {
  const [state, setState] = useState<OutreachState>({});
  const [dbProspects, setDbProspects] = useState<OutreachProspect[]>([]);
  const [query, setQuery] = useState('');
  const [trade, setTrade] = useState<'All' | ProspectTrade>('All');
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [mode, setMode] = useState<'demo' | 'live'>('demo');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/outreach/prospects');
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data?.prospects)) {
          setDbProspects(json.data.prospects);
          setMode(json.data.mode === 'live' ? 'live' : 'demo');
          setState(Object.fromEntries(json.data.prospects.map((p: OutreachProspect) => [p.name, {
            status: p.status,
            note: p.note ?? '',
            lastTouched: p.lastTouchedAt ?? undefined,
          }])));
        }
      } catch {
        if (!cancelled) {
          setDbProspects(tulsaProspects.map((p) => ({
            ...p,
            status: 'Not Contacted',
            note: '',
            lastContactedAt: null,
            followUpDueAt: null,
            lastTouchedAt: null,
          })));
          setMode('demo');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const prospects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dbProspects
      .filter((p) => p.tier === 'Best Bets' || p.tier === 'Strong Fit')
      .filter((p) => p.email || p.contactUrl)
      .filter((p) => trade === 'All' || p.trade === trade)
      .filter((p) => !q || [p.name, p.trade, p.email, p.phone].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => {
        const aStatus = state[a.name]?.status ?? 'Not Contacted';
        const bStatus = state[b.name]?.status ?? 'Not Contacted';
        return statuses.indexOf(aStatus) - statuses.indexOf(bStatus) || b.fitScore - a.fitScore;
      });
  }, [query, trade, state, dbProspects]);

  const totals = useMemo(() => {
    const counts = Object.fromEntries(statuses.map((s) => [s, 0])) as Record<OutreachStatus, number>;
    prospects.forEach((p) => { counts[state[p.name]?.status ?? 'Not Contacted'] += 1; });
    return counts;
  }, [prospects, state]);

  async function updateProspect(name: string, patch: Partial<OutreachState[string]> & { lastContactedAt?: string | null; followUpDueAt?: string | null }) {
    setState((prev) => ({
      ...prev,
      [name]: {
        status: prev[name]?.status ?? 'Not Contacted',
        note: prev[name]?.note ?? '',
        ...patch,
        lastTouched: new Date().toISOString(),
      },
    }));
    setDbProspects((prev) => prev.map((p) => p.name === name ? {
      ...p,
      status: patch.status ?? p.status,
      note: patch.note ?? p.note,
      lastContactedAt: patch.lastContactedAt === undefined ? p.lastContactedAt : patch.lastContactedAt,
      followUpDueAt: patch.followUpDueAt === undefined ? p.followUpDueAt : patch.followUpDueAt,
      lastTouchedAt: new Date().toISOString(),
    } : p));

    if (mode !== 'live') return;
    setSaving(name);
    try {
      await fetch('/api/outreach/prospects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ...patch }),
      });
    } finally {
      setSaving(null);
    }
  }

  function scheduleFollowUp(name: string, status: OutreachStatus) {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    updateProspect(name, { status, followUpDueAt: due.toISOString() });
  }

  async function copy(label: string, text: string) {
    await navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  }

  if (loading) {
    return <div className="rounded-3xl border border-pink-300/15 bg-pink-300/[0.06] p-8 text-pink-100">Loading Madison&apos;s outreach desk…</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="pointer-events-none absolute -top-12 -right-12 h-80 w-80 rounded-full bg-pink-400/[0.08] blur-[80px]" />
      <div className="pointer-events-none absolute top-48 -left-14 h-72 w-72 rounded-full bg-rose-300/[0.06] blur-[80px]" />
      <div className="pointer-events-none absolute bottom-24 right-1/4 h-56 w-56 rounded-full bg-fuchsia-400/[0.04] blur-[60px]" />

      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-pink-300 mb-2 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Madison workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-pink-200 via-rose-200 to-fuchsia-200 bg-clip-text text-transparent">Madison&apos;s Outreach Desk</h1>
          <p className="text-sm text-[#c4b5fd] mt-1 max-w-2xl">Email-first prospecting with only the essentials: best-fit leads, polished copy, status, notes, and handoff signals for Jason.</p>
          <p className="text-xs mt-2 text-pink-200/70">{mode === 'live' ? 'Live shared pipeline - updates save for Jason and Madison.' : 'Demo preview - real login required to save shared updates.'}</p>
        </div>
        <div className="grid grid-cols-4 gap-2 min-w-[360px]">
          {[
            { label: 'Queue', value: prospects.length, borderColor: 'border-pink-300/15 border-t-pink-300/25', bgColor: 'bg-pink-300/[0.06]', textColor: 'text-pink-100', glowClass: 'inner-glow-pink', shadow: 'inset 0 1px 0 rgba(244,114,182,0.1), 0 4px 16px rgba(0,0,0,0.2)' },
            { label: 'Sent', value: totals['Email Sent'] + totals['Follow-Up 1'] + totals['Follow-Up 2'], borderColor: 'border-rose-300/15 border-t-rose-300/25', bgColor: 'bg-rose-300/[0.06]', textColor: 'text-rose-200', glowClass: 'inner-glow-pink', shadow: 'inset 0 1px 0 rgba(251,113,133,0.1), 0 4px 16px rgba(0,0,0,0.2)' },
            { label: 'Replies', value: totals.Replied, borderColor: 'border-fuchsia-300/15 border-t-fuchsia-300/25', bgColor: 'bg-fuchsia-300/[0.06]', textColor: 'text-fuchsia-200', glowClass: 'inner-glow-purple', shadow: 'inset 0 1px 0 rgba(217,70,239,0.1), 0 4px 16px rgba(0,0,0,0.2)' },
            { label: 'Demos', value: totals['Demo Booked'], borderColor: 'border-purple-300/15 border-t-purple-300/25', bgColor: 'bg-purple-300/[0.06]', textColor: 'text-purple-200', glowClass: 'inner-glow-purple', shadow: 'inset 0 1px 0 rgba(139,92,246,0.1), 0 4px 16px rgba(0,0,0,0.2)' },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border ${card.borderColor} ${card.bgColor} p-3 inner-glow ${card.glowClass} backdrop-blur-sm`} style={{ boxShadow: card.shadow }}>
              <p className="text-xs text-pink-200/70 relative z-[1]">{card.label}</p>
              <p className={`text-xl font-semibold metric-value ${card.textColor} relative z-[1]`}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-pink-300/15 border-t-pink-300/25 bg-gradient-to-br from-pink-300/[0.08] via-white/[0.035] to-fuchsia-300/[0.06] p-4 backdrop-blur-xl" style={{ boxShadow: 'inset 0 1px 0 rgba(244,114,182,0.12), 0 4px 24px rgba(0,0,0,0.2), 0 0 40px rgba(244,114,182,0.03)' }}>
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, trade, email, phone..." className="w-full rounded-xl border border-pink-300/[0.16] bg-white/[0.04] pl-10 pr-3 py-2 text-sm text-[#fdf2f8] placeholder:text-pink-200/40 outline-none focus:border-pink-300/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            {trades.map((t) => <button key={t} onClick={() => setTrade(t)} className={`rounded-xl border px-3 py-2 text-xs font-medium ${trade === t ? 'border-pink-300/50 bg-pink-300/15 text-pink-50' : 'border-white/[0.06] bg-white/[0.03] text-pink-100/60 hover:text-pink-50'}`}>{t}</button>)}
          </div>
        </div>
      </div>

      {copied && <div className="rounded-xl border border-pink-300/25 bg-pink-300/10 px-4 py-3 text-sm text-pink-200">Copied {copied}.</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {prospects.map((p, index) => {
          const pState = state[p.name] ?? { status: 'Not Contacted' as OutreachStatus, note: '' };
          return (
            <motion.div key={p.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.4), duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="rounded-3xl border border-pink-200/[0.13] border-t-pink-200/[0.22] bg-gradient-to-br from-pink-200/[0.07] via-white/[0.035] to-purple-200/[0.045] p-4 backdrop-blur-xl relative overflow-hidden" style={{ boxShadow: 'inset 0 1.5px 0 rgba(244,114,182,0.12), inset 0 -1px 0 rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.22), 0 0 32px rgba(244,114,182,0.025)' }}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-pink-50">{p.name}</h2>
                    {p.tier === 'Best Bets' && <Heart className="w-4 h-4 text-pink-300 fill-pink-300/20" />}
                  </div>
                  <p className="text-xs text-pink-100/50 mt-1">{p.trade} · Score {p.fitScore} · {p.tier}</p>
                </div>
                <select value={pState.status} onChange={(e) => updateProspect(p.name, { status: e.target.value as OutreachStatus })} className="rounded-xl border border-pink-300/[0.16] bg-[#17111c] px-3 py-2 text-sm text-pink-50 outline-none">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm text-pink-50/80">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-pink-300" />{p.email || 'Use contact form'}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-pink-200/50" />{p.phone}</p>
              </div>

              <div className="mt-4 rounded-xl border border-pink-300/[0.12] border-t-pink-300/[0.20] bg-pink-300/[0.055] p-3 backdrop-blur-sm" style={{ boxShadow: 'inset 0 1px 0 rgba(244,114,182,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.14em] text-pink-300 mb-1 flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Email angle</p>
                <p className="text-sm text-pink-50/80 leading-relaxed">{p.madisonAngle}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => copy('Email 1', emailOne(p.name, p.trade, p.madisonAngle))} className="rounded-xl border border-pink-300/25 bg-pink-300/12 px-3 py-2 text-sm text-pink-200 inline-flex items-center gap-2"><Copy className="w-4 h-4" />Copy Email 1</button>
                <button onClick={() => copy('Follow-Up 1', followUpOne(p.name))} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-pink-50/80 inline-flex items-center gap-2"><Send className="w-4 h-4" />Copy Follow-Up</button>
                <button onClick={() => copy('Breakup Email', breakupEmail(p.name))} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-pink-50/80 inline-flex items-center gap-2"><Copy className="w-4 h-4" />Copy Breakup</button>
                {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-pink-50/80 inline-flex items-center gap-2">Website <ExternalLink className="w-4 h-4" /></a>}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => updateProspect(p.name, { status: 'Email Sent', lastContactedAt: new Date().toISOString() })} className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs text-rose-200">Mark Email Sent</button>
                <button onClick={() => scheduleFollowUp(p.name, 'Follow-Up 1')} className="rounded-xl border border-pink-300/20 bg-pink-300/10 px-3 py-2 text-xs text-pink-200">Schedule Follow-Up</button>
                <button onClick={() => updateProspect(p.name, { status: 'Replied' })} className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-xs text-fuchsia-200">Mark Replied</button>
                <button onClick={() => updateProspect(p.name, { status: 'Demo Booked' })} className="rounded-xl border border-purple-300/20 bg-purple-300/10 px-3 py-2 text-xs text-purple-200">Book Demo</button>
                {saving === p.name && <span className="px-3 py-2 text-xs text-pink-200/60">Saving…</span>}
              </div>

              <label className="block mt-4 text-xs text-pink-100/60">
                <span className="flex items-center gap-2 mb-1"><StickyNote className="w-3.5 h-3.5" /> Notes for Jason</span>
                <textarea value={pState.note} onChange={(e) => updateProspect(p.name, { note: e.target.value })} placeholder="Example: emailed owner, replied interested, wants demo next week..." className="w-full min-h-[76px] rounded-xl border border-pink-300/[0.12] bg-white/[0.04] px-3 py-2 text-sm text-pink-50 placeholder:text-pink-100/35 outline-none focus:border-pink-300/35" />
              </label>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
