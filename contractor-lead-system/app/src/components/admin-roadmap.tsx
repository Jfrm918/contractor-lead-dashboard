'use client';

import { motion } from 'framer-motion';
import {
  Phone,
  Star,
  Target,
  DollarSign,
  Eye,
  Building2,
  Palette,
  Code2,
  UserCheck,
  Rocket,
  TrendingUp,
  Zap,
  CheckCircle2,
  Clock,
  CalendarClock,
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

function StatusBadge({ status }: { status: 'live' | 'building' | 'planned' }) {
  const config = {
    live: {
      label: 'Live',
      className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
      glow: '0 0 12px rgba(52, 211, 153, 0.25)',
      icon: CheckCircle2,
    },
    building: {
      label: 'Building',
      className: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
      glow: '0 0 12px rgba(251, 191, 36, 0.25)',
      icon: Clock,
    },
    planned: {
      label: 'Planned',
      className: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
      glow: '0 0 12px rgba(59, 130, 246, 0.2)',
      icon: CalendarClock,
    },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${c.className}`}
      style={{ boxShadow: c.glow }}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

const currentPlans = [
  {
    name: 'Starter',
    price: '$197/mo',
    features: [
      'Missed-call recovery',
      'SMS sequences',
      'Lead inbox & scoring',
      'Alerts',
      'Monthly scorecard',
      'Response audit',
      'Up to 200 leads/mo',
    ],
    gradient: 'from-slate-500/20 to-blue-500/10',
    border: 'border-slate-400/15',
    accent: 'text-slate-300',
  },
  {
    name: 'Growth',
    price: '$347/mo',
    features: [
      'Everything in Starter',
      'Unlimited leads',
      'Priority support',
      'Prospecting automation',
    ],
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-400/15',
    accent: 'text-blue-300',
  },
];

const premiumFeatures = [
  {
    icon: Phone,
    name: 'AI Voice Agent',
    description: 'When a call is missed, an AI calls back within 60 seconds. Answers questions, books estimates, confirms appointments.',
    value: 'Replaces a receptionist',
    color: 'text-cyan-400',
    glow: 'rgba(34, 211, 238, 0.08)',
  },
  {
    icon: Star,
    name: 'Reputation Management',
    description: 'Auto-send review requests after jobs complete. Monitor Google/Yelp reviews. Alert on new reviews.',
    value: 'Replaces Podium/Birdeye ($200–400/mo value)',
    color: 'text-amber-400',
    glow: 'rgba(251, 191, 36, 0.08)',
  },
  {
    icon: Target,
    name: 'Ad Spend Optimizer',
    description: 'Connect to Google Ads/LSA, track which ads produce booked jobs not just clicks, auto-pause underperforming campaigns.',
    value: 'Saves thousands in wasted ad spend',
    color: 'text-red-400',
    glow: 'rgba(248, 113, 113, 0.08)',
  },
  {
    icon: DollarSign,
    name: 'Job Revenue Attribution',
    description: 'Pull actual revenue from CRM (ServiceTitan, Housecall Pro), show exactly which leads turned into revenue.',
    value: '"Vantage generated $47k in closed jobs this month"',
    color: 'text-emerald-400',
    glow: 'rgba(52, 211, 153, 0.08)',
  },
  {
    icon: Eye,
    name: 'Competitor Intelligence',
    description: 'Track competitor Google rankings, ad positions, review counts. Weekly report on competitive landscape.',
    value: 'Know exactly where you stand vs. competitors',
    color: 'text-purple-400',
    glow: 'rgba(139, 92, 246, 0.08)',
  },
];

const enterpriseFeatures = [
  { icon: Building2, name: 'Multi-Location Support', description: 'Manage multiple branches from one account' },
  { icon: Palette, name: 'White-Label', description: 'Resell Vantage under their own brand (for agencies)' },
  { icon: Code2, name: 'API Access', description: 'Let clients build custom integrations' },
  { icon: UserCheck, name: 'Dedicated Account Manager', description: 'Human support layer' },
];

const revenueProjections = [
  { label: '20 clients × $197', scenario: 'Starter only', amount: '$3,940/mo', color: 'text-slate-300' },
  { label: '20 clients × $347', scenario: 'Growth only', amount: '$6,940/mo', color: 'text-blue-300' },
  { label: '20 clients × $997', scenario: 'Premium only', amount: '$19,940/mo', color: 'text-purple-300' },
  { label: '30 Starter + 15 Growth + 5 Premium', scenario: 'Blended 50 clients', amount: '$16,105/mo', color: 'text-cyan-300', highlight: true },
];

export default function AdminRoadmap() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-purple-400" />
            Product Roadmap
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            What&apos;s live, what&apos;s building, and where we&apos;re going
          </p>
        </div>
      </motion.div>

      {/* ─── Current Plans ─── */}
      <div>
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="flex items-center gap-3 mb-4"
        >
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Current Plans
          </h2>
          <StatusBadge status="live" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              custom={i + 2}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className={`glass p-6 bg-gradient-to-br ${plan.gradient} ${plan.border} border`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${plan.accent}`}>{plan.name}</h3>
                  <span className="text-2xl font-bold metric-value">{plan.price}</span>
                </div>
                <StatusBadge status="live" />
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Phase 2: Premium Tier ─── */}
      <div>
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="flex items-center gap-3 mb-4"
        >
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Phase 2: Premium Tier — $997/mo
          </h2>
          <StatusBadge status="building" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                custom={i + 5}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="glass p-5 interactive-card border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.04] to-transparent"
                style={{ boxShadow: `0 0 24px ${feature.glow}, 0 2px 8px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.15)` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                    <Icon className={`w-4.5 h-4.5 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold">{feature.name}</h3>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
                  {feature.description}
                </p>
                <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                  <span className="text-xs text-cyan-300 font-medium">{feature.value}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Phase 3: Enterprise ─── */}
      <div>
        <motion.div
          custom={10}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="flex items-center gap-3 mb-4"
        >
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            Phase 3: Enterprise
          </h2>
          <StatusBadge status="planned" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {enterpriseFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                custom={i + 11}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="glass p-5 interactive-card border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.04] to-transparent"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold">{feature.name}</h3>
                </div>
                <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Revenue Projections ─── */}
      <motion.div
        custom={15}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-6 border border-purple-500/10 bg-gradient-to-br from-purple-500/[0.06] to-cyan-500/[0.03]"
      >
        <h2 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Revenue Projections
        </h2>

        <div className="space-y-3">
          {revenueProjections.map((row, i) => (
            <motion.div
              key={row.scenario}
              custom={i + 16}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl ${
                row.highlight
                  ? 'bg-gradient-to-r from-cyan-500/[0.08] to-purple-500/[0.08] border border-cyan-400/15'
                  : 'bg-white/[0.03] border border-white/[0.06]'
              }`}
              style={row.highlight ? { boxShadow: '0 0 20px rgba(34, 211, 238, 0.1), 0 0 40px rgba(139, 92, 246, 0.05)' } : undefined}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
                  {row.scenario}
                </span>
              </div>
              <span className={`text-xl font-bold tabular-nums ${row.color} ${row.highlight ? 'mt-2 sm:mt-0' : 'mt-1 sm:mt-0'}`}>
                {row.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
