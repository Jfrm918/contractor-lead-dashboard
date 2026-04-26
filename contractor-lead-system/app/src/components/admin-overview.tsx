'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  TrendingUp,
  PhoneForwarded,
  CalendarCheck,
  AlertTriangle,
  Clipboard,
  Activity,
  ArrowRight,
  Shield,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  adminMetrics as mockAdminMetrics,
  clientAccounts as mockClientAccounts,
  supportTasks as mockSupportTasks,
  getHealthColor,
  timeAgo,
  type AdminMetrics,
  type ClientAccount,
  type SupportTask,
} from '@/lib/data';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const DEFAULT_BOOKED_JOB_VALUE = 3500;
const DEFAULT_CLOSE_RATE_PCT = 35;

// ─── Health Panel Types & Hook ───

type HealthStatus = 'healthy' | 'degraded' | 'down';

interface SystemHealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  latencyMs?: number;
}

interface HealthResponse {
  overall: HealthStatus;
  checks: SystemHealthCheck[];
  checkedAt: string;
}

function useSystemHealth(pollIntervalMs = 30_000) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/health');
      const json = await res.json();
      if (json.success && json.data) {
        setHealth(json.data as HealthResponse);
        setError(null);
      } else {
        setError(json.error?.message ?? 'Unknown error');
      }
    } catch {
      setError('Failed to reach health endpoint');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, pollIntervalMs);
    return () => clearInterval(id);
  }, [fetchHealth, pollIntervalMs]);

  return { health, loading, error, refetch: fetchHealth };
}

function statusDotColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-400';
    case 'degraded':
      return 'bg-amber-400';
    case 'down':
      return 'bg-red-400';
  }
}

function statusGlowColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return 'shadow-[0_0_8px_rgba(52,211,153,0.5)]';
    case 'degraded':
      return 'shadow-[0_0_8px_rgba(251,191,36,0.5)]';
    case 'down':
      return 'shadow-[0_0_8px_rgba(248,113,113,0.5)]';
  }
}

function statusTextColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return 'text-emerald-400';
    case 'degraded':
      return 'text-amber-400';
    case 'down':
      return 'text-red-400';
  }
}

