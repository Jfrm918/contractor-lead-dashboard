'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  DollarSign,
  Activity,
  CheckCircle2,
  Circle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  clientAccounts as mockClientAccounts,
  supportTasks as mockSupportTasks,
  getHealthColor,
  getHealthBg,
  timeAgo,
  type ClientAccount,
  type SupportTask,
} from '@/lib/data';

interface AdminClientDetailProps {
  clientId: string;
  onBack: () => void;
}

export default function AdminClientDetail({ clientId, onBack }: AdminClientDetailProps) {
  const [client, setClient] = useState<ClientAccount | null>(null);
  const [clientTasks, setClientTasks] = useState<SupportTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setClient(json.data);
            if (json.data.tasks) {
              setClientTasks(json.data.tasks);
            } else {
              setClientTasks(mockSupportTasks.filter(t => t.clientId === clientId));
            }
            return;
          }
        }
        // Fallback to mock
        const mockClient = mockClientAccounts.find(c => c.id === clientId) ?? null;
        setClient(mockClient);
        setClientTasks(mockSupportTasks.filter(t => t.clientId === clientId));
      } catch {
        const mockClient = mockClientAccounts.find(c => c.id === clientId) ?? null;
        setClient(mockClient);
        setClientTasks(mockSupportTasks.filter(t => t.clientId === clientId));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClient();
    return () => { cancelled = true; };
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-[var(--text-tertiary)]">Client not found.</p>
        <button onClick={onBack} className="btn-primary px-4 py-2 mt-4 text-sm">Go back</button>
      </div>
    );
  }

  const steps = client.onboardingSteps || [];
  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length || 1;
  const pct = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="glass-button p-2.5 flex-shrink-0 mt-0.5">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{client.companyName}</h1>
            <div className="flex items-center gap-2">
              <span className={`pill border ${
                client.status === 'Active' ? 'bg-emerald-400/12 text-emerald-400 border-emerald-400/20' :
                client.status === 'Trial' ? 'bg-blue-400/12 text-blue-400 border-blue-400/20' :
                client.status === 'Onboarding' ? 'bg-purple-400/12 text-purple-400 border-purple-400/20' :
                'bg-amber-400/12 text-amber-400 border-amber-400/20'
              }`}>{client.status}</span>
              <span className={`pill border ${getHealthBg(client.workflowHealth)} ${getHealthColor(client.workflowHealth)}`}>
                {client.workflowHealth}
              </span>
            </div>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{client.trade} · {client.serviceArea || client.city}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-1">
          {/* Client summary */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="glass p-5"
          >
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              Client Info
            </h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-[var(--text-secondary)]">{client.assignedNumber || 'Not assigned'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-[var(--text-secondary)]">{client.city || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-[var(--text-secondary)]">{client.plan} — ${client.monthlyPrice}/mo</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Activity className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-[var(--text-secondary)]">Owner: {client.ownerName || 'N/A'}</span>
              </div>
            </div>
          </motion.div>

          {/* Lead volume snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="glass p-5"
          >
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Lead Volume
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Total</p>
                <p className="text-xl font-semibold metric-value">{client.totalLeads}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Recovered</p>
                <p className="text-xl font-semibold metric-value text-cyan-400">{client.recoveredLeads}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Booked</p>
                <p className="text-xl font-semibold metric-value text-amber-400">{client.bookedEstimates}</p>
              </div>
            </div>
            {client.totalLeads > 0 && (
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-tertiary)]">Recovery Rate</span>
                  <span className="text-emerald-400 font-medium">{Math.round((client.recoveredLeads / client.totalLeads) * 100)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-[var(--text-tertiary)]">Booking Rate</span>
                  <span className="text-amber-400 font-medium">{Math.round((client.bookedEstimates / client.totalLeads) * 100)}%</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Workflow status */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="glass p-5"
          >
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className={`w-4 h-4 ${getHealthColor(client.workflowHealth)}`} />
              Workflow Status
            </h2>
            <div className={`p-3 rounded-xl border ${getHealthBg(client.workflowHealth)} mb-3`}>
              <p className={`text-sm font-medium ${getHealthColor(client.workflowHealth)}`}>{client.workflowHealth}</p>
            </div>
            {(client.openIssues || []).length > 0 && (
              <div className="space-y-2">
                {client.openIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)]">{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Onboarding checklist */}
          {steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="glass p-5"
            >
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Onboarding ({completedSteps}/{totalSteps})
              </h2>
              <div className="progress-track mb-4">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      step.completed
                        ? 'bg-emerald-400/[0.04] border-emerald-400/10'
                        : 'bg-white/[0.02] border-white/[0.05]'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm ${step.completed ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>{step.step}</p>
                      {step.completedDate && (
                        <p className="text-xs text-[var(--text-faint)]">{step.completedDate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Script notes */}
          {client.scriptNotes && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.12 }}
              className="glass p-5"
            >
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Script / Qualification Notes
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{client.scriptNotes}</p>
            </motion.div>
          )}

          {/* Open tasks */}
          {clientTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.16 }}
              className="glass p-5"
            >
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Open Tasks ({clientTasks.length})
              </h2>
              <div className="space-y-2">
                {clientTasks.map(task => {
                  const priorityColor = task.priority === 'High' ? 'text-red-400' : task.priority === 'Medium' ? 'text-amber-400' : 'text-[var(--text-tertiary)]';
                  const statusColor = task.status === 'Open' ? 'text-blue-400' : task.status === 'In Progress' ? 'text-amber-400' : 'text-emerald-400';
                  return (
                    <div key={task.id} className="glass-subtle p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm text-[var(--text-primary)]">{task.summary}</p>
                        <span className={`text-xs font-medium flex-shrink-0 ${priorityColor}`}>{task.priority}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={statusColor}>{task.status}</span>
                        <span className="text-[var(--text-faint)]">·</span>
                        <span className="text-[var(--text-tertiary)]">{timeAgo(task.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Recent events */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            className="glass p-5"
          >
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Recent Activity
            </h2>
            <div className="space-y-2">
              {(client.recentEvents || []).length === 0 && (
                <p className="text-sm text-[var(--text-tertiary)]">No recent activity.</p>
              )}
              {(client.recentEvents || []).map((evt, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-primary)] leading-snug">{evt.description}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{timeAgo(evt.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
