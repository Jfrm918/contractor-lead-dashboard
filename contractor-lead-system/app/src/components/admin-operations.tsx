'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import {
  clientAccounts as mockClientAccounts,
  supportTasks as mockSupportTasks,
  operatorActions as mockOperatorActions,
  getHealthColor,
  timeAgo,
  type ClientAccount,
  type SupportTask,
  type OperatorAction,
} from '@/lib/data';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const launchChecklist = [
  'Phone Setup',
  'Script Approved',
  'Workflow Live',
  'First Lead',
  'Scorecard Sent',
];

const addOnFulfillment = [
  { name: 'Local Response Speed Audit™', cadence: 'Setup / optional monthly', ownerWork: 'Pick 3–5 competitors and enter response times.', output: 'Competitive speed gap report' },
  { name: 'Weekly Lost Lead Report', cadence: 'Weekly', ownerWork: 'Review missed/recovered/booked metrics and send 3 actions.', output: 'Owner action summary' },
  { name: 'Lead Leak Calculator™', cadence: 'Live dashboard', ownerWork: 'Confirm avg job value and close rate assumptions.', output: 'Revenue at risk / protected value' },
];

export default function AdminOperations() {
  const [clientAccountsList, setClientAccountsList] = useState<ClientAccount[]>(mockClientAccounts);
  const [supportTasksList, setSupportTasksList] = useState<SupportTask[]>(mockSupportTasks);
  const [operatorActionsList, setOperatorActionsList] = useState<OperatorAction[]>(mockOperatorActions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchClients() {
      try {
        const res = await fetch('/api/clients');
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setClientAccountsList(json.data.clients);
            if (json.data.supportTasks) {
              setSupportTasksList(json.data.supportTasks);
            }
            if (json.data.operatorActions) {
              setOperatorActionsList(json.data.operatorActions);
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

  const openTasks = supportTasksList.filter(t => t.status !== 'Resolved');
  const onboardingClients = clientAccountsList.filter(c => c.status === 'Onboarding' || c.status === 'Trial');
  const clientReadiness = clientAccountsList.map((client) => {
    const completed = launchChecklist.filter((step) => client.onboardingSteps?.some((s) => s.step === step && s.completed)).length;
    const missing = launchChecklist.filter((step) => !client.onboardingSteps?.some((s) => s.step === step && s.completed));
    return { client, completed, total: launchChecklist.length, missing, ready: completed === launchChecklist.length && client.workflowHealth === 'Healthy' };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Loading...</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
        <p className="text-sm text-[#64748b] mt-0.5">System management and operational status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Launch readiness */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Client Launch Readiness
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {clientReadiness.map(({ client, completed, total, missing, ready }) => (
              <div key={client.id} className="glass-subtle p-4 rounded-2xl">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">{client.companyName}</p>
                    <p className="text-xs text-[#64748b]">{client.trade} · {client.plan}</p>
                  </div>
                  <span className={`text-xs font-medium ${ready ? 'text-emerald-400' : 'text-amber-400'}`}>{ready ? 'Ready' : `${completed}/${total}`}</span>
                </div>
                <div className="progress-track mb-3">
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${Math.round((completed / total) * 100)}%` }} />
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  {ready ? 'Ready to show as a working client example.' : `Next missing: ${missing[0] ?? 'workflow health fix'}`}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Add-on fulfillment tracker */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-cyan-400" />
            Low-Stress Add-On Fulfillment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {addOnFulfillment.map((addOn) => (
              <div key={addOn.name} className="glass-subtle p-4 rounded-2xl">
                <p className="text-sm font-semibold text-[#e2e8f0]">{addOn.name}</p>
                <p className="text-xs text-purple-300 mt-1">{addOn.cadence}</p>
                <p className="text-xs text-[#94a3b8] mt-3 leading-relaxed"><span className="text-[#cbd5e1]">Operator step:</span> {addOn.ownerWork}</p>
                <p className="text-xs text-emerald-300 mt-2"><span className="text-[#64748b]">Output:</span> {addOn.output}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Automation health */}
        <motion.div
          custom={2}
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
            {clientAccountsList.map(client => (
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
          custom={3}
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
            {clientAccountsList.map(client => (
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
                  ${clientAccountsList.reduce((sum, c) => sum + (c.monthlyPrice || 0), 0).toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support / Tasks queue */}
        <motion.div
          custom={4}
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
            {openTasks.length === 0 && (
              <p className="text-sm text-[#64748b]">No open tasks.</p>
            )}
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
          custom={5}
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
            {operatorActionsList.length === 0 && (
              <p className="text-sm text-[#64748b]">No recent actions.</p>
            )}
            {operatorActionsList.map(action => (
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
          custom={6}
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
            {onboardingClients.length === 0 && (
              <p className="text-sm text-[#64748b]">No clients in onboarding.</p>
            )}
            {onboardingClients.map(client => {
              const steps = client.onboardingSteps || [];
              const completed = steps.filter(s => s.completed).length;
              const total = steps.length || 1;
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
                  {steps.length > 0 && (
                    <>
                      <div className="progress-track mb-3">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {steps.map((step, idx) => (
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
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Script revision notes */}
        <motion.div
          custom={7}
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
            {clientAccountsList.map(client => (
              <div key={client.id} className="glass-subtle p-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{client.companyName}</p>
                  <span className="text-xs text-[#64748b]">· {client.trade}</span>
                </div>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{client.scriptNotes || 'No script notes available.'}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
