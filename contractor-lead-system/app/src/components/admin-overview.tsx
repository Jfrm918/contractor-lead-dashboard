'use client';

import { motion } from 'framer-motion';
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
} from 'lucide-react';
import {
  adminMetrics,
  clientAccounts,
  supportTasks,
  getHealthColor,
  timeAgo,
} from '@/lib/data';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

interface AdminOverviewProps {
  onViewClient: (id: string) => void;
}

export default function AdminOverview({ onViewClient }: AdminOverviewProps) {
  const am = adminMetrics;

  const topMetrics = [
    { label: 'Total Clients', value: am.totalClients, icon: Building2, color: 'text-purple-400' },
    { label: 'Active', value: am.activeClients, icon: Users, color: 'text-emerald-400' },
    { label: 'Trial', value: am.trialClients, icon: Activity, color: 'text-blue-400' },
    { label: 'Total Leads', value: am.totalLeadsAllClients, icon: TrendingUp, color: 'text-cyan-400' },
    { label: 'Recovered', value: am.recoveredLeadsAllClients, icon: PhoneForwarded, color: 'text-cyan-400' },
    { label: 'Booked', value: am.bookedEstimatesAllClients, icon: CalendarCheck, color: 'text-amber-400' },
  ];

  const needsAttention = clientAccounts.filter(c => c.workflowHealth !== 'Healthy');
  const openTasks = supportTasks.filter(t => t.status !== 'Resolved');
  const onboardingClients = clientAccounts.filter(c => c.status === 'Onboarding' || c.status === 'Trial');

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
          <span className="text-xs text-[#64748b]">Apr 24, 2026</span>
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
                  {client.openIssues.slice(0, 2).map((issue, idx) => (
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
            {onboardingClients.map(client => {
              const completed = client.onboardingSteps.filter(s => s.completed).length;
              const total = client.onboardingSteps.length;
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
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.onboardingSteps.map((step, idx) => (
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
              {clientAccounts.map(client => (
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
          {clientAccounts.map(client => (
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
