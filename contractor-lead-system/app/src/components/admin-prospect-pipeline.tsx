'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, ExternalLink, MapPin, Search, Star, Users, Target, Filter, ClipboardCheck } from 'lucide-react';
import { tulsaProspects, type ProspectTier, type ProspectTrade } from '@/lib/tulsa-prospects';

const tiers: ProspectTier[] = ['Nurture', 'Solid Fit', 'Strong Fit', 'Best Bets'];
const trades: ('All' | ProspectTrade)[] = ['All', 'Plumbing', 'HVAC', 'Roofing', 'Electrical', 'Restoration', 'Garage Doors', 'Insulation', 'Pest Control'];

const tierStyles: Record<ProspectTier, string> = {
  Nurture: 'border-slate-400/15 bg-slate-400/[0.04]',
  'Solid Fit': 'border-cyan-400/15 bg-cyan-400/[0.05]',
  'Strong Fit': 'border-purple-400/20 bg-purple-400/[0.06]',
  'Best Bets': 'border-emerald-400/25 bg-emerald-400/[0.07]',
};

const tradeColors: Record<ProspectTrade, string> = {
  Plumbing: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
  HVAC: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  Roofing: 'text-red-300 bg-red-400/10 border-red-400/20',
  Electrical: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/20',
  Insulation: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
  Restoration: 'text-purple-300 bg-purple-400/10 border-purple-400/20',
  'Garage Doors': 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  'Pest Control': 'text-lime-300 bg-lime-400/10 border-lime-400/20',
};

function sourceLabel(confidence: string) {
  if (confidence === 'public website') return 'Public email found';
  if (confidence === 'contact form only') return 'Use contact form';
  return 'Email not found yet';
}

export default function AdminProspectPipeline() {
  const [trade, setTrade] = useState<'All' | ProspectTrade>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tulsaProspects.filter((p) => {
      const tradeMatch = trade === 'All' || p.trade === trade;
      const queryMatch = !q || [p.name, p.trade, p.email, p.phone, p.zip].some((v) => v.toLowerCase().includes(q));
      return tradeMatch && queryMatch;
    });
  }, [trade, query]);

  const byTier = useMemo(() => Object.fromEntries(tiers.map((tier) => [tier, filtered.filter((p) => p.tier === tier)])) as Record<ProspectTier, typeof tulsaProspects>, [filtered]);
  const emailCount = filtered.filter((p) => p.email).length;
  const bestBets = filtered.filter((p) => p.tier === 'Best Bets').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-purple-300 mb-2">Tulsa within 30 miles · quality-first list</p>
          <h1 className="text-2xl font-semibold tracking-tight">LRP Prospect Pipeline</h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-3xl">
            Curated contractor targets for Jason and Madison, ranked from least likely to most likely to see measurable results from LeadRecovery Pro.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-[320px]">
          <div className="glass-subtle rounded-2xl p-3"><p className="text-xs text-[#64748b]">Prospects</p><p className="text-xl font-semibold metric-value">{filtered.length}</p></div>
          <div className="glass-subtle rounded-2xl p-3"><p className="text-xs text-[#64748b]">Best bets</p><p className="text-xl font-semibold metric-value text-emerald-300">{bestBets}</p></div>
          <div className="glass-subtle rounded-2xl p-3"><p className="text-xs text-[#64748b]">Emails</p><p className="text-xl font-semibold metric-value text-cyan-300">{emailCount}</p></div>
        </div>
      </div>

      <div className="glass p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company, email, phone, zip..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-3 py-2 text-sm text-[#e2e8f0] outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {trades.map((t) => (
              <button
                key={t}
                onClick={() => setTrade(t)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${trade === t ? 'border-purple-400/40 bg-purple-400/15 text-white' : 'border-white/[0.06] bg-white/[0.03] text-[#94a3b8] hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-start">
        {tiers.map((tier, tierIndex) => (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tierIndex * 0.05, duration: 0.3 }}
            className={`rounded-2xl border ${tierStyles[tier]} p-3`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-[#e2e8f0]">{tier}</p>
                <p className="text-xs text-[#64748b]">{tier === 'Nurture' ? 'least likely' : tier === 'Best Bets' ? 'most likely' : 'mid-priority'}</p>
              </div>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-[#cbd5e1]">{byTier[tier].length}</span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-310px)] overflow-y-auto pr-1">
              {byTier[tier].map((p) => (
                <div key={`${p.name}-${p.phone}`} className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#e2e8f0] leading-snug">{p.name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${tradeColors[p.trade]}`}>{p.trade}</span>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#94a3b8]">Score {p.fitScore}</span>
                      </div>
                    </div>
                    {p.tier === 'Best Bets' && <Star className="w-4 h-4 text-emerald-300 flex-shrink-0" />}
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[#94a3b8]">
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{p.phone || 'phone not found'}</p>
                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{p.email || sourceLabel(p.emailConfidence)}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />Tulsa area · ZIP {p.zip || 'verify'}</p>
                  </div>

                  <div className="mt-3 rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-purple-300 mb-1">Madison angle</p>
                    <p className="text-xs text-[#cbd5e1] leading-relaxed">{p.madisonAngle}</p>
                  </div>

                  <p className="text-xs text-[#64748b] leading-relaxed mt-2">{p.fitReason}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noreferrer" className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[11px] text-cyan-300 inline-flex items-center gap-1">
                        Site <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {p.contactUrl && (
                      <a href={p.contactUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[11px] text-[#cbd5e1] inline-flex items-center gap-1">
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {byTier[tier].length === 0 && <p className="text-xs text-[#64748b] p-3">No prospects match this filter.</p>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-emerald-400" /> Outreach rules for Jason + Madison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"><Target className="w-4 h-4 text-emerald-300 mb-2" /><p className="text-sm font-semibold text-[#e2e8f0]">Start with Best Bets</p><p className="text-xs text-[#94a3b8] mt-2">Plumbing, HVAC, roofing, and restoration have the clearest urgent-call money leak.</p></div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"><Mail className="w-4 h-4 text-cyan-300 mb-2" /><p className="text-sm font-semibold text-[#e2e8f0]">Madison email-first</p><p className="text-xs text-[#94a3b8] mt-2">Use public emails when present. If no email, use contact form or call only after Jason approves.</p></div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"><Filter className="w-4 h-4 text-purple-300 mb-2" /><p className="text-sm font-semibold text-[#e2e8f0]">Quality beats volume</p><p className="text-xs text-[#94a3b8] mt-2">The target is 10 serious pilots, not blasting every contractor in Tulsa.</p></div>
        </div>
      </div>
    </div>
  );
}
