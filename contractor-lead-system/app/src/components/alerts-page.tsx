'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Flame,
  AlertTriangle,
  CalendarCheck,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { alerts, getUrgencyPillClass, timeAgo } from '@/lib/data';

interface AlertsPageProps {
  onViewLead: (id: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25 },
  }),
};

export default function AlertsPage({ onViewLead }: AlertsPageProps) {
  const unread = alerts.filter((a) => !a.read);
  const read = alerts.filter((a) => a.read);

  const alertIcon = (type: string) => {
    switch (type) {
      case 'hot_lead': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'estimate_requested': return <CalendarCheck className="w-4 h-4 text-amber-400" />;
      case 'follow_up': return <RotateCcw className="w-4 h-4 text-blue-400" />;
      default: return <AlertCircle className="w-4 h-4 text-[#64748b]" />;
    }
  };

  const alertLabel = (type: string) => {
    switch (type) {
      case 'hot_lead': return 'Hot Lead';
      case 'emergency': return 'Emergency';
      case 'estimate_requested': return 'Estimate Requested';
      case 'follow_up': return 'Follow Up';
      default: return 'Alert';
    }
  };

  const renderAlert = (a: typeof alerts[0], i: number) => (
    <motion.button
      key={a.id}
      custom={i}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      onClick={() => onViewLead(a.leadId)}
      className={`glass w-full p-4 md:p-5 text-left transition-all hover:bg-white/[0.04] ${
        !a.read ? 'border-l-2 border-l-blue-500' : ''
      }`}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {alertIcon(a.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
              {alertLabel(a.type)}
            </span>
            <span className={getUrgencyPillClass(a.urgency)}>{a.urgency}</span>
          </div>
          <p className="text-sm font-medium mb-0.5">{a.contactName}</p>
          <p className="text-sm text-[#94a3b8] leading-relaxed">{a.summary}</p>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <span className="text-xs text-blue-400">{a.recommendation}</span>
            <span className="text-xs text-[#475569] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(a.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Owner Alerts</h1>
        <p className="text-sm text-[#64748b] mt-0.5">{unread.length} unread alerts</p>
      </div>

      {unread.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider ml-1">New</h2>
          {unread.map((a, i) => renderAlert(a, i))}
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider ml-1">Earlier</h2>
          {read.map((a, i) => renderAlert(a, i + unread.length))}
        </div>
      )}
    </div>
  );
}
