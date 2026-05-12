import { Panel, SectionLabel, H1, Kicker } from "@/components/Panel";
import { Hammer, MessageCircle, Cpu, Radar } from "lucide-react";

const roles = [
  {
    name: "Jason",
    role: "Founder · Closer",
    icon: Hammer,
    color: "var(--accent)",
    owns: [
      "Final go/no-go on every prospect Argus flags",
      "First call when a lead converts to a meeting",
      "Closing the sale, taking the deposit",
      "Strategic direction — pricing, tier mix, niche pivots",
      "Bank account, Stripe, contracts in his name",
    ],
    doesNotOwn: [
      "Daily prospecting (Argus)",
      "Building the site (Athena)",
      "Cold outreach copy and follow-up cadence (Madison)",
    ],
    timeBudget: "≤ 4 hrs/week. Two close calls + admin.",
  },
  {
    name: "Madison",
    role: "Co-founder · Voice + Outreach",
    icon: MessageCircle,
    color: "var(--accent-bright)",
    owns: [
      "Sender voice for every cold email and follow-up",
      "Cadence: day 0, day 3, day 7, day 14",
      "First reply when a prospect responds",
      "Discovery call facilitation (15 min)",
      "Testimonial requests at handoff",
      "Social presence (Instagram + LinkedIn light)",
    ],
    doesNotOwn: [
      "Closing the sale (Jason)",
      "Build work (Athena)",
      "Lead generation (Argus)",
    ],
    timeBudget: "≤ 5 hrs/week. Cold sends on Mon/Wed, follow-ups daily.",
  },
  {
    name: "Athena",
    role: "AI Operator · Build + Ops",
    icon: Cpu,
    color: "#9db8d8",
    owns: [
      "Full Webflow build per signed contract",
      "Asset prep: image compression, alt text, SEO",
      "Demo mock for prospects pre-call",
      "Handoff packet — Looms, docs, login transfer",
      "Pipeline tracking inside this hub",
      "Coordination with Argus via SHARED.md",
    ],
    doesNotOwn: [
      "Talking to clients in voice/video (Madison + Jason)",
      "Hosting client sites on her infrastructure (never)",
      "Picking which leads to pursue (Jason + Madison)",
    ],
    timeBudget: "Unlimited. Backend.",
  },
  {
    name: "Argus",
    role: "AI Prospector · Signal",
    icon: Radar,
    color: "#c4a3e8",
    owns: [
      "Twice-daily scan of Tulsa-area business directories",
      "Site quality scoring (mobile + desktop)",
      "Top 5 candidates per scan → Telegram digest",
      "Journal of every lead surfaced (for hit-rate)",
      "Stays in its lane: no outreach, no closing",
    ],
    doesNotOwn: [
      "Outreach to prospects (Madison)",
      "Building the demo mock (Athena)",
      "Selecting which to actually pitch (Jason)",
    ],
    timeBudget: "Cron. Runs unattended.",
  },
];

export default function Roles() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
      <Kicker>Roles · Four-person crew</Kicker>
      <H1 className="mt-5 max-w-3xl">Two humans. <em className="text-[var(--accent-bright)]">Two AIs.</em> One pipeline.</H1>
      <p className="mt-5 text-lg text-[var(--ink-dim)] max-w-2xl">
        The whole point of Green Country Web Co. is that it runs on four hours a week of human time.
        Anyone doing what someone else owns is the leak.
      </p>

      <div className="mt-12 grid md:grid-cols-2 gap-5">
        {roles.map((r) => (
          <Panel key={r.name} className="p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center glass-crisp"
                  style={{ color: r.color }}
                >
                  <r.icon size={18} />
                </div>
                <div>
                  <div className="font-display text-2xl">{r.name}</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--ink-faint)] mt-0.5">{r.role}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-2">Owns</div>
              <ul className="space-y-1.5 text-sm text-[var(--ink-dim)]">
                {r.owns.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 rounded-full bg-[var(--accent)] shrink-0" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hairline my-5" />

            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-2">Does not own</div>
              <ul className="space-y-1.5 text-sm text-[var(--ink-faint)]">
                {r.doesNotOwn.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 rounded-full bg-[var(--ink-faint)] shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 text-xs">
              <span className="chip chip-neutral">Time budget · {r.timeBudget}</span>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-16">
        <SectionLabel>Handoff between roles</SectionLabel>
        <Panel className="p-7">
          <div className="grid sm:grid-cols-4 gap-5 text-sm">
            <Handoff from="Argus" to="Jason + Madison" event="New leads, 2× / day" />
            <Handoff from="Jason" to="Madison" event="Approved leads → outreach" />
            <Handoff from="Madison" to="Jason" event="Reply received → call booked" />
            <Handoff from="Jason" to="Athena" event="Contract signed → build starts" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Handoff({ from, to, event }: { from: string; to: string; event: string }) {
  return (
    <div>
      <div className="font-display text-[var(--accent-bright)]">
        {from} <span className="text-[var(--ink-faint)]">→</span> {to}
      </div>
      <div className="text-xs text-[var(--ink-dim)] mt-1.5 leading-relaxed">{event}</div>
    </div>
  );
}
