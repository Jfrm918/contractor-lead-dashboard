'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Heart, Mail, Phone, Search, Send, Sparkles, Star, StickyNote, Target } from 'lucide-react';
import { tulsaProspects, type ProspectTrade } from '@/lib/tulsa-prospects';

type OutreachStatus = 'Not Contacted' | 'Email Sent' | 'Follow-Up 1' | 'Follow-Up 2' | 'Replied' | 'Demo Booked' | 'Pilot Offered' | 'Won' | 'Lost';

const statuses: OutreachStatus[] = ['Not Contacted', 'Email Sent', 'Follow-Up 1', 'Follow-Up 2', 'Replied', 'Demo Booked', 'Pilot Offered', 'Won', 'Lost'];
const trades: ('All' | ProspectTrade)[] = ['All', 'Plumbing', 'HVAC', 'Roofing', 'Electrical', 'Restoration', 'Garage Doors', 'Insulation', 'Pest Control'];
const storageKey = 'lrp-madison-outreach-state-v1';

interface OutreachState {
  [name: string]: { status: OutreachStatus; note: string; lastTouched?: string };
}

function emailOne(name: string, trade: ProspectTrade, angle: string) {
  return `Subject: Quick question about missed ${trade.toLowerCase()} leads\n\nHi ${name} team,\n\nI’m reaching out because we’re helping Tulsa-area contractors catch leads that slip through when calls are missed or follow-up is slow.\n\nFor ${trade.toLowerCase()} companies, the leak is usually simple: a customer calls about something urgent, does not get a fast response, then calls the next company.\n\n${angle}\n\nWould it be worth a quick look at where leads may be leaking in your follow-up?\n\nBest,\nMadison\nLeadRecovery Pro`;
}

function followUpOne(name: string) {
  return `Subject: Re: missed lead follow-up\n\nHi ${name} team,\n\nJust wanted to bump this up once.\n\nThe quick version: LeadRecovery Pro helps contractors respond when calls get missed, qualify the lead, and show the owner which opportunities are still alive.\n\nIf you’re already covered on every call, no worries. If a few slip through during busy hours or after hours, this may be worth a 10-minute look.\n\nBest,\nMadison`;
}

function breakupEmail(name: string) {
  return `Subject: Should I close this out?\n\nHi ${name} team,\n\nI don’t want to clutter your inbox. Should I close this out, or would you want us to run a quick missed-lead / response-speed check for your company?\n\nEither way is fine.\n\nBest,\nMadison`;
}

export default function OutreachDashboard() {
  const [state, setState] = useState<OutreachState>({});
  const [query, setQuery] = useState('');
  const [trade, setTrade] = useState<'All' | ProspectTrade>('All');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setState(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }, [state]);

  const prospects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tulsaProspects
      .filter((p) => p.tier === 'Best Bets' || p.tier === 'Strong Fit')
      .filter((p) => p.email || p.contactUrl)
      .filter((p) => trade === 'All' || p.trade === trade)
      .filter((p) => !q || [p.name, p.trade, p.email, p.phone].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => {
        const aStatus = state[a.name]?.status ?? 'Not Contacted';
        const bStatus = state[b.name]?.status ?? 'Not Contacted';
        return statuses.indexOf(aStatus) - statuses.indexOf(bStatus) || b.fitScore - a.fitScore;
      });
  }, [query, trade, state]);

  const totals = useMemo(() => {
    const counts = Object.fromEntries(statuses.map((s) => [s, 0])) as Record<OutreachStatus, number>;
    prospects.forEach((p) => { counts[state[p.name]?.status ?? 'Not Contacted'] += 1; });
    return counts;
  }, [prospects, state]);

  function updateProspect(name: string, patch: Partial<OutreachState[string]>) {
    setState((prev) => ({
      ...prev,
      [name]: {
        status: prev[name]?.status ?? 'Not Contacted',
        note: prev[name]?.note ?? '',
        ...patch,
        lastTouched: new Date().toISOString(),
      },
    }));
  }

  async function copy(label: string, text: string) {
    await navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="space-y-6 relative">
      <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-pink-400/[0.10] blur-3xl" />
      <div className="pointer-events-none absolute top-48 -left-10 h-56 w-56 rounded-full bg-rose-300/[0.08] blur-3xl" />

      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-pink-300 mb-2 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Madison workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-pink-200 via-rose-200 to-fuchsia-200 bg-clip-text text-transparent">Madison’s Outreach Desk</h1>
          <p className="text-sm text-[#c4b5fd] mt-1 max-w-2xl">Email-first prospecting with only the essentials: best-fit leads, polished copy, status, notes, and handoff signals for Jason.</p>
        </div>
        <div className="grid grid-cols-4 gap-2 min-w-[360px]">
          <div className="rounded-2xl border border-pink-300/15 bg-pink-300/[0.06] p-3"><p className="text-xs text-pink-200/70">Queue</p><p className="text-xl font-semibold metric-value text-pink-100">{prospects.length}</p></div>
          <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.06] p-3"><p className="text-xs text-pink-200/70">Sent</p><p className="text-xl font-semibold metric-value text-rose-200">{totals['Email Sent'] + totals['Follow-Up 1'] + totals['Follow-Up 2']}</p></div>
          <div className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.06] p-3"><p className="text-xs text-pink-200/70">Replies</p><p className="text-xl font-semibold metric-value text-fuchsia-200">{totals.Replied}</p></div>
          <div className="rounded-2xl border border-purple-300/15 bg-purple-300/[0.06] p-3"><p className="text-xs text-pink-200/70">Demos</p><p className="text-xl font-semibold metric-value text-purple-200">{totals['Demo Booked']}</p></div>
        </div>
      </div>

      <div className="rounded-3xl border border-pink-300/15 bg-gradient-to-br from-pink-300/[0.08] via-white/[0.035] to-fuchsia-300/[0.06] p-4 shadow-lg shadow-pink-500/[0.03]">
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
            <motion.div key={p.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.02, 0.35) }} className="rounded-3xl border border-pink-200/[0.13] bg-gradient-to-br from-pink-200/[0.07] via-white/[0.035] to-purple-200/[0.045] p-4 shadow-lg shadow-pink-500/[0.025]">
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

              <div className="mt-4 rounded-xl border border-pink-300/[0.12] bg-pink-300/[0.055] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-pink-300 mb-1 flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Email angle</p>
                <p className="text-sm text-pink-50/80 leading-relaxed">{p.madisonAngle}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => copy('Email 1', emailOne(p.name, p.trade, p.madisonAngle))} className="rounded-xl border border-pink-300/25 bg-pink-300/12 px-3 py-2 text-sm text-pink-200 inline-flex items-center gap-2"><Copy className="w-4 h-4" />Copy Email 1</button>
                <button onClick={() => copy('Follow-Up 1', followUpOne(p.name))} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-pink-50/80 inline-flex items-center gap-2"><Send className="w-4 h-4" />Copy Follow-Up</button>
                <button onClick={() => copy('Breakup Email', breakupEmail(p.name))} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-pink-50/80 inline-flex items-center gap-2"><Copy className="w-4 h-4" />Copy Breakup</button>
                {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-pink-50/80 inline-flex items-center gap-2">Website <ExternalLink className="w-4 h-4" /></a>}
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
