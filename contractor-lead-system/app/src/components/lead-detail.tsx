'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Clock,
  CalendarCheck,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  PhoneMissed,
} from 'lucide-react';
import {
  leads,
  alerts,
  getStatusPillClass,
  getUrgencyPillClass,
  formatTime,
  formatDate,
  type Lead,
} from '@/lib/data';

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
}

export default function LeadDetail({ leadId, onBack }: LeadDetailProps) {
  const lead = leads.find((l) => l.id === leadId) as Lead;
  const leadAlerts = alerts.filter((a) => a.leadId === leadId);

  if (!lead) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-[#64748b]">Lead not found.</p>
        <button onClick={onBack} className="btn-primary px-4 py-2 mt-4 text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back button + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="glass-button p-2.5 flex-shrink-0 mt-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
            <div className="flex items-center gap-2">
              <span className={getStatusPillClass(lead.status)}>{lead.status}</span>
              <span className={getUrgencyPillClass(lead.urgency)}>{lead.urgency}</span>
            </div>
          </div>
          <p className="text-sm text-[#64748b] mt-0.5">{lead.service} · {lead.trade}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: contact info + qualification */}
        <div className="space-y-4 lg:col-span-1">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="glass p-5"
          >
            <h2 className="text-sm font-semibold mb-3">Contact Information</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-[#64748b]" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-[#64748b]" />
                <span className="text-[#94a3b8]">{lead.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-[#64748b]" />
                <span className="text-[#94a3b8]">{lead.city}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Wrench className="w-4 h-4 text-[#64748b]" />
                <span className="text-[#94a3b8]">{lead.source}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-[#64748b]" />
                <span className="text-[#94a3b8]">{formatDate(lead.createdAt)} at {formatTime(lead.createdAt)}</span>
              </div>
            </div>

            {lead.missedCall && (
              <div className={`mt-3 flex items-center gap-2 text-xs ${lead.recovered ? 'text-cyan-400' : 'text-red-400'}`}>
                <PhoneMissed className="w-3.5 h-3.5" />
                {lead.recovered ? 'Missed call — recovered' : 'Missed call — not yet recovered'}
              </div>
            )}
          </motion.div>

          {/* Qualification */}
          {lead.qualificationAnswers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="glass p-5"
            >
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Qualification
              </h2>
              <div className="space-y-3">
                {lead.qualificationAnswers.map((qa, i) => (
                  <div key={i}>
                    <p className="text-xs text-[#64748b] mb-0.5">{qa.question}</p>
                    <p className="text-sm text-[#e2e8f0]">{qa.answer}</p>
                  </div>
                ))}
              </div>
              {lead.bookingIntent && (
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <p className="text-xs text-[#64748b] mb-0.5">Booking Intent</p>
                  <p className="text-sm text-amber-300">{lead.bookingIntent}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Alerts for this lead */}
          {leadAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="glass p-5"
            >
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Owner Alerts
              </h2>
              <div className="space-y-2">
                {leadAlerts.map((a) => (
                  <div key={a.id} className="glass-subtle p-3">
                    <p className="text-sm text-[#e2e8f0]">{a.summary}</p>
                    <p className="text-xs text-blue-400 mt-1">{a.recommendation}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right column: conversation thread */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="glass p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            Conversation
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {lead.conversation.map((msg, i) => {
              if (msg.type === 'system') {
                return (
                  <div key={i} className="flex justify-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                      <PhoneMissed className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-[#64748b]">{msg.content}</span>
                      <span className="text-xs text-[#475569]">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              }
              const isOutbound = msg.type === 'outbound';
              return (
                <div key={i} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                      isOutbound
                        ? 'bg-blue-500/15 border border-blue-500/20 rounded-br-lg'
                        : 'bg-white/[0.05] border border-white/[0.08] rounded-bl-lg'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1.5 ${isOutbound ? 'text-blue-400/60' : 'text-[#475569]'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick action */}
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex gap-2">
            <button className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              Book Estimate
            </button>
            <button className="glass-button px-4 py-2.5 text-sm text-[#94a3b8] flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Call
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
