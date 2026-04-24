'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown } from 'lucide-react';
import {
  leads,
  getStatusPillClass,
  getUrgencyPillClass,
  timeAgo,
  type LeadStatus,
  type LeadSource,
  type Trade,
} from '@/lib/data';

interface LeadsPageProps {
  onViewLead: (id: string) => void;
}

export default function LeadsPage({ onViewLead }: LeadsPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [tradeFilter, setTradeFilter] = useState<Trade | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.name.toLowerCase().includes(q) &&
          !l.service.toLowerCase().includes(q) &&
          !l.city.toLowerCase().includes(q) &&
          !l.phone.includes(q)
        ) {
          return false;
        }
      }
      if (statusFilter && l.status !== statusFilter) return false;
      if (sourceFilter && l.source !== sourceFilter) return false;
      if (tradeFilter && l.trade !== tradeFilter) return false;
      return true;
    });
  }, [search, statusFilter, sourceFilter, tradeFilter]);

  const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Booking Requested', 'Booked', 'Closed Lost'];
  const sources: LeadSource[] = ['Google Ads', 'LSA', 'Organic', 'Referral'];
  const trades: Trade[] = ['HVAC', 'Plumbing', 'Roofing', 'Electrical', 'Insulation'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads Inbox</h1>
        <p className="text-sm text-[#64748b] mt-0.5">{leads.length} total leads</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, service, city, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="glass-button px-4 py-2.5 flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white sm:w-auto"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter row */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 pb-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#94a3b8] focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')}
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#94a3b8] focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
              >
                <option value="">All Sources</option>
                {sources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value as Trade | '')}
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#94a3b8] focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
              >
                <option value="">All Trades</option>
                {trades.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {(statusFilter || sourceFilter || tradeFilter) && (
                <button
                  onClick={() => { setStatusFilter(''); setSourceFilter(''); setTradeFilter(''); }}
                  className="px-3 py-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads table — desktop */}
      <div className="glass overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-3">Service</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-3">City</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-3">Source</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-3">Urgency</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-3">Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => onViewLead(l.id)}
                  className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-medium text-[#94a3b8]">
                        {l.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{l.name}</p>
                        <p className="text-xs text-[#64748b]">{l.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#94a3b8]">{l.service}</td>
                  <td className="px-4 py-3.5 text-[#94a3b8]">{l.city}</td>
                  <td className="px-4 py-3.5 text-[#94a3b8]">{l.source}</td>
                  <td className="px-4 py-3.5">
                    <span className={getStatusPillClass(l.status)}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={getUrgencyPillClass(l.urgency)}>{l.urgency}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#64748b] text-xs">{timeAgo(l.lastContact)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="p-8 text-center text-[#64748b] text-sm">No leads match your filters.</div>
        )}
      </div>

      {/* Leads cards — mobile */}
      <div className="md:hidden space-y-3">
        {filteredLeads.map((l) => (
          <motion.button
            key={l.id}
            onClick={() => onViewLead(l.id)}
            className="glass w-full p-4 text-left"
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-medium text-[#94a3b8]">
                  {l.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{l.name}</p>
                  <p className="text-xs text-[#64748b]">{l.phone}</p>
                </div>
              </div>
              <span className={getUrgencyPillClass(l.urgency)}>{l.urgency}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-2">
              <span>{l.service}</span>
              <span className="text-[#64748b]">·</span>
              <span>{l.city}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={getStatusPillClass(l.status)}>{l.status}</span>
                <span className="text-xs text-[#64748b]">{l.source}</span>
              </div>
              <span className="text-xs text-[#64748b]">{timeAgo(l.lastContact)}</span>
            </div>
          </motion.button>
        ))}
        {filteredLeads.length === 0 && (
          <div className="glass p-8 text-center text-[#64748b] text-sm">No leads match your filters.</div>
        )}
      </div>
    </div>
  );
}
