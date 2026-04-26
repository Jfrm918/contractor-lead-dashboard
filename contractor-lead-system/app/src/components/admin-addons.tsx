'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calculator,
  ClipboardList,
  Crosshair,
  Download,
  Gauge,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  clientAccounts as mockClientAccounts,
  supportTasks as mockSupportTasks,
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

type AuditChannel = 'call' | 'text' | 'email' | 'none';
type AuditQuality = 'weak' | 'average' | 'strong';

interface AuditRow {
  id: string;
  competitor: string;
  testedAt: string;
  responseMinutes: number;
  channel: AuditChannel;
  quality: AuditQuality;
  notes: string;
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function SectionCard({ title, icon: Icon, children, index = 0 }: {
  title: string;
  icon: typeof Calculator;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={cardVariants} className="glass p-5">
      <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-cyan-400" />
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

export default function AdminAddOns() {
  const [clients, setClients] = useState<ClientAccount[]>(mockClientAccounts);
  const [tasks, setTasks] = useState<SupportTask[]>(mockSupportTasks);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(mockClientAccounts[0]?.id ?? '');
  const [fallbackJobValue, setFallbackJobValue] = useState(3500);
  const [fallbackCloseRate, setFallbackCloseRate] = useState(35);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([
    { id: 'audit-1', competitor: 'Fast Response HVAC', testedAt: '2026-04-26T09:15', responseMinutes: 8, channel: 'call', quality: 'strong', notes: 'Called back quickly and offered a same-day slot.' },
    { id: 'audit-2', competitor: 'Metro Contractor Co.', testedAt: '2026-04-26T09:20', responseMinutes: 22, channel: 'text', quality: 'average', notes: 'Text reply was fast enough, but no firm next step.' },
    { id: 'audit-3', competitor: 'No Call Back Pros', testedAt: '2026-04-26T09:25', responseMinutes: 180, channel: 'none', quality: 'weak', notes: 'No response inside three hours.' },
  ]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/clients');
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.clients) {
            setClients(json.data.clients);
            if (json.data.supportTasks) setTasks(json.data.supportTasks);
            if (!selectedClientId && json.data.clients[0]?.id) setSelectedClientId(json.data.clients[0].id);
          }
        }
      } catch {
        // keep mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedClientId]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? clients[0];
  const clientTasks = tasks.filter((t) => t.clientId === selectedClient?.id && t.status !== 'Resolved');

  const metrics = useMemo(() => {
    if (!selectedClient) {
      return {
        missedCalls: 0,
        recovered: 0,
        booked: 0,
        unrecovered: 0,
        recoveredToBooked: 0,
        jobValue: fallbackJobValue,
        closeRate: fallbackCloseRate / 100,
        protectedValue: 0,
        atRiskValue: 0,
        roiMultiple: 0,
      };
    }

    const missedCalls = selectedClient.missedCalls ?? 0;
    const recovered = selectedClient.recoveredLeads ?? 0;
    const booked = selectedClient.bookedEstimates ?? 0;
    const unrecovered = Math.max(missedCalls - recovered, 0);
    const recoveredToBooked = recovered > 0 ? booked / recovered : 0;
    const jobValue = selectedClient.avgBookedJobValue || fallbackJobValue;
    const closeRate = Math.max(Math.min(selectedClient.closeRatePct || fallbackCloseRate, 100), 0) / 100;
    const protectedValue = booked * jobValue * closeRate;
    const atRiskValue = unrecovered * recoveredToBooked * jobValue * closeRate;
    const monthlyPrice = selectedClient.monthlyPrice || 750;
    const roiMultiple = monthlyPrice > 0 ? protectedValue / monthlyPrice : 0;

    return { missedCalls, recovered, booked, unrecovered, recoveredToBooked, jobValue, closeRate, protectedValue, atRiskValue, roiMultiple };
  }, [selectedClient, fallbackJobValue, fallbackCloseRate]);

  const auditAverage = auditRows.length > 0
    ? Math.round(auditRows.reduce((sum, row) => sum + row.responseMinutes, 0) / auditRows.length)
    : 0;
  const clientResponseMinutes = selectedClient?.workflowHealth === 'Healthy' ? 1 : 45;
  const speedGap = Math.max(clientResponseMinutes - auditAverage, 0);
  const auditWinner = clientResponseMinutes <= auditAverage ? 'Client / LRP wins' : 'Competitors currently faster';

  const weeklyReport = selectedClient ? [
    `Weekly Lost Lead Report — ${selectedClient.companyName}`,
    `Missed calls tracked: ${metrics.missedCalls}`,
    `Recovered leads: ${metrics.recovered}`,
    `Unrecovered missed calls: ${metrics.unrecovered}`,
    `Booked estimates: ${metrics.booked}`,
    `Estimated revenue protected: ${currency(metrics.protectedValue)}`,
    `Estimated value still at risk: ${currency(metrics.atRiskValue)}`,
    '',
    'Recommended owner actions:',
    metrics.unrecovered > 0 ? `1. Call or text the ${metrics.unrecovered} unrecovered missed lead${metrics.unrecovered === 1 ? '' : 's'} before they go cold.` : '1. Keep current missed-call response workflow active; no unrecovered missed calls showing.',
    clientTasks.length > 0 ? `2. Clear ${clientTasks.length} open task${clientTasks.length === 1 ? '' : 's'} blocking better follow-up.` : '2. No open support tasks; review script performance instead.',
    `3. Keep average response under ${Math.max(auditAverage, 1)} minutes to beat local market speed.`,
  ].join('\n') : '';

  function updateAudit(id: string, patch: Partial<AuditRow>) {
    setAuditRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  function addAuditRow() {
    setAuditRows((rows) => [
      ...rows,
      { id: `audit-${Date.now()}`, competitor: 'New competitor', testedAt: new Date().toISOString().slice(0, 16), responseMinutes: 30, channel: 'call', quality: 'average', notes: '' },
    ]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add-On Tools</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Functional fulfillment workspace for the low-stress LRP value stack</p>
        </div>
        <select
          value={selectedClient?.id ?? ''}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#e2e8f0] outline-none"
        >
          {clients.map((client) => <option key={client.id} value={client.id}>{client.companyName}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Lead Leak Calculator™" icon={Calculator} index={0}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              ['Missed', metrics.missedCalls],
              ['Recovered', metrics.recovered],
              ['Booked', metrics.booked],
              ['Unrecovered', metrics.unrecovered],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <p className="text-xs text-[#64748b]">{label}</p>
                <p className="text-xl font-semibold metric-value text-[#e2e8f0]">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <label className="text-xs text-[#94a3b8]">Fallback job value
              <input type="number" value={fallbackJobValue} onChange={(e) => setFallbackJobValue(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#e2e8f0] outline-none" />
            </label>
            <label className="text-xs text-[#94a3b8]">Fallback close %
              <input type="number" value={fallbackCloseRate} onChange={(e) => setFallbackCloseRate(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#e2e8f0] outline-none" />
            </label>
          </div>
          <div className="space-y-2">
            <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-3">
              <p className="text-xs text-emerald-300">Revenue protected</p>
              <p className="text-2xl font-semibold metric-value text-[#e2e8f0]">{currency(metrics.protectedValue)}</p>
            </div>
            <div className="rounded-xl bg-red-400/10 border border-red-400/20 p-3">
              <p className="text-xs text-red-300">Missed-call value still at risk</p>
              <p className="text-2xl font-semibold metric-value text-[#e2e8f0]">{currency(metrics.atRiskValue)}</p>
            </div>
            <p className="text-xs text-[#94a3b8]">ROI vs monthly fee: <span className="text-cyan-300">{metrics.roiMultiple.toFixed(1)}x</span></p>
          </div>
        </SectionCard>

        <SectionCard title="Weekly Lost Lead Report" icon={ClipboardList} index={1}>
          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 min-h-[300px]">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-[#cbd5e1] font-sans">{weeklyReport}</pre>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(weeklyReport)}
            className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-400/15 inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Copy report
          </button>
        </SectionCard>

        <SectionCard title="Local Response Speed Audit™" icon={Crosshair} index={2}>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-[#64748b]">Client</p>
              <p className="text-lg font-semibold metric-value text-cyan-300">{clientResponseMinutes}m</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-[#64748b]">Market avg</p>
              <p className="text-lg font-semibold metric-value text-amber-300">{auditAverage}m</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-[#64748b]">Gap</p>
              <p className="text-lg font-semibold metric-value text-[#e2e8f0]">{speedGap}m</p>
            </div>
          </div>
          <div className="rounded-xl border border-purple-400/20 bg-purple-400/10 p-3 mb-4">
            <p className="text-xs text-purple-300">Audit verdict</p>
            <p className="text-sm font-medium text-[#e2e8f0]">{auditWinner}</p>
          </div>
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {auditRows.map((row) => (
              <div key={row.id} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input value={row.competitor} onChange={(e) => updateAudit(row.id, { competitor: e.target.value })} className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1 text-xs text-[#e2e8f0] outline-none" />
                  <button onClick={() => setAuditRows((rows) => rows.filter((r) => r.id !== row.id))} className="text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={row.responseMinutes} onChange={(e) => updateAudit(row.id, { responseMinutes: Number(e.target.value) || 0 })} className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1 text-xs text-[#e2e8f0] outline-none" />
                  <select value={row.channel} onChange={(e) => updateAudit(row.id, { channel: e.target.value as AuditChannel })} className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1 text-xs text-[#e2e8f0] outline-none">
                    <option value="call">call</option><option value="text">text</option><option value="email">email</option><option value="none">none</option>
                  </select>
                  <select value={row.quality} onChange={(e) => updateAudit(row.id, { quality: e.target.value as AuditQuality })} className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1 text-xs text-[#e2e8f0] outline-none">
                    <option value="weak">weak</option><option value="average">average</option><option value="strong">strong</option>
                  </select>
                </div>
                <input value={row.notes} onChange={(e) => updateAudit(row.id, { notes: e.target.value })} placeholder="notes" className="w-full rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1 text-xs text-[#94a3b8] outline-none" />
              </div>
            ))}
          </div>
          <button onClick={addAuditRow} className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#e2e8f0] inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add competitor
          </button>
        </SectionCard>
      </div>

      <SectionCard title="Fulfillment Rules" icon={Gauge} index={3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            ['Do not over-serve', 'Use the report generator and audit table. Avoid custom one-off analysis unless it sells a higher plan.'],
            ['Use client data first', 'The calculator pulls real missed/recovered/booked counts. Fallback assumptions are only for missing data.'],
            ['Sell the gap', 'The audit exists to show competitive response speed pressure, then position LRP as the fix.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-sm font-semibold text-[#e2e8f0]">{title}</p>
              <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
