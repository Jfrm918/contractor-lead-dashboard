'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import {
  dashboardMetrics as mockDashboardMetrics,
  funnelData as mockFunnelData,
  leads as mockLeads,
  recentActivity as mockRecentActivity,
  timeAgo,
  getStatusPillClass,
  getUrgencyPillClass,
  type Lead,
  type ActivityEvent,
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

interface DashboardMetrics {
  totalLeads: number;
  missedCalls: number;
  recoveredLeads: number;
  qualifiedLeads: number;
  estimatesBooked: number;
  avgResponseTime: string;
}

interface FunnelData {
  leadsIn: number;
  contacted: number;
  qualified: number;
  booked: number;
}

export default function OverviewPage({ onViewLead }: OverviewPageProps) {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>(mockDashboardMetrics);
  const [funnelDataState, setFunnelDataState] = useState<FunnelData>(mockFunnelData);
  const [allLeads, setAllLeads] = useState<Lead[]>(mockLeads);
  const activity: ActivityEvent[] = mockRecentActivity;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          fetch('/api/leads/stats'),
          fetch('/api/leads?limit=20'),
        ]);

        if (cancelled) return;

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.success && statsJson.data) {
            setDashboardMetrics(statsJson.data.metrics);
            setFunnelDataState(statsJson.data.funnel);
          }
        }

        if (leadsRes.ok) {
          const leadsJson = await leadsRes.json();
          if (leadsJson.success && leadsJson.data) {
            setAllLeads(leadsJson.data);
          }
        }
      } catch {
        // Keep mock data on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const metrics = [
    { label: 'Total Leads', value: dashboardMetrics.totalLeads, icon: Users, color: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.10)', innerGlow: 'inner-glow-blue' },
    { label: 'Missed Calls', value: dashboardMetrics.missedCalls, icon: PhoneMissed, color: 'text-red-400', glow: 'rgba(248, 113, 113, 0.10)', innerGlow: 'inner-glow-red' },
    { label: 'Recovered', value: dashboardMetrics.recoveredLeads, icon: PhoneForwarded, color: 'text-cyan-400', glow: 'rgba(34, 211, 238, 0.10)', innerGlow: 'inner-glow-cyan' },
    { label: 'Qualified', value: dashboardMetrics.qualifiedLeads, icon: UserCheck, color: 'text-emerald-400', glow: 'rgba(52, 211, 153, 0.10)', innerGlow: 'inner-glow-emerald' },
    { label: 'Estimates Booked', value: dashboardMetrics.estimatesBooked, icon: CalendarCheck, color: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.10)', innerGlow: 'inner-glow-amber' },
    { label: 'Avg Response', value: dashboardMetrics.avgResponseTime, icon: Clock, color: 'text-purple-400', glow: 'rgba(139, 92, 246, 0.10)', innerGlow: 'inner-glow-purple' },
  ];

  const hotLeads = allLeads
    .filter((l) => l.urgency === 'Urgent' && l.status !== 'Booked' && l.status !== 'Closed Lost')
    .slice(0, 4);

  const conversations = allLeads
    .filter((l) => l.conversation && l.conversation.length > 2)
    .slice(0, 4);

  const recoveredCount = allLeads.filter((l) => l.recovered).length;
  const missedCount = allLeads.filter((l) => l.missedCall).length;

  const funnelSteps = [
    { label: 'Leads In', value: funnelDataState.leadsIn, pct: 100 },
    { label: 'Contacted', value: funnelDataState.contacted, pct: funnelDataState.leadsIn > 0 ? Math.round((funnelDataState.contacted / funnelDataState.leadsIn) * 100) : 0 },
    { label: 'Qualified', value: funnelDataState.qualified, pct: funnelDataState.leadsIn > 0 ? Math.round((funnelDataState.qualified / funnelDataState.leadsIn) * 100) : 0 },
    { label: 'Booked', value: funnelDataState.booked, pct: funnelDataState.leadsIn > 0 ? Math.round((funnelDataState.booked / funnelDataState.leadsIn) * 100) : 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-white via-white to-blue-200/80 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Today&apos;s lead activity overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill pill-new">Today</span>
          <span className="text-xs text-[var(--text-tertiary)]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Metric cards */}
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
                  <span className="text-xs text-[var(--text-secondary)]">{step.label}</span>
                  <span className="text-sm font-semibold metric-value">{step.value}</span>
                </div>
                <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}>
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
              <span className="text-lg text-[var(--text-tertiary)] ml-1">/ {missedCount || 1}</span>
            </div>
            <span className="text-sm text-emerald-400 font-medium pb-1">
              {missedCount > 0 ? Math.round((recoveredCount / missedCount) * 100) : 0}% recovery rate
            </span>
          </div>
          <div className="space-y-1.5">
            {allLeads.filter(l => l.recovered).slice(0, 4).map(l => (
              <button
                key={l.id}
                onClick={() => onViewLead(l.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl interactive-row text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PhoneForwarded className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="text-sm truncate">{l.name}</span>
                </div>
                <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0 ml-2">{l.service}</span>
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
            {hotLeads.length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)]">No urgent leads right now.</p>
            )}
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
                <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
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
            {activity.slice(0, 8).map((evt) => {
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
                    <p className="text-sm text-[var(--text-primary)] leading-snug">{evt.description}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{evt.leadName} · {timeAgo(evt.timestamp)}</p>
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
            {conversations.length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)]">No conversations yet today.</p>
            )}
            {conversations.map((l) => {
              const lastMsg = l.conversation[l.conversation.length - 1];
              return (
                <button
                  key={l.id}
                  onClick={() => onViewLead(l.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl interactive-row text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-sm font-medium text-[var(--text-secondary)] border border-white/[0.06]">
                    {l.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{l.name}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{timeAgo(lastMsg.timestamp)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
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