function statusLabel(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'degraded':
      return 'Degraded';
    case 'down':
      return 'Down';
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

interface AdminOverviewProps {
  onViewClient: (id: string) => void;
}

export default function AdminOverview({ onViewClient }: AdminOverviewProps) {
  const [am, setAm] = useState<AdminMetrics>(mockAdminMetrics);
  const [clientAccountsList, setClientAccountsList] = useState<ClientAccount[]>(mockClientAccounts);
  const [supportTasksList, setSupportTasksList] = useState<SupportTask[]>(mockSupportTasks);
  const [avgBookedJobValue, setAvgBookedJobValue] = useState(DEFAULT_BOOKED_JOB_VALUE);
  const [closeRatePct, setCloseRatePct] = useState(DEFAULT_CLOSE_RATE_PCT);
  const [loading, setLoading] = useState(true);
  const { health, loading: healthLoading, refetch: refetchHealth } = useSystemHealth();

  useEffect(() => {
    let cancelled = false;

    async function fetchClients() {
      try {
        const res = await fetch('/api/clients');
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setAm(json.data.metrics);
            setClientAccountsList(json.data.clients);
            if (json.data.supportTasks) {
              setSupportTasksList(json.data.supportTasks);
            }
          }
        }
      } catch {
        // Keep mock data on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClients();
    return () => { cancelled = true; };
  }, []);

  const topMetrics = [
    { label: 'Total Clients', value: am.totalClients, icon: Building2, color: 'text-purple-400' },
    { label: 'Active', value: am.activeClients, icon: Users, color: 'text-emerald-400' },
    { label: 'Trial', value: am.trialClients, icon: Activity, color: 'text-blue-400' },
    { label: 'Total Leads', value: am.totalLeadsAllClients, icon: TrendingUp, color: 'text-cyan-400' },
    { label: 'Recovered', value: am.recoveredLeadsAllClients, icon: PhoneForwarded, color: 'text-cyan-400' },
    { label: 'Booked', value: am.bookedEstimatesAllClients, icon: CalendarCheck, color: 'text-amber-400' },
  ];

  const needsAttention = clientAccountsList.filter(c => c.workflowHealth !== 'Healthy');
  const openTasks = supportTasksList.filter(t => t.status !== 'Resolved');
  const onboardingClients = clientAccountsList.filter(c => c.status === 'Onboarding' || c.status === 'Trial');
  const totalLeadCount = clientAccountsList.reduce((sum, c) => sum + c.totalLeads, 0);
  const missedCallCount = clientAccountsList.reduce((sum, c) => sum + (c.missedCalls ?? 0), 0);
  const recoveredLeadCount = clientAccountsList.reduce((sum, c) => sum + c.recoveredLeads, 0);
  const bookedEstimateCount = clientAccountsList.reduce((sum, c) => sum + c.bookedEstimates, 0);
  const unrecoveredMissedCallCount = clientAccountsList.reduce((sum, c) => sum + Math.max((c.missedCalls ?? 0) - c.recoveredLeads, 0), 0);
  const recoveredToBookedRate = recoveredLeadCount > 0 ? bookedEstimateCount / recoveredLeadCount : 0;
  const recoveredRevenueProtected = clientAccountsList.reduce((sum, c) => {
    const jobValue = c.avgBookedJobValue || avgBookedJobValue;
    const clientCloseRate = Math.max(Math.min(c.closeRatePct || closeRatePct, 100), 0) / 100;
    return sum + (c.bookedEstimates * jobValue * clientCloseRate);
  }, 0);
  const estimatedLeakValue = clientAccountsList.reduce((sum, c) => {
    const unrecoveredMissedCalls = Math.max((c.missedCalls ?? 0) - c.recoveredLeads, 0);
    const clientRecoveredToBookedRate = c.recoveredLeads > 0 ? c.bookedEstimates / c.recoveredLeads : recoveredToBookedRate;
    const jobValue = c.avgBookedJobValue || avgBookedJobValue;
    const clientCloseRate = Math.max(Math.min(c.closeRatePct || closeRatePct, 100), 0) / 100;
    return sum + (unrecoveredMissedCalls * clientRecoveredToBookedRate * jobValue * clientCloseRate);
  }, 0);
  const weightedAvgJobValue = bookedEstimateCount > 0
    ? clientAccountsList.reduce((sum, c) => sum + (c.bookedEstimates * (c.avgBookedJobValue || avgBookedJobValue)), 0) / bookedEstimateCount
    : avgBookedJobValue;
  const weightedCloseRatePct = bookedEstimateCount > 0
    ? clientAccountsList.reduce((sum, c) => sum + (c.bookedEstimates * (c.closeRatePct || closeRatePct)), 0) / bookedEstimateCount
    : closeRatePct;
  const ownerActionCount = openTasks.length + needsAttention.length;

  const lrpMetrics = [
    { label: 'Missed-call value at risk', value: formatCurrency(estimatedLeakValue), note: `${unrecoveredMissedCallCount} missed calls not recovered × client values/close rates`, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Revenue protected', value: formatCurrency(recoveredRevenueProtected), note: `${bookedEstimateCount} booked estimates × actual client close-rate data`, icon: PhoneForwarded, color: 'text-cyan-400' },
    { label: 'Recovered-to-booked', value: `${Math.round(recoveredToBookedRate * 100)}%`, note: `${bookedEstimateCount} booked from ${recoveredLeadCount} recovered leads`, icon: CalendarCheck, color: 'text-emerald-400' },
    { label: 'Owner actions', value: ownerActionCount, note: `${openTasks.length} open tasks + ${needsAttention.length} workflow issues`, icon: Activity, color: 'text-purple-400' },
  ];

  const lrpPipeline = [
    { stage: 'Leads tracked', count: totalLeadCount, detail: 'All inbound opportunities currently visible across client dashboards' },
    { stage: 'Missed calls', count: missedCallCount, detail: 'Actual missed-call count pulled from client lead records' },
    { stage: 'Recovered by LRP', count: recoveredLeadCount, detail: 'Leads pulled back into conversation after missed or delayed follow-up' },
    { stage: 'Booked estimates', count: bookedEstimateCount, detail: 'Recovered/followed-up leads that became scheduled estimate opportunities' },
  ];

  const lrpOwnerActions = [
    ...(needsAttention.length > 0 ? [`Fix ${needsAttention.length} workflow issue${needsAttention.length === 1 ? '' : 's'} before more leads leak.`] : []),
    ...(openTasks.length > 0 ? [`Clear ${openTasks.length} open operator task${openTasks.length === 1 ? '' : 's'} tied to client follow-up.`] : []),
    `Current weighted client value: ${formatCurrency(weightedAvgJobValue)} average job value at ${Math.round(weightedCloseRatePct)}% close rate.`,
    'Review this section weekly: if revenue protected is not above monthly fee, tighten script, speed, or target client.',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operator Command Center</h1>
          <p className="text-sm text-[#64748b] mt-0.5">System overview across all clients</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.25)' }}>Admin</span>
          <span className="text-xs text-[#64748b]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* System Health Panel */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            System Health
          </h2>
          <div className="flex items-center gap-3">
            {health && (
              <span className={`text-xs font-medium ${statusTextColor(health.overall)}`}>
                {statusLabel(health.overall)}
              </span>
            )}
            <button
              onClick={refetchHealth}
              className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors"
              title="Refresh health checks"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#64748b] ${healthLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {healthLoading && !health ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="glass-subtle p-3 animate-pulse">
                  <div className="h-3 w-20 bg-white/[0.06] rounded mb-2" />
                  <div className="h-2 w-28 bg-white/[0.04] rounded" />
                </div>
              ))}
            </motion.div>
          ) : health ? (
            <motion.div
              key="loaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {health.checks.map((check, i) => (
                <motion.div
                  key={check.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  className="glass-subtle p-3"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${statusDotColor(check.status)} ${statusGlowColor(check.status)}`}
                    />
                    <span className="text-xs font-medium text-[#e2e8f0]">{check.name}</span>
                  </div>
                  <p className="text-[11px] text-[#64748b] leading-relaxed">{check.message}</p>
                  {check.latencyMs !== undefined && (
                    <p className="text-[10px] text-[#475569] mt-1">{check.latencyMs}ms</p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-400"
            >
              Unable to load system health
            </motion.p>
          )}
        </AnimatePresence>

        {health && (
          <p className="text-[10px] text-[#475569] mt-3">
            Last checked {new Date(health.checkedAt).toLocaleTimeString()} — polling every 30s
          </p>
        )}
      </motion.div>

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

      {/* LRP operating dashboard */}
      <motion.div
        custom={6}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PhoneForwarded className="w-4 h-4 text-cyan-400" />
              <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">LRP Operating Dashboard</p>
            </div>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">Recover paid leads before they buy from someone else</h2>
            <p className="text-sm text-[#94a3b8] mt-1 max-w-3xl">
              Money view for contractors: missed-call recovery, instant follow-up, qualification, booked estimates, and daily owner action.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
            <p className="text-xs text-emerald-300">Core sales promise</p>
            <p className="text-sm font-semibold text-[#e2e8f0]">Convert more of the leads already being paid for.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          {lrpMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="glass-subtle p-4 rounded-2xl">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs text-[#64748b] font-medium">{metric.label}</p>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <p className="text-2xl font-semibold metric-value text-[#e2e8f0]">{metric.value}</p>
                <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{metric.note}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="glass-subtle p-4 rounded-2xl md:col-span-2">
            <p className="text-sm font-semibold text-[#e2e8f0] mb-2">Client value + close-rate data</p>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              LRP now calculates from missed-call counts, recovered leads, booked estimates, each client&apos;s average booked job value, and each client&apos;s close rate. The inputs only fill gaps when a client does not have value data yet.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-[#94a3b8]">
              Fallback job value
              <input
                type="number"
                min="0"
                step="100"
                value={avgBookedJobValue}
                onChange={(event) => setAvgBookedJobValue(Number(event.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-cyan-400/40"
              />
            </label>
            <label className="text-xs text-[#94a3b8]">
              Fallback close %
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={closeRatePct}
                onChange={(event) => setCloseRatePct(Number(event.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-cyan-400/40"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="glass-subtle p-4 rounded-2xl xl:col-span-2">
            <p className="text-sm font-semibold mb-3 text-[#e2e8f0]">Lead recovery pipeline</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {lrpPipeline.map((stage, idx) => (
                <div key={stage.stage} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] text-[#64748b]">STEP {idx + 1}</span>
                    <span className="text-lg font-semibold metric-value text-cyan-300">{stage.count}</span>
                  </div>
                  <p className="text-sm font-medium text-[#e2e8f0]">{stage.stage}</p>
                  <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{stage.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-subtle p-4 rounded-2xl">
            <p className="text-sm font-semibold mb-3 text-[#e2e8f0]">Owner daily action list</p>
            <div className="space-y-2">
              {lrpOwnerActions.map((action) => (
                <div key={action} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                  <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Workflows needing attention */}
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Workflows Needing Attention
          </h2>
          {needsAttention.length === 0 ? (
            <p className="text-sm text-[#64748b]">All workflows healthy</p>
          ) : (
            <div className="space-y-2">
              {needsAttention.map(client => (
                <button
                  key={client.id}
                  onClick={() => onViewClient(client.id)}
                  className="w-full glass-subtle p-3 text-left interactive-card"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{client.companyName}</span>
                    <span className={`text-xs font-medium ${getHealthColor(client.workflowHealth)}`}>{client.workflowHealth}</span>
                  </div>
                  {(client.openIssues || []).slice(0, 2).map((issue, idx) => (
                    <p key={idx} className="text-xs text-[#94a3b8] leading-relaxed">{issue}</p>
                  ))}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Open support tasks */}
        <motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-blue-400" />
            Open Tasks ({openTasks.length})
          </h2>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {openTasks.length === 0 && (
              <p className="text-sm text-[#64748b]">No open tasks.</p>
            )}
            {openTasks.slice(0, 6).map(task => {
              const priorityColor = task.priority === 'High' ? 'text-red-400' : task.priority === 'Medium' ? 'text-amber-400' : 'text-[#64748b]';
              return (
                <div key={task.id} className="glass-subtle p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm text-[#e2e8f0] leading-snug">{task.summary}</p>
                    <span className={`text-xs font-medium flex-shrink-0 ${priorityColor}`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <span>{task.clientName}</span>
                    <span>·</span>
                    <span>{timeAgo(task.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Onboarding progress */}
        <motion.div
          custom={8}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-purple-400" />
            Onboarding Progress
          </h2>
          <div className="space-y-3">
            {onboardingClients.length === 0 && (
              <p className="text-sm text-[#64748b]">No clients onboarding.</p>
            )}
            {onboardingClients.map(client => {
              const steps = client.onboardingSteps || [];
              const completed = steps.filter(s => s.completed).length;
              const total = steps.length || 1;
              const pct = Math.round((completed / total) * 100);
              return (
                <button
                  key={client.id}
                  onClick={() => onViewClient(client.id)}
                  className="w-full text-left glass-subtle p-3 interactive-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{client.companyName}</span>
                    <span className="text-xs text-[#64748b]">{completed}/{total}</span>
                  </div>
                  {steps.length > 0 && (
                    <>
                      <div className="progress-track">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {steps.map((step, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                              step.completed
                                ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                                : 'bg-white/[0.03] text-[#64748b] border border-white/[0.06]'
                            }`}
                          >
                            {step.step}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Client quick roster */}
      <motion.div
        custom={9}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-5"
      >
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          Client Roster
        </h2>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-2.5">Company</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-2.5">Trade</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-2.5">City</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-2.5">Status</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-2.5">Plan</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-2.5">Health</th>
                <th className="text-right text-xs font-medium text-[#64748b] px-4 py-2.5">Leads</th>
                <th className="text-right text-xs font-medium text-[#64748b] px-4 py-2.5">Booked</th>
                <th className="text-left text-xs font-medium text-[#64748b] px-4 py-2.5">Activity</th>
              </tr>
            </thead>
            <tbody>
              {clientAccountsList.map(client => (
                <tr
                  key={client.id}
                  onClick={() => onViewClient(client.id)}
                  className="border-b border-white/[0.03] interactive-row"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{client.companyName}</p>
                    <p className="text-xs text-[#64748b]">{client.ownerName}</p>
                  </td>
                  <td className="px-4 py-3 text-[#94a3b8]">{client.trade}</td>
                  <td className="px-4 py-3 text-[#94a3b8]">{client.city}</td>
                  <td className="px-4 py-3">
                    <span className={`pill border ${
                      client.status === 'Active' ? 'bg-emerald-400/12 text-emerald-400 border-emerald-400/20' :
                      client.status === 'Trial' ? 'bg-blue-400/12 text-blue-400 border-blue-400/20' :
                      client.status === 'Onboarding' ? 'bg-purple-400/12 text-purple-400 border-purple-400/20' :
                      'bg-amber-400/12 text-amber-400 border-amber-400/20'
                    }`}>{client.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#94a3b8]">{client.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${getHealthColor(client.workflowHealth)}`}>{client.workflowHealth}</span>
                  </td>
                  <td className="px-4 py-3 text-right metric-value text-[#94a3b8]">{client.totalLeads}</td>
                  <td className="px-4 py-3 text-right metric-value text-[#94a3b8]">{client.bookedEstimates}</td>
                  <td className="px-4 py-3 text-xs text-[#64748b]">{timeAgo(client.lastActivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {clientAccountsList.map(client => (
            <button
              key={client.id}
              onClick={() => onViewClient(client.id)}
              className="w-full glass-subtle p-4 text-left interactive-card"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{client.companyName}</p>
                  <p className="text-xs text-[#64748b]">{client.trade} · {client.city}</p>
                </div>
                <span className={`text-xs font-medium ${getHealthColor(client.workflowHealth)}`}>{client.workflowHealth}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                <span>{client.totalLeads} leads</span>
                <span>{client.bookedEstimates} booked</span>
                <span className="text-[#64748b]">{timeAgo(client.lastActivity)}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
