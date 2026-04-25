'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Phone,
  Mail,
  Target,
  Zap,
  MessageCircle,
  CheckCircle2,
  Users,
  ArrowRight,
  Sparkles,
  Clock,
  Star,
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

type PlaybookTab = 'offer' | 'cold-call' | 'cold-email';

const tabs: { id: PlaybookTab; label: string; icon: typeof DollarSign }[] = [
  { id: 'offer', label: 'Offer & Pricing', icon: DollarSign },
  { id: 'cold-call', label: 'Cold Call Script', icon: Phone },
  { id: 'cold-email', label: 'Cold Email Sequence', icon: Mail },
];

/* ─── Highlight Block ─── */
function Highlight({ icon: Icon, label, children, color = 'blue' }: {
  icon: typeof DollarSign;
  label: string;
  children: React.ReactNode;
  color?: 'blue' | 'purple' | 'cyan' | 'emerald' | 'amber';
}) {
  const colors = {
    blue: 'from-blue-500/10 to-blue-500/[0.02] border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/10 to-purple-500/[0.02] border-purple-500/20 text-purple-400',
    cyan: 'from-cyan-500/10 to-cyan-500/[0.02] border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-500/10 to-emerald-500/[0.02] border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-amber-500/[0.02] border-amber-500/20 text-amber-400',
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${colors[color]} p-4`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 ${colors[color].split(' ').pop()}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-sm text-[#e2e8f0] leading-relaxed">{children}</div>
    </div>
  );
}

/* ─── Script Block (for quoted scripts) ─── */
function ScriptBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3.5 text-sm text-[#cbd5e1] leading-relaxed italic">
      {children}
    </div>
  );
}

/* ─── Section Card ─── */
function SectionCard({ title, icon: Icon, children, index = 0 }: {
  title: string;
  icon: typeof DollarSign;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="glass p-5"
    >
      <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-purple-400" />
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

/* ─── Offer & Pricing Tab ─── */
function OfferTab() {
  return (
    <div className="space-y-5">
      {/* Key highlights row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Highlight icon={DollarSign} label="Price Point" color="emerald">
          <p className="text-lg font-semibold text-emerald-400">$500 setup + $500/mo</p>
          <p className="text-xs text-[#94a3b8] mt-1">Pilot pricing — increase after proof stage</p>
        </Highlight>
        <Highlight icon={Target} label="Core Promise" color="blue">
          <p className="font-medium">Recover missed leads, book more estimates</p>
          <p className="text-xs text-[#94a3b8] mt-1">Lead conversion, not lead generation</p>
        </Highlight>
        <Highlight icon={Clock} label="Commitment" color="purple">
          <p className="font-medium">90-day pilot, billed monthly</p>
          <p className="text-xs text-[#94a3b8] mt-1">No long contracts — low friction entry</p>
        </Highlight>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* What we sell */}
        <SectionCard title="What We Sell" icon={Zap} index={1}>
          <p className="text-sm text-[#cbd5e1] leading-relaxed mb-4">
            A <span className="text-white font-medium">lead conversion service</span> for contractors — not a generic AI service, chatbot, or lead gen platform.
          </p>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Say this</p>
            {['Missed-call recovery', 'Faster speed-to-lead', 'Lead qualification', 'Estimate booking support', 'Better conversion from paid leads'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-[#e2e8f0]">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
            <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-2">Never say</p>
            {['AI automation agency', 'Chatbot service', 'Lead gen magic', 'Full marketing replacement'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[#64748b]">
                <span className="text-xs">✕</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* V1 Deliverables */}
        <SectionCard title="V1 Deliverables" icon={CheckCircle2} index={2}>
          <div className="space-y-2">
            {[
              'Tracked number setup',
              'Call forwarding setup',
              'Missed-call text-back system',
              'Basic qualification flow',
              'Owner / office alerts',
              'Lead dashboard access',
              'Monthly scorecard',
              'Ongoing optimization & support',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02]">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                <span className="text-sm text-[#e2e8f0]">{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Target niches */}
        <SectionCard title="Best-Fit Niches" icon={Users} index={3}>
          <div className="grid grid-cols-2 gap-2">
            {['HVAC', 'Plumbing', 'Roofing', 'Electrical', 'Insulation', 'Garage Doors'].map((niche) => (
              <div key={niche} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-sm font-medium text-[#e2e8f0]">{niche}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#64748b] mt-3">Businesses already buying leads, running Google Ads or LSAs, and relying on phone calls.</p>
        </SectionCard>

        {/* Pricing ladder */}
        <SectionCard title="Pricing Ladder" icon={DollarSign} index={4}>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-400/[0.06] border border-emerald-400/[0.15]">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Pilot — Start Here</span>
              </div>
              <p className="text-sm text-[#e2e8f0]">$500 setup + $500/month</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">60–90 day proof period</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Post-Proof</span>
              </div>
              <p className="text-sm text-[#e2e8f0]">$1,000 setup + $750–$1,500/month</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">After results and testimonials are in hand</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* One-liner */}
      <SectionCard title="Sales Pitch — One Liner" icon={MessageCircle} index={5}>
        <ScriptBlock>
          &ldquo;We help contractors convert more of the leads they already pay for by instantly following up on missed calls, qualifying prospects, and helping book more estimates.&rdquo;
        </ScriptBlock>
      </SectionCard>
    </div>
  );
}

/* ─── Cold Call Tab ─── */
function ColdCallTab() {
  return (
    <div className="space-y-5">
      {/* Key highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Highlight icon={Sparkles} label="Recommended Opener" color="cyan">
          <p className="font-medium">&ldquo;Hey, this is [NAME]. I&apos;ll be quick...&rdquo;</p>
          <p className="text-xs text-[#94a3b8] mt-1">Calm, direct, local-business normal</p>
        </Highlight>
        <Highlight icon={Target} label="Call Goal" color="emerald">
          <p className="font-medium">Book a 10-min walkthrough</p>
          <p className="text-xs text-[#94a3b8] mt-1">Don&apos;t explain the whole system on call 1</p>
        </Highlight>
        <Highlight icon={MessageCircle} label="Best CTA" color="purple">
          <p className="font-medium">&ldquo;Open to a quick 10-min walkthrough this week?&rdquo;</p>
          <p className="text-xs text-[#94a3b8] mt-1">Book the demo — don&apos;t hard close</p>
        </Highlight>
      </div>

      {/* Core scripts */}
      <SectionCard title="Opening Script" icon={Phone} index={1}>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Gatekeeper</p>
            <ScriptBlock>
              &ldquo;Hey, quick question — who handles missed calls or inbound leads for the company?&rdquo;
            </ScriptBlock>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Owner / Decision Maker</p>
            <ScriptBlock>
              &ldquo;Hey, this is [NAME]. I&apos;ll be quick. We help contractors recover missed inbound leads and respond faster when calls get missed or come in after hours. I was just calling to see how you&apos;re handling that right now.&rdquo;
            </ScriptBlock>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Discovery questions */}
        <SectionCard title="Discovery Questions (Pick 1–2)" icon={MessageCircle} index={2}>
          <div className="space-y-2">
            {[
              'Are you guys already running Google Ads or buying leads right now?',
              'What usually happens if a call gets missed?',
              'Do after-hours leads usually get handled right away or the next day?',
              'Do you feel like some paid leads are slipping through the cracks?',
            ].map((q, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02]">
                <span className="text-xs text-purple-400 font-mono mt-0.5">{i + 1}</span>
                <span className="text-sm text-[#e2e8f0] italic">&ldquo;{q}&rdquo;</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Value pitch */}
        <SectionCard title="Value Pitch (When Interest Shows)" icon={Zap} index={3}>
          <ScriptBlock>
            &ldquo;That&apos;s exactly the problem we help with. Instead of losing that lead, the system texts back fast, qualifies the person, and flags hot leads so your team can follow up faster.&rdquo;
          </ScriptBlock>
          <div className="mt-3 p-2.5 rounded-lg bg-white/[0.02]">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Resistance reducer</p>
            <p className="text-sm text-[#cbd5e1] italic">&ldquo;It sits on top of what you already do, so it doesn&apos;t require ripping out your current setup.&rdquo;</p>
          </div>
        </SectionCard>
      </div>

      {/* Objection handling */}
      <SectionCard title="Objection Handling" icon={ArrowRight} index={4}>
        <div className="space-y-2">
          {[
            {
              objection: '"We already have someone for marketing"',
              response: '"This isn\'t about replacing marketing. It\'s about making sure the leads you\'re already paying for don\'t get wasted when calls get missed or follow-up is slow."',
            },
            {
              objection: '"We don\'t miss calls"',
              response: '"Most companies still have after-hours calls, busy periods, or leads that don\'t get followed up on instantly. That\'s usually where this helps."',
            },
            {
              objection: '"How much is it?"',
              response: '"It depends a little on setup, but for most companies it\'s a simple monthly service around missed-call recovery and lead handling. If it makes sense after a quick look, I can break pricing down clearly."',
            },
            {
              objection: '"Not interested"',
              response: '"No problem — quick last question: are you already confident no paid leads are being lost from missed calls or slow follow-up?"',
            },
            {
              objection: '"Send me something"',
              response: '"Absolutely. What\'s the best email? I\'ll send a short overview and demo link."',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-xs font-semibold text-amber-400 mb-1.5">{item.objection}</p>
              <p className="text-sm text-[#cbd5e1] italic">{item.response}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Voicemail */}
      <SectionCard title="Voicemail Script" icon={Phone} index={5}>
        <ScriptBlock>
          &ldquo;Hey, this is [NAME]. We help contractors recover missed inbound leads and respond faster when calls get missed or come in after hours. I wanted to see if that&apos;s something worth a quick conversation on your end. My number is [NUMBER]. Again, [NUMBER].&rdquo;
        </ScriptBlock>
      </SectionCard>

      {/* Good vs bad outcomes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard title="Good Call Outcome" icon={CheckCircle2} index={6}>
          <div className="space-y-1.5">
            {['Pain identified', 'Email collected', 'Demo booked', 'Callback time set'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm text-[#e2e8f0]">{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Bad Call Outcome" icon={ArrowRight} index={7}>
          <div className="space-y-1.5">
            {['Long awkward pitch', 'No question asked', 'No next step'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-red-400 text-xs">✕</span>
                <span className="text-sm text-[#94a3b8]">{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ─── Cold Email Tab ─── */
function ColdEmailTab() {
  return (
    <div className="space-y-5">
      {/* Key highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Highlight icon={Mail} label="Sequence Length" color="blue">
          <p className="text-lg font-semibold text-blue-400">4 Emails</p>
          <p className="text-xs text-[#94a3b8] mt-1">Spaced 2–4 days apart</p>
        </Highlight>
        <Highlight icon={Target} label="Goal" color="emerald">
          <p className="font-medium">Get opens, replies, demo interest</p>
          <p className="text-xs text-[#94a3b8] mt-1">Don&apos;t sound like spam</p>
        </Highlight>
        <Highlight icon={MessageCircle} label="Best CTA" color="purple">
          <p className="font-medium">&ldquo;Want me to send the demo?&rdquo;</p>
          <p className="text-xs text-[#94a3b8] mt-1">Low friction wins</p>
        </Highlight>
      </div>

      {/* Core rules */}
      <SectionCard title="Core Rules" icon={CheckCircle2} index={0}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Do</p>
            {['Short emails', 'Plain language', 'Low-friction CTA', 'Direct subject lines'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm text-[#e2e8f0]">{item}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-1">Don&apos;t</p>
            {['Giant paragraphs', 'Fake personalization', 'Hypey AI language', 'Too many links', 'Marketing-agency buzzwords'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[#64748b]">
                <span className="text-xs">✕</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Email sequence */}
      {[
        {
          num: 1,
          title: 'Initial Outreach',
          timing: 'Day 1',
          subjects: ['quick question', 'missed calls', 'inbound leads', 'quick idea for [Company Name]'],
          body: `Hi [First Name],\n\nQuick question — if a call gets missed at [Company Name], what usually happens next?\n\nWe help contractors recover missed inbound leads and follow up faster when calls get missed or come in after hours.\n\nThe goal is simple: convert more of the leads you already pay for into booked estimates.\n\nWorth a quick look?\n\n— [Name]`,
        },
        {
          num: 2,
          title: 'Follow-Up',
          timing: '2–4 days later',
          subjects: ['following up', 'quick follow-up', 'missed lead follow-up'],
          body: `Hi [First Name],\n\nFollowing up here.\n\nA lot of contractors are paying for Google leads or inbound calls but still lose opportunities when calls get missed or follow-up is slow.\n\nWe built a system that helps recover those missed leads, qualify them, and flag hot ones faster.\n\nIf you want, I can send over a quick overview.\n\n— [Name]`,
        },
        {
          num: 3,
          title: 'Soft Pain Angle',
          timing: 'A few days later',
          subjects: ['one more question', 'quick thought', 'last note'],
          body: `Hi [First Name],\n\nOne quick question before I close this out:\n\nAre you fully confident no paid leads are slipping through the cracks from missed calls or after-hours follow-up delays?\n\nThat's the problem we help fix.\n\nIf it's worth a quick look, I can send over a short demo.\n\n— [Name]`,
        },
        {
          num: 4,
          title: 'Final Touch',
          timing: 'A few days later',
          subjects: ['close this out?', 'should I close the loop?'],
          body: `Hi [First Name],\n\nI'll close the loop after this.\n\nWe help contractors convert more of the leads they already pay for by instantly following up on missed calls, qualifying prospects, and helping book more estimates.\n\nIf you ever want to see it, I can send the demo.\n\n— [Name]`,
        },
      ].map((email, i) => (
        <SectionCard key={email.num} title={`Email ${email.num} — ${email.title}`} icon={Mail} index={i + 1}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-[#64748b]" />
            <span className="text-xs text-[#64748b]">{email.timing}</span>
          </div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">Subject line options</p>
            <div className="flex flex-wrap gap-1.5">
              {email.subjects.map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-300">{s}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
            <pre className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap font-sans">{email.body}</pre>
          </div>
        </SectionCard>
      ))}

      {/* Personalization */}
      <SectionCard title="Personalization Guide" icon={Users} index={6}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['Company name', 'Owner name', 'City (if relevant)', 'Trade / niche'].map((item) => (
            <div key={item} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-[#e2e8f0]">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#64748b] mt-2">Light personalization only — do not write fake custom intros.</p>
      </SectionCard>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdminSalesPlaybook() {
  const [activeTab, setActiveTab] = useState<PlaybookTab>('offer');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales Playbook</h1>
        <p className="text-sm text-[#64748b] mt-0.5">Offer positioning, scripts, and outreach sequences</p>
      </div>

      {/* Tab bar */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass-subtle p-1.5 flex gap-1 rounded-2xl"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${active
                  ? 'bg-purple-500/[0.12] text-white border border-purple-500/[0.2]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04] border border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Tab content */}
      {activeTab === 'offer' && <OfferTab />}
      {activeTab === 'cold-call' && <ColdCallTab />}
      {activeTab === 'cold-email' && <ColdEmailTab />}
    </div>
  );
}
