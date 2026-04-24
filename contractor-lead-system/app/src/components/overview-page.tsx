'use client';

import { motion } from 'framer-motion';
import {
  Users,
  PhoneMissed,
  PhoneForwarded,
  UserCheck,
  CalendarCheck,
  Clock,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Bell,
} from 'lucide-react';
import {
  dashboardMetrics,
  funnelData,
  leads,
  recentActivity,
  timeAgo,
  getStatusPillClass,
  getUrgencyPillClass,
} from '@/lib/data';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

interface OverviewPageProps {
  onViewLead: (id: string) => void;
}

export default function OverviewPage({ onViewLead }: OverviewPageProps) {
  const metrics = [
    { label: 'Total Leads', value: dashboardMetrics.totalLeads, icon: Users, color: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.08)' },
    { label: 'Missed Calls', value: dashboardMetrics.missedCalls, icon: PhoneMissed, color: 'text-red-400', glow: 'rgba(248, 113, 113, 0.08)' },
    { label: 'Recovered', value: dashboardMetrics.recoveredLeads, icon: PhoneForwarded, color: 'text-cyan-400', glow: 'rgba(34, 211, 238, 0.08)' },
    { label: 'Qualified', value: dashboardMetrics.qualifiedLeads, icon: UserCheck, color: 'text-emerald-400', glow: 'rgba(52, 211, 153, 0.08)' },
    { label: 'Estimates Booked', value: dashboardMetrics.estimatesBooked, icon: CalendarCheck, color: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.08)' },
    { label: 'Avg Response', value: dashboardMetrics.avgResponseTime, icon: Clock, color: 'text-purple-400', glow: 'rgba(139, 92, 246, 0.08)' },
  ];

  const hotLeads = leads
    .filter((l) => l.urgency === 'Urgent' && l.status !== 'Booked' && l.status !== 'Closed Lost')
    .slice(0, 4);

  const conversations = leads
    .filter((l) => l.conversation.length > 2)
    .slice(0, 4);

  const recoveredCount = leads.filter((l) => l.recovered).length;
  const missedCount = leads.filter((l) => l.missedCall).length;

  const funnelSteps = [
    { label: 'Leads In', value: funnelData.leadsIn, pct: 100 },
    { label: 'Contacted', value: funnelData.contacted, pct: Math.round((funnelData.contacted / funnelData.leadsIn) * 100) },
    { label: 'Qualified', value: funnelData.qualified, pct: Math.round((funnelData.qualified / funnelData.leadsIn) * 100) },
    { label: 'Booked', value: funnelData.booked, pct: Math.round((funnelData.booked / funnelData.leadsIn) * 100) },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Today&apos;s lead activity overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill pill-new">Today</span>
          <span className="text-xs text-[#64748b]">Apr 24, 2026</span>
        </div>
      </div>

      {/* Metric cards — enhanced with glow and deeper glass */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="glass p-4 flex flex-col gap-2 interactive-card"
              style={{ boxShadow: `0 0 24px ${m.glow}, 0 2px 8px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.15)` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748b] font-medium">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color} opacity-70`} />
              </div>
              <span className="text-2xl font-semibold metric-value">{m.value}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Funnel */}
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-1"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            Lead Funnel
          </h2>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#94a3b8]">{step.label}</span>
                  <span className="text-sm font-semibold metric-value">{step.value}</span>
                </div>
                <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg,
                        ${i === 0 ? '#3b82f6' : i === 1 ? '#22d3ee' : i === 2 ? '#34d399' : '#fbbf24'},
                        ${i === 0 ? '#60a5fa' : i === 1 ? '#67e8f9' : i === 2 ? '#6ee7b7' : '#fcd34d'})`,
                      boxShadow: `0 0 8px ${i === 0 ? 'rgba(59,130,246,0.3)' : i === 1 ? 'rgba(34,211,238,0.3)' : i === 2 ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recovered Missed Calls */}
        <motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-1"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <PhoneForwarded className="w-4 h-4 text-cyan-400" />
            Recovered Missed Calls
          </h2>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <span className="text-4xl font-bold metric-value text-cyan-400">{recoveredCount}</span>
              <span className="text-lg text-[#64748b] ml-1">/ {missedCount}</span>
            </div>
            <span className="text-sm text-emerald-400 font-medium pb-1">
              {Math.round((recoveredCount / missedCount) * 100)}% recovery rate
            </span>
          </div>
          <div className="space-y-1.5">
            {leads.filter(l => l.recovered).slice(0, 4).map(l => (
              <button
                key={l.id}
                onClick={() => onViewLead(l.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl interactive-row text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PhoneForwarded className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="text-sm truncate">{l.name}</span>
                </div>
                <span className="text-xs text-[#64748b] flex-shrink-0 ml-2">{l.service}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hot Leads */}
        <motion.div
          custom={8}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-1"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            Hot Leads
          </h2>
          <div className="space-y-2">
            {hotLeads.map((l) => (
              <button
                key={l.id}
                onClick={() => onViewLead(l.id)}
                className="w-full glass-subtle p-3 flex flex-col gap-1.5 text-left interactive-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{l.name}</span>
                  <span className={getUrgencyPillClass(l.urgency)}>{l.urgency}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <span>{l.service}</span>
                  <span>·</span>
                  <span>{l.city}</span>
                </div>
                <span className={`${getStatusPillClass(l.status)} self-start`}>{l.status}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <motion.div
          custom={9}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Recent Activity
          </h2>
          <div className="space-y-0.5 max-h-[320px] overflow-y-auto">
            {recentActivity.slice(0, 8).map((evt) => {
              const iconMap = {
                missed_call_recovered: <PhoneForwarded className="w-3.5 h-3.5 text-cyan-400" />,
                lead_replied: <MessageSquare className="w-3.5 h-3.5 text-blue-400" />,
                booking_requested: <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />,
                owner_alert: <Bell className="w-3.5 h-3.5 text-red-400" />,
                lead_qualified: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
              };
              return (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl interactive-row"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {iconMap[evt.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#e2e8f0] leading-snug">{evt.description}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">{evt.leadName} · {timeAgo(evt.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Today's Conversations */}
        <motion.div
          custom={10}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            Today&apos;s Conversations
          </h2>
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
            {conversations.map((l) => {
              const lastMsg = l.conversation[l.conversation.length - 1];
              return (
                <button
                  key={l.id}
                  onClick={() => onViewLead(l.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl interactive-row text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-sm font-medium text-[#94a3b8] border border-white/[0.06]">
                    {l.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{l.name}</span>
                      <span className="text-xs text-[#64748b]">{timeAgo(lastMsg.timestamp)}</span>
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-0.5 truncate">
                      {lastMsg.type === 'outbound' ? 'You: ' : ''}{lastMsg.content}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
