'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Clock,
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
  ArrowUpRight,
  UserMinus,
  CalendarClock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

interface BillingMetrics {
  mrr: number;
  activeSubscribers: number;
  churnRate: number;
  arpc: number;
  outstandingAmount: number;
  totalClients: number;
}

interface Subscriber {
  id: string;
  clientId: string;
  companyName: string;
  contactName: string | null;
  trade: string;
  planTier: string;
  status: string;
  mrrContribution: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  leadCount: number;
  leadLimit: number;
}

interface Payment {
  id: string;
  companyName: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface DueSoon {
  clientId: string;
  companyName: string;
  planTier: string;
  dueDate: string | null;
}

interface ChurnItem {
  clientId: string;
  companyName: string;
  planTier: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function getStatusPill(status: string, cancelAtPeriodEnd?: boolean) {
  if (cancelAtPeriodEnd && status === 'active') {
    return { label: 'Canceling', className: 'bg-amber-500/15 text-amber-300 border-amber-500/20' };
  }
  const map: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
    past_due: { label: 'Past Due', className: 'bg-red-500/15 text-red-300 border-red-500/20' },
    canceled: { label: 'Canceled', className: 'bg-red-500/15 text-red-300 border-red-500/20' },
    trialing: { label: 'Trial', className: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
    incomplete: { label: 'Incomplete', className: 'bg-slate-500/15 text-slate-300 border-slate-500/20' },
  };
  return map[status] ?? { label: status, className: 'bg-slate-500/15 text-slate-300 border-slate-500/20' };
}

function getPaymentIcon(status: string) {
  switch (status) {
    case 'succeeded': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case 'failed': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    case 'refunded': return <RotateCcw className="w-3.5 h-3.5 text-amber-400" />;
    default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  }
}

function getPlanPill(tier: string) {
  const map: Record<string, string> = {
    starter: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
    growth: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    pro: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  };
  return map[tier] ?? map.starter;
}

// Empty data with real structure — no fake companies
function getEmptyBillingData() {
  return {
    metrics: { mrr: 0, activeSubscribers: 0, churnRate: 0, arpc: 0, outstandingAmount: 0, totalClients: 0 },
    subscribers: [],
    recentPayments: [],
    dueSoon: [],
    churnWatch: [],
  };
}

// Mock revenue chart data (6 months)
function getRevenueChartData() {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const values = [29400, 39100, 49200, 59000, 78800, 89100];
  return months.map((month, i) => ({ month, revenue: values[i] }));
}

export default function AdminBilling() {
  const [data, setData] = useState<{
    metrics: BillingMetrics;
    subscribers: Subscriber[];
    recentPayments: Payment[];
    dueSoon: DueSoon[];
    churnWatch: ChurnItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'companyName' | 'mrrContribution' | 'currentPeriodEnd'>('mrrContribution');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let cancelled = false;
    async function fetchBilling() {
      try {
        const res = await fetch('/api/admin/billing');
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success) { setData(json.data); setLoading(false); return; }
        }
      } catch {
        // fall through to mock
      }
      // Fall back to client-side mock data so demo always works
      if (!cancelled) setData(getEmptyBillingData());
      if (!cancelled) setLoading(false);
      return;
    }
    fetchBilling();
    return () => { cancelled = true; };
  }, []);

  const filteredSubscribers = useMemo(() => {
    if (!data) return [];
    let subs = data.subscribers;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      subs = subs.filter((s) => s.companyName.toLowerCase().includes(q) || s.contactName?.toLowerCase().includes(q));
    }
    if (planFilter !== 'all') {
      subs = subs.filter((s) => s.planTier === planFilter);
    }
    if (statusFilter !== 'all') {
      subs = subs.filter((s) => {
        if (statusFilter === 'canceling') return s.cancelAtPeriodEnd && s.status === 'active';
        return s.status === statusFilter;
      });
    }

    subs = [...subs].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'companyName') cmp = a.companyName.localeCompare(b.companyName);
      else if (sortField === 'mrrContribution') cmp = a.mrrContribution - b.mrrContribution;
      else if (sortField === 'currentPeriodEnd') cmp = (a.currentPeriodEnd ?? '').localeCompare(b.currentPeriodEnd ?? '');
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return subs;
  }, [data, searchQuery, planFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const revenueData = useMemo(() => getRevenueChartData(), []);

  // Revenue growth MoM
  const mrrGrowth = useMemo(() => {
    if (revenueData.length < 2) return 0;
    const prev = revenueData[revenueData.length - 2].revenue;
    const curr = revenueData[revenueData.length - 1].revenue;
    if (prev === 0) return 0;
    return Math.round(((curr - prev) / prev) * 100);
  }, [revenueData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--text-tertiary)]">Failed to load billing data.</p>
      </div>
    );
  }

  const metricCards = [
    { label: 'Monthly Recurring Revenue', value: formatCents(data.metrics.mrr), icon: DollarSign, color: 'text-emerald-400', glow: 'rgba(52, 211, 153, 0.08)' },
    { label: 'Active Subscribers', value: data.metrics.activeSubscribers.toString(), icon: Users, color: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.08)' },
    { label: 'Churn Rate (30d)', value: `${data.metrics.churnRate}%`, icon: TrendingDown, color: 'text-red-400', glow: 'rgba(248, 113, 113, 0.08)' },
    { label: 'Avg Revenue / Client', value: formatCents(data.metrics.arpc), icon: TrendingUp, color: 'text-cyan-400', glow: 'rgba(34, 211, 238, 0.08)' },
    { label: 'MoM Growth', value: `${mrrGrowth > 0 ? '+' : ''}${mrrGrowth}%`, icon: ArrowUpRight, color: mrrGrowth >= 0 ? 'text-emerald-400' : 'text-red-400', glow: mrrGrowth >= 0 ? 'rgba(52, 211, 153, 0.08)' : 'rgba(248, 113, 113, 0.08)' },
    { label: 'Outstanding / Past Due', value: formatCents(data.metrics.outstandingAmount), icon: AlertTriangle, color: data.metrics.outstandingAmount > 0 ? 'text-amber-400' : 'text-slate-400', glow: data.metrics.outstandingAmount > 0 ? 'rgba(251, 191, 36, 0.08)' : 'rgba(100, 116, 139, 0.04)' },
  ];

  const failedPayments = data.recentPayments.filter((p) => p.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Revenue, subscriptions &amp; payment tracking</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((m, i) => {
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
                <span className="label-caps text-[10px]">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color} opacity-70`} />
              </div>
              <span className="text-2xl font-semibold metric-value">{m.value}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid: Revenue Chart + Payment Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Monthly Revenue
          </h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 100).toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [formatCents(value as number), 'Revenue']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#revenueGradient)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Payment Activity Feed */}
        <motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5 lg:col-span-1"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Recent Payments
          </h2>
          <div className="space-y-0.5 max-h-[220px] overflow-y-auto">
            {data.recentPayments.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl interactive-row ${
                  p.status === 'failed' ? 'bg-red-500/[0.04] border border-red-500/10' : ''
                }`}
              >
                <div className="flex-shrink-0">{getPaymentIcon(p.status)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{p.companyName}</span>
                    <span className={`text-sm font-semibold tabular-nums ${
                      p.status === 'failed' ? 'text-red-400' : p.status === 'refunded' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {p.status === 'refunded' ? '-' : ''}{formatCents(p.amount)}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {formatDate(p.paidAt || p.createdAt)}
                    {p.status === 'failed' && <span className="text-red-400 ml-1.5 font-medium">FAILED</span>}
                    {p.status === 'refunded' && <span className="text-amber-400 ml-1.5">Refunded</span>}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subscriber Table */}
      <motion.div
        custom={8}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Subscribers
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-subtle pl-8 pr-3 py-1.5 text-xs rounded-lg border border-white/[0.06] bg-white/[0.03] text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-purple-500/30 w-48"
              />
            </div>
            <div className="relative">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="glass-subtle px-3 py-1.5 pr-7 text-xs rounded-lg border border-white/[0.06] bg-white/[0.03] text-white appearance-none focus:outline-none focus:border-purple-500/30"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="glass-subtle px-3 py-1.5 pr-7 text-xs rounded-lg border border-white/[0.06] bg-white/[0.03] text-white appearance-none focus:outline-none focus:border-purple-500/30"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
                <option value="trialing">Trialing</option>
                <option value="canceling">Canceling</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] border-b border-white/[0.06]">
                <th className="pb-2.5 pr-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('companyName')}>
                  Client {sortField === 'companyName' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
                <th className="pb-2.5 pr-4 font-medium">Plan</th>
                <th className="pb-2.5 pr-4 font-medium">Status</th>
                <th className="pb-2.5 pr-4 font-medium cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('mrrContribution')}>
                  MRR {sortField === 'mrrContribution' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
                <th className="pb-2.5 pr-4 font-medium hidden md:table-cell">Leads</th>
                <th className="pb-2.5 font-medium cursor-pointer hover:text-white transition-colors hidden sm:table-cell" onClick={() => handleSort('currentPeriodEnd')}>
                  Next Billing {sortField === 'currentPeriodEnd' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((sub) => {
                const pill = getStatusPill(sub.status, sub.cancelAtPeriodEnd);
                const atLimit = sub.leadLimit !== Infinity && sub.leadCount >= sub.leadLimit * 0.8;
                return (
                  <tr
                    key={sub.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div>
                        <span className="text-sm font-medium">{sub.companyName}</span>
                        <div className="text-xs text-[var(--text-tertiary)]">{sub.trade}</div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${getPlanPill(sub.planTier)}`}>
                        {sub.planTier}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${pill.className}`}>
                        {pill.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-sm font-semibold tabular-nums">
                        {sub.mrrContribution > 0 ? formatCents(sub.mrrContribution) : '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className={`text-xs tabular-nums ${atLimit ? 'text-amber-400 font-medium' : 'text-[var(--text-tertiary)]'}`}>
                        {sub.leadCount}{sub.leadLimit !== Infinity ? `/${sub.leadLimit}` : ''}
                        {atLimit && <AlertCircle className="w-3 h-3 inline ml-1 -mt-0.5" />}
                      </span>
                    </td>
                    <td className="py-3 hidden sm:table-cell">
                      <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
                        {formatDate(sub.currentPeriodEnd)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-[var(--text-tertiary)]">
                    No subscribers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bottom row: Who's Due + Churn Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Who's Due */}
        <motion.div
          custom={9}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-amber-400" />
            Due Soon (Next 7 Days)
          </h2>
          <div className="space-y-1.5">
            {data.dueSoon.length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)]">No upcoming billing dates.</p>
            )}
            {data.dueSoon.map((item) => (
              <div key={item.clientId} className="flex items-center justify-between p-2.5 rounded-xl interactive-row">
                <div className="flex items-center gap-3">
                  <CalendarClock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="text-sm">{item.companyName}</span>
                    <span className={`ml-2 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${getPlanPill(item.planTier)}`}>
                      {item.planTier}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-medium tabular-nums">
                  {daysUntil(item.dueDate)}d
                </span>
              </div>
            ))}

            {/* Failed payments needing attention */}
            {failedPayments.length > 0 && (
              <>
                <div className="border-t border-white/[0.06] mt-3 pt-3">
                  <h3 className="text-[10px] uppercase tracking-wider text-red-400 font-medium mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    Failed Payments
                  </h3>
                </div>
                {failedPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-red-500/[0.04] border border-red-500/10">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="text-sm">{p.companyName}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-400 tabular-nums">{formatCents(p.amount)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Churn Watch */}
        <motion.div
          custom={10}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <UserMinus className="w-4 h-4 text-red-400" />
            Churn Watch
          </h2>
          <div className="space-y-1.5">
            {data.churnWatch.length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)]">No clients at risk of churning.</p>
            )}
            {data.churnWatch.map((item) => {
              const days = daysUntil(item.periodEnd);
              const isCanceled = item.status === 'canceled';
              return (
                <div
                  key={item.clientId}
                  className={`flex items-center justify-between p-3 rounded-xl interactive-row ${
                    isCanceled ? 'bg-red-500/[0.04] border border-red-500/10' : 'bg-amber-500/[0.04] border border-amber-500/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.companyName}</span>
                      <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${getPlanPill(item.planTier)}`}>
                        {item.planTier}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {isCanceled ? 'Subscription canceled' : `Cancels at period end — ${days}d left`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium ${isCanceled ? 'text-red-400' : 'text-amber-400'}`}>
                      {isCanceled ? 'Churned' : `${days}d`}
                    </span>
                    {!isCanceled && (
                      <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-medium">
                        Win-back
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
