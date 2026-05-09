'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

interface Plan {
  name: string;
  price: number;
  priceDisplay: string;
  features: string[];
  leadLimit: number;
}

interface Subscription {
  planTier: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  invoiceUrl: string | null;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

const planIcons: Record<string, typeof Zap> = {
  starter: Zap,
  growth: TrendingUp,
  pro: Shield,
};

const planGradients: Record<string, string> = {
  starter: 'from-slate-500 to-blue-500',
  growth: 'from-blue-500 to-cyan-400',
  pro: 'from-purple-500 to-blue-500',
};

export default function ClientBilling() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planTier, setPlanTier] = useState('starter');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchStatus() {
      try {
        const res = await fetch('/api/billing/status');
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSubscription(json.data.subscription);
            setPlan(json.data.plan);
            setPlanTier(json.data.planTier);
            setPayments(json.data.recentPayments || []);
          }
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStatus();
    return () => { cancelled = true; };
  }, []);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data.url) {
        window.location.href = json.data.url;
      }
    } catch {
      // noop
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  const Icon = planIcons[planTier] || Zap;
  const gradient = planGradients[planTier] || planGradients.starter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Manage your subscription and payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Plan */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-6"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{plan?.name || 'Starter'} Plan</h2>
                <span className="text-[13px] text-[var(--text-tertiary)]">
                  {plan?.priceDisplay || '$97'}/month
                </span>
              </div>
            </div>
            {subscription && (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                subscription.status === 'active' && !subscription.cancelAtPeriodEnd
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                  : subscription.cancelAtPeriodEnd
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                    : 'bg-red-500/15 text-red-300 border-red-500/20'
              }`}>
                {subscription.cancelAtPeriodEnd ? 'Canceling' : subscription.status}
              </span>
            )}
          </div>

          {plan && (
            <ul className="space-y-2 mb-5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {subscription?.currentPeriodEnd && (
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              {subscription.cancelAtPeriodEnd
                ? `Access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : `Next billing: ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
            </p>
          )}

          <button
            onClick={handleManageSubscription}
            disabled={portalLoading || !subscription}
            className="glass-button px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-white/[0.08] transition-colors disabled:opacity-40"
          >
            {portalLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
            Manage Subscription
          </button>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-6"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Payment History
          </h2>
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
            {payments.length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)]">No payment history yet.</p>
            )}
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl interactive-row">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${
                    p.status === 'succeeded' ? 'text-emerald-400' : 'text-red-400'
                  }`} />
                  <div>
                    <span className="text-sm font-medium">{formatCents(p.amount)}</span>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Pending'}
                    </div>
                  </div>
                </div>
                {p.invoiceUrl && (
                  <a
                    href={p.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Invoice <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
