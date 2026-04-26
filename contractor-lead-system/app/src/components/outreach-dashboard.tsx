'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Mail, Phone, Search, Send, Star, StickyNote, Target } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 mb-2">Madison workspace</p>
          <h1 className="text-2xl font-semibold tracking-tight">Outreach Desk</h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">Only what matters for email-first prospecting: best-fit leads, copyable emails, status, notes, and handoff signals for Jason.</p>
        </div>
        <div className="grid grid-cols-4 gap-2 min-w-[360px]">
          <div className="glass-subtle rounded-2xl p-3"><p className="text-xs text-[#64748b]">Queue</p><p className="text-xl font-semibold metric-value">{prospects.length}</p></div>
          <div className="glass-subtle rounded-2xl p-3"><p className="text-xs text-[#64748b]">Sent</p><p className="text-xl font-semibold metric-value text-cyan-300">{totals['Email Sent'] + totals['Follow-Up 1'] + totals['Follow-Up 2']}</p></div>
          <div className="glass-subtle rounded-2xl p-3"><p className="text-xs text-[#64748b]">Replies</p><p className="text-xl font-semibold metric-value text-emerald-300">{totals.Replied}</p></div>
          <div className="glass-subtle rounded-2xl p-3"><p className="text-xs text-[#64748b]">Demos</p><p className="text-xl font-semibold metric-value text-purple-300">{totals['Demo Booked']}</p></div>
        </div>
      </div>

      <div className="glass p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, trade, email, phone..." className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-3 py-2 text-sm text-[#e2e8f0] outline-none" />
          </div>
          <div className="flex flex-wrap gap-2">
            {trades.map((t) => <button key={t} onClick={() => setTrade(t)} className={`rounded-xl border px-3 py-2 text-xs font-medium ${trade === t ? 'border-cyan-400/40 bg-cyan-400/15 text-white' : 'border-white/[0.06] bg-white/[0.03] text-[#94a3b8]'}`}>{t}</button>)}
          </div>
        </div>
      </div>

      {copied && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">Copied {copied}.</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {prospects.map((p, index) => {
          const pState = state[p.name] ?? { status: 'Not Contacted' as OutreachStatus, note: '' };
          return (
            <motion.div key={p.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.02, 0.35) }} className="glass p-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-[#e2e8f0]">{p.name}</h2>
                    {p.tier === 'Best Bets' && <Star className="w-4 h-4 text-emerald-300" />}
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">{p.trade} · Score {p.fitScore} · {p.tier}</p>
                </div>
                <select value={pState.status} onChange={(e) => updateProspect(p.name, { status: e.target.value as OutreachStatus })} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#e2e8f0] outline-none">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm text-[#cbd5e1]">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-cyan-300" />{p.email || 'Use contact form'}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#64748b]" />{p.phone}</p>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-cyan-300 mb-1 flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Email angle</p>
                <p className="text-sm text-[#cbd5e1] leading-relaxed">{p.madisonAngle}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => copy('Email 1', emailOne(p.name, p.trade, p.madisonAngle))} className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300 inline-flex items-center gap-2"><Copy className="w-4 h-4" />Copy Email 1</button>
                <button onClick={() => copy('Follow-Up 1', followUpOne(p.name))} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#cbd5e1] inline-flex items-center gap-2"><Send className="w-4 h-4" />Copy Follow-Up</button>
                <button onClick={() => copy('Breakup Email', breakupEmail(p.name))} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#cbd5e1] inline-flex items-center gap-2"><Copy className="w-4 h-4" />Copy Breakup</button>
                {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#cbd5e1] inline-flex items-center gap-2">Website <ExternalLink className="w-4 h-4" /></a>}
              </div>

              <label className="block mt-4 text-xs text-[#94a3b8]">
                <span className="flex items-center gap-2 mb-1"><StickyNote className="w-3.5 h-3.5" /> Notes for Jason</span>
                <textarea value={pState.note} onChange={(e) => updateProspect(p.name, { note: e.target.value })} placeholder="Example: emailed owner, replied interested, wants demo next week..." className="w-full min-h-[76px] rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#e2e8f0] outline-none" />
              </label>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
