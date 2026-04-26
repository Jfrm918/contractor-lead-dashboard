'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  GitCommit,
  CheckCircle2,
  Circle,
  Wrench,
  ArrowRight,
  BookOpen,
  Layers,
  MessageSquare,
  ClipboardList,
  BarChart3,
  Users,
  FlaskConical,
  Thermometer,
  Droplets,
  Brain,
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

interface DocEntry {
  title: string;
  purpose: string;
  status: 'Live in App' | 'Spec Complete' | 'Template Ready' | 'In Progress';
  icon: typeof FileText;
}

const docs: DocEntry[] = [
  {
    title: 'V1 Build Brief',
    purpose: 'Original scope and feature list for the initial contractor lead dashboard.',
    status: 'Live in App',
    icon: Layers,
  },
  {
    title: 'V2 Brief + Tulsa Asset Integration',
    purpose: 'Premium visual upgrade, admin dashboard, and Tulsa background integration spec.',
    status: 'Live in App',
    icon: Layers,
  },
  {
    title: 'Operating Logic Spec',
    purpose: 'Core system logic for lead intake, qualification flow, missed-call recovery, and routing rules.',
    status: 'Spec Complete',
    icon: BookOpen,
  },
  {
    title: 'SMS + Qualification Playbook',
    purpose: 'Step-by-step SMS response templates, qualification questions, and urgency scoring methodology.',
    status: 'Spec Complete',
    icon: MessageSquare,
  },
  {
    title: 'Client Onboarding Spec',
    purpose: 'Onboarding checklist, phone provisioning, script approval workflow, and go-live criteria.',
    status: 'Spec Complete',
    icon: Users,
  },
  {
    title: 'Monthly Scorecard Template',
    purpose: 'Recurring performance report covering lead volume, conversion, recovery rate, and ROI.',
    status: 'Template Ready',
    icon: BarChart3,
  },
];

const commits = [
  { hash: 'fe48081', message: 'V1 build brief', tag: 'Foundation' },
  { hash: '3e5f59c', message: 'V2 brief + Tulsa asset', tag: 'Visual Upgrade' },
  { hash: 'bbaeb69', message: 'Operating logic spec', tag: 'System Logic' },
  { hash: 'b5bc694', message: 'SMS + qualification playbook', tag: 'Playbook' },
  { hash: '2dff9be', message: 'Client onboarding spec', tag: 'Onboarding' },
  { hash: '53751d0', message: 'Monthly scorecard template', tag: 'Reporting' },
];

interface SystemItem {
  label: string;
  built: boolean;
  detail: string;
}

const systemStatus: SystemItem[] = [
  { label: 'Client dashboard with lead management', built: true, detail: 'Overview, leads list, lead detail, alerts, scorecard' },
  { label: 'Admin dashboard with client roster', built: true, detail: 'System metrics, client health, drill-down views' },
  { label: 'Admin operations panel', built: true, detail: 'Billing, support queue, onboarding tracker, automation health' },
  { label: 'Premium liquid-glass UI', built: true, detail: 'Tulsa background, glass panels, animations, responsive layout' },
  { label: 'Auth flow with demo login', built: true, detail: 'Sign-in screen, session context, admin/client mode toggle' },
  { label: 'SMS / Twilio integration', built: false, detail: 'Spec complete — awaiting backend implementation' },
  { label: 'Qualification engine', built: false, detail: 'Spec complete — scoring logic defined, needs API wiring' },
  { label: 'Missed-call recovery automation', built: false, detail: 'Spec complete — trigger rules documented' },
  { label: 'Client onboarding workflow', built: false, detail: 'Spec complete — steps defined, needs backend + notifications' },
  { label: 'Monthly scorecard email delivery', built: false, detail: 'Template ready — needs email service integration' },
];

const nextSteps = [
  { priority: 'High', item: 'Wire Twilio for SMS intake and missed-call detection', reason: 'Core revenue driver — enables real lead recovery' },
  { priority: 'High', item: 'Build qualification scoring API', reason: 'Automates lead triage and reduces operator workload' },
  { priority: 'Medium', item: 'Implement client onboarding backend', reason: 'Streamlines new client activation and phone provisioning' },
  { priority: 'Medium', item: 'Connect real data layer (database + API routes)', reason: 'Replaces seed data with live client data' },
  { priority: 'Low', item: 'Automated monthly scorecard generation and email', reason: 'Provides hands-off recurring value proof to clients' },
  { priority: 'Low', item: 'Webhook integrations (Zapier, CRM sync)', reason: 'Expands platform reach into existing contractor workflows' },
];

