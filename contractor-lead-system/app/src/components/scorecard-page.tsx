'use client';

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
} from 'lucide-react';
import { scorecardData } from '@/lib/data';
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
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

const barColors = ['#3b82f6', '#22d3ee', '#34d399', '#fbbf24'];

export default function ScorecardPage() {
  const sc = scorecardData;

  const topMetrics = [
    { label: 'Total Inbound', value: sc.totalInbound, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Missed Calls', value: sc.missedCalls, icon: Phone, color: 'text-red-400' },
    { label: 'Recovered', value: sc.recoveredMissedCalls, icon: PhoneForwarded, color: 'text-cyan-400' },
    { label: 'Qualified', value: sc.qualifiedLeads, icon: UserCheck, color: 'text-emerald-400' },
    { label: 'Booked', value: sc.bookedEstimates, icon: CalendarCheck, color: 'text-amber-400' },
    { label: 'Avg Response', value: sc.avgResponseTime, icon: Clock, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monthly Scorecard</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{sc.month}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-400 font-medium flex items-center gap-1">
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
              className="glass p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748b] font-medium">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color} opacity-60`} />
              </div>
              <span className="text-2xl font-semibold metric-value">{m.value}</span>
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
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="leads" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {sc.sourceBreakdown.map((_, i) => (
                    <Cell key={i} fill={barColors[i]} fillOpacity={0.7} />
                  ))}
                </Bar>
                <Bar dataKey="booked" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {sc.sourceBreakdown.map((_, i) => (
                    <Cell key={i} fill={barColors[i]} fillOpacity={0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/70" /> Leads
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/30" /> Booked
            </span>
          </div>
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
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="leads" fill="#3b82f6" fillOpacity={0.6} radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="booked" fill="#34d399" fillOpacity={0.6} radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/60" /> Leads
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/60" /> Booked
            </span>
          </div>
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
            <p className="text-xs text-[#64748b] mb-1">Ad Spend</p>
            <p className="text-xl font-semibold metric-value">${sc.roi.adSpend.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-1">Est. Revenue</p>
            <p className="text-xl font-semibold metric-value text-emerald-400">${sc.roi.estimatedRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-1">Cost / Lead</p>
            <p className="text-xl font-semibold metric-value">${sc.roi.costPerLead}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-1">Cost / Booking</p>
            <p className="text-xl font-semibold metric-value">${sc.roi.costPerBooking}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-1">Booking Rate</p>
            <p className="text-xl font-semibold metric-value text-amber-400">{sc.roi.bookingRate}%</p>
          </div>
        </div>
      </motion.div>

      {/* Source details table */}
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
                <th className="text-left text-xs font-medium text-[#64748b] px-5 py-2.5">Source</th>
                <th className="text-right text-xs font-medium text-[#64748b] px-5 py-2.5">Leads</th>
                <th className="text-right text-xs font-medium text-[#64748b] px-5 py-2.5">Booked</th>
                <th className="text-right text-xs font-medium text-[#64748b] px-5 py-2.5">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {sc.sourceBreakdown.map((s) => (
                <tr key={s.source} className="border-b border-white/[0.03]">
                  <td className="px-5 py-3 font-medium">{s.source}</td>
                  <td className="px-5 py-3 text-right text-[#94a3b8] metric-value">{s.leads}</td>
                  <td className="px-5 py-3 text-right text-[#94a3b8] metric-value">{s.booked}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-emerald-400 metric-value">
                      {Math.round((s.booked / s.leads) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
