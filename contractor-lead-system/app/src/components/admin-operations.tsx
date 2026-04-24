'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  DollarSign,
  Clipboard,
  FileText,
  Clock,
  Activity,
  Building2,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react';
import {
  clientAccounts,
  supportTasks,
  operatorActions,
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

export default function AdminOperations() {
  const openTasks = supportTasks.filter(t => t.status !== 'Resolved');
  const onboardingClients = clientAccounts.filter(c => c.status === 'Onboarding' || c.status === 'Trial');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
        <p className="text-sm text-[#64748b] mt-0.5">System management and operational status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Automation health */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Automation Health
          </h2>
          <div className="space-y-3">
            {clientAccounts.map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    client.workflowHealth === 'Healthy' ? 'bg-emerald-400' :
                    client.workflowHealth === 'Needs Attention' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{client.companyName}</p>
                    <p className="text-xs text-[#64748b]">{client.trade}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${getHealthColor(client.workflowHealth)}`}>
                  {client.workflowHealth}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Billing summary */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Billing Summary
          </h2>
          <div className="space-y-3">
            {clientAccounts.map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div>
                  <p className="text-sm font-medium">{client.companyName}</p>
                  <p className="text-xs text-[#64748b]">{client.plan} plan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold metric-value">${client.monthlyPrice}/mo</p>
                  <p className={`text-xs ${
                    client.status === 'Active' ? 'text-emerald-400' :
                    client.status === 'Trial' ? 'text-blue-400' :
                    client.status === 'Onboarding' ? 'text-purple-400' : 'text-amber-400'
                  }`}>{client.status}</p>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#94a3b8]">Monthly Total</span>
                <span className="text-lg font-semibold metric-value text-emerald-400">
                  ${clientAccounts.reduce((sum, c) => sum + c.monthlyPrice, 0).toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support / Tasks queue */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-blue-400" />
            Support Queue ({openTasks.length} open)
          </h2>
          <div className="space-y-2">
            {openTasks.map(task => {
              const priorityColor = task.priority === 'High' ? 'pill-urgent' : task.priority === 'Medium' ? 'pill-medium' : 'pill-low';
              return (
                <div key={task.id} className="glass-subtle p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm text-[#e2e8f0] leading-snug">{task.summary}</p>
                    <span className={`pill ${priorityColor} flex-shrink-0`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <Building2 className="w-3 h-3" />
                    <span>{task.clientName}</span>
                    <span>·</span>
                    <span className={task.status === 'Open' ? 'text-blue-400' : 'text-amber-400'}>{task.status}</span>
                    <span>·</span>
                    <span>{timeAgo(task.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent operator actions */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Recent Operator Actions
          </h2>
          <div className="space-y-1">
            {operatorActions.map(action => (
              <div key={action.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-[#e2e8f0] leading-snug">{action.action}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{action.clientName} · {timeAgo(action.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Onboarding tracker */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            Onboarding Tracker
          </h2>
          <div className="space-y-4">
            {onboardingClients.map(client => {
              const completed = client.onboardingSteps.filter(s => s.completed).length;
              const total = client.onboardingSteps.length;
              const pct = Math.round((completed / total) * 100);
              return (
                <div key={client.id} className="glass-subtle p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">{client.companyName}</p>
                      <p className="text-xs text-[#64748b]">{client.trade} · {client.city} · {client.status}</p>
                    </div>
                    <span className="text-xs text-[#94a3b8]">{completed}/{total} complete</span>
                  </div>
                  <div className="progress-track mb-3">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {client.onboardingSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                          step.completed
                            ? 'text-emerald-400'
                            : 'text-[#64748b]'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        <span className="truncate">{step.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Script revision notes */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Script Notes by Client
          </h2>
          <div className="space-y-3">
            {clientAccounts.map(client => (
              <div key={client.id} className="glass-subtle p-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{client.companyName}</p>
                  <span className="text-xs text-[#64748b]">· {client.trade}</span>
                </div>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{client.scriptNotes}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