const envergeKnowledge = {
  currentFocus: 'Enverge EasySeal .5 open-cell spray foam',
  operatorBaseline: {
    hose: '145°F',
    aSide: '95°F',
    bSide: '100°F',
    note: 'Jason’s stated usual starting point this time of year: 145 all the way across, A-side barrel 95, B-side barrel 100.',
  },
  proofOfKnowledge: [
    'Current research priority is Enverge chemicals and Graco E-30 equipment.',
    'Immediate product focus is Enverge EasySeal .5.',
    'Useful knowledge standard here is not generic spray foam talk — it is job-usable dial-in knowledge tied to actual field settings, conditions, and outcomes.',
    'The dashboard should become the place where Jason can verify accumulated Enverge knowledge, job observations, dial-in patterns, and recommendations without relying on chat memory.',
  ],
  buildStandard: [
    'Track actual start settings used on each job.',
    'Track weather / ambient conditions with each spray session.',
    'Track substrate, yield, spray feel, shrink, pull-away, rolling, and finish quality.',
    'Convert repeated field observations into practical Enverge EasySeal .5 guidance over time.',
  ],
  nextResearchTargets: [
    'How EasySeal .5 responds to seasonal ambient swings.',
    'How barrel temperature shifts affect spray feel and structure.',
    'What recurring defects correlate to heat, substrate, and humidity.',
    'What repeatable starting ranges work best on Jason’s rig with Graco E-30 behavior.'
  ]
};

function getStatusColor(status: DocEntry['status']) {
  switch (status) {
    case 'Live in App': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'Spec Complete': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'Template Ready': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'In Progress': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'High': return 'text-red-400';
    case 'Medium': return 'text-amber-400';
    case 'Low': return 'text-blue-400';
    default: return 'text-[#94a3b8]';
  }
}

export default function AdminDocs() {
  const builtCount = systemStatus.filter(s => s.built).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Build Log</h1>
        <p className="text-sm text-[#64748b] mt-0.5">Workspace documents, build history, and system status</p>
      </div>

      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-5"
      >
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          Enverge / Spray Foam Proof of Knowledge
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
          <div className="glass-subtle p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Current Focus</p>
            </div>
            <p className="text-base font-semibold text-[#e2e8f0]">{envergeKnowledge.currentFocus}</p>
            <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
              This section is the in-dashboard record of usable Enverge knowledge, not generic filler.
            </p>
          </div>

          <div className="glass-subtle p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Current Starting Temps</p>
            </div>
            <div className="space-y-1.5 text-sm text-[#e2e8f0]">
              <p>Hose / across: <span className="text-amber-300 font-medium">{envergeKnowledge.operatorBaseline.hose}</span></p>
              <p>A-side barrel: <span className="text-amber-300 font-medium">{envergeKnowledge.operatorBaseline.aSide}</span></p>
              <p>B-side barrel: <span className="text-amber-300 font-medium">{envergeKnowledge.operatorBaseline.bSide}</span></p>
            </div>
            <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">{envergeKnowledge.operatorBaseline.note}</p>
          </div>

          <div className="glass-subtle p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Knowledge Standard</p>
            </div>
            <p className="text-sm text-[#e2e8f0] leading-relaxed">
              Field-usable Enverge EasySeal .5 knowledge tied to real spray behavior, defects, weather, substrate, and machine settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-subtle p-4 rounded-2xl">
            <p className="text-sm font-semibold mb-3 text-[#e2e8f0]">Proof logged now</p>
            <div className="space-y-2">
              {envergeKnowledge.proofOfKnowledge.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-subtle p-4 rounded-2xl">
            <p className="text-sm font-semibold mb-3 text-[#e2e8f0]">What this section should keep proving</p>
            <div className="space-y-2">
              {envergeKnowledge.buildStandard.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                  <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-subtle p-4 rounded-2xl mt-4">
          <p className="text-sm font-semibold mb-3 text-[#e2e8f0]">Next Enverge EasySeal .5 research targets</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {envergeKnowledge.nextResearchTargets.map((item) => (
              <div key={item} className="text-sm text-[#cbd5e1] bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2">
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Documents */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-5"
      >
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Workspace Documents
        </h2>
        <div className="space-y-2">
          {docs.map((doc) => {
            const Icon = doc.icon;
            return (
              <div key={doc.title} className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#94a3b8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{doc.title}</p>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{doc.purpose}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Commit history */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-purple-400" />
            Build History
          </h2>
          <div className="space-y-1">
            {commits.map((commit, idx) => (
              <div key={commit.hash} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="relative flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  {idx < commits.length - 1 && (
                    <div className="w-px h-6 bg-white/[0.06] absolute top-3" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] text-purple-400 font-mono">{commit.hash}</code>
                    <span className="text-xs text-[#64748b] px-1.5 py-0.5 rounded bg-white/[0.03]">{commit.tag}</span>
                  </div>
                  <p className="text-sm text-[#e2e8f0] mt-0.5">{commit.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Current system status */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="glass p-5"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            Current System Status
          </h2>
          <p className="text-xs text-[#64748b] mb-4">
            {builtCount} of {systemStatus.length} capabilities built — {systemStatus.length - builtCount} exist as specs/docs only
          </p>
          <div className="space-y-1.5">
            {systemStatus.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                {item.built ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-[#475569] flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm ${item.built ? 'text-[#e2e8f0]' : 'text-[#94a3b8]'}`}>{item.label}</p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Next steps */}
      <motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass p-5"
      >
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-amber-400" />
          Next Steps
        </h2>
        <div className="space-y-2">
          {nextSteps.map((step) => (
            <div key={step.item} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-0.5 ${getPriorityColor(step.priority)}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-[#e2e8f0]">{step.item}</p>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${getPriorityColor(step.priority)}`}>
                    {step.priority}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] mt-1">{step.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
