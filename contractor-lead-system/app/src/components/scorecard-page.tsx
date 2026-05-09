'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Phone,
  PhoneForwarded,
  UserCheck,
  CalendarCheck,
  Clock,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { scorecardData as mockScorecardData } from '@/lib/data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

const barColors = ['#3b82f6', '#22d3ee', '#34d399', '#fbbf24'];

interface ScorecardData {
  month: string;
  totalInbound: number;
  missedCalls: number;
  recoveredMissedCalls: number;
  recoveryRate: number;
  qualifiedLeads: number;
  bookedEstimates: number;
  avgResponseTime: string;
  sourceBreakdown: { source: string; leads: number; booked: number }[];
  roi: {
    adSpend: number;
    estimatedRevenue: number;
    costPerLead: number;
    costPerBooking: number;
    bookingRate: number;
  };
  weeklyTrend: { week: string; leads: number; booked: number }[];
}

export default function ScorecardPage() {
  const [sc, setSc] = useState<ScorecardData>(mockScorecardData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch('/api/leads/stats');
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.scorecard) {
            setSc(json.data.scorecard);
          }
        }
      } catch {
        // Keep mock data on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const topMetrics = [
    { label: 'Total Inbound', value: sc.totalInbound, icon: TrendingUp, color: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.10)', innerGlow: 'inner-glow-blue' },
    { label: 'Missed Calls', value: sc.missedCalls, icon: Phone, color: 'text-red-400', glow: 'rgba(248, 113, 113, 0.10)', innerGlow: 'inner-glow-red' },
    { label: 'Recovered', value: sc.recoveredMissedCalls, icon: PhoneForwarded, color: 'text-cyan-400', glow: 'rgba(34, 211, 238, 0.10)', innerGlow: 'inner-glow-cyan' },
    { label: 'Qualified', value: sc.qualifiedLeads, icon: UserCheck, color: 'text-emerald-400', glow: 'rgba(52, 211, 153, 0.10)', innerGlow: 'inner-glow-emerald' },
    { label: 'Booked', value: sc.bookedEstimates, icon: CalendarCheck, color: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.10)', innerGlow: 'inner-glow-amber' },
    { label: 'Avg Response', value: sc.avgResponseTime, icon: Clock, color: 'text-purple-400', glow: 'rgba(139, 92, 246, 0.10)', innerGlow: 'inner-glow-purple' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monthly Scorecard</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Loading...</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-white via-white to-blue-200/80 bg-clip-text text-transparent">Monthly Scorecard</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{sc.month}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-400 font-medium flex items-center gap-1" style={{ textShadow: '0 0 12px rgba(52,211,153,0.3)' }}>
            <ArrowUpRight className="w-3.5 h-3.5" />
            {sc.recoveryRate}% recovery rate
          </span>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {topMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className={`glass inner-glow ${m.innerGlow} p-4 flex flex-col gap-2 interactive-card`}
              style={{ boxShadow: `0 0 28px ${m.glow}, 0 2px 8px rgba(0,0,0,0.34), 0 8px 32px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.14)` }}
            >
              <div className="flex items-center justify-between relative z-[1]">
                <span className="label-caps">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color} opacity-80`} />
              </div>
              <span className="text-2xl font-semibold metric-value relative z-[1]">{m.value}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source breakdown chart */}
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Lead Source Breakdown
          </h2>
          {sc.sourceBreakdown.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sc.sourceBreakdown} barGap={8}>
                    <XAxis
                      dataKey="source"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(22, 27, 38, 0.95)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        color: '#f1f5f9',
                        fontSize: '13px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      }}
                    />
                    <Bar dataKey="leads" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {sc.sourceBreakdown.map((_, i) => (
                        <Cell key={i} fill={barColors[i % barColors.length]} fillOpacity={0.7} />
                      ))}
                    </Bar>
                    <Bar dataKey="booked" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {sc.sourceBreakdown.map((_, i) => (
                        <Cell key={i} fill={barColors[i % barColors.length]} fillOpacity={0.3} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/70" /> Leads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/30" /> Booked
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No source data available yet.</p>
          )}
        </motion.div>

        {/* Weekly trend */}
        <motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Weekly Trend
          </h2>
          {sc.weeklyTrend.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sc.weeklyTrend} barGap={4}>
                    <XAxis
                      dataKey="week"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(22, 27, 38, 0.95)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        color: '#f1f5f9',
                        fontSize: '13px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      }}
                    />
                    <Bar dataKey="leads" fill="#3b82f6" fillOpacity={0.6} radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="booked" fill="#34d399" fillOpacity={0.6} radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/60" /> Leads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/60" /> Booked
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No weekly trend data available yet.</p>
          )}
        </motion.div>
      </div>

      {/* ROI section */}
      <motion.div
        custom={8}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-5"
      >
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          ROI Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Ad Spend</p>
            <p className="text-xl font-semibold metric-value">${sc.roi.adSpend.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Est. Revenue</p>
            <p className="text-xl font-semibold metric-value text-emerald-400">${sc.roi.estimatedRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Cost / Lead</p>
            <p className="text-xl font-semibold metric-value">${sc.roi.costPerLead}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Cost / Booking</p>
            <p className="text-xl font-semibold metric-value">${sc.roi.costPerBooking}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Booking Rate</p>
            <p className="text-xl font-semibold metric-value text-amber-400">{sc.roi.bookingRate}%</p>
          </div>
        </div>
      </motion.div>

      {/* Source details table */}
      {sc.sourceBreakdown.length > 0 && (
        <motion.div
          custom={9}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass overflow-hidden"
        >
          <div className="p-5 pb-0">
            <h2 className="text-sm font-semibold mb-3">Source Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left label-caps px-5 py-2.5">Source</th>
                  <th className="text-right label-caps px-5 py-2.5">Leads</th>
                  <th className="text-right label-caps px-5 py-2.5">Booked</th>
                  <th className="text-right label-caps px-5 py-2.5">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {sc.sourceBreakdown.map((s) => (
                  <tr key={s.source} className="border-b border-white/[0.03] interactive-row">
                    <td className="px-5 py-3 font-medium">{s.source}</td>
                    <td className="px-5 py-3 text-right text-[var(--text-secondary)] metric-value">{s.leads}</td>
                    <td className="px-5 py-3 text-right text-[var(--text-secondary)] metric-value">{s.booked}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-emerald-400 metric-value">
                        {s.leads > 0 ? Math.round((s.booked / s.leads) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
