import Link from "next/link";
import { Panel, SectionLabel, H1, H2, Kicker, NeutralChip } from "@/components/Panel";
import { ArrowUpRight, Compass, Coins, ListChecks, Users, FileText, Search, Handshake, Activity } from "lucide-react";

const tiles = [
  { href: "/pricing", label: "Pricing", note: "Three tiers, one-time", icon: Coins },
  { href: "/process", label: "Process", note: "Eight-step build", icon: ListChecks },
  { href: "/roles", label: "Roles", note: "Who does what", icon: Users },
  { href: "/discovery", label: "Discovery", note: "15-min intake", icon: Search },
  { href: "/contract", label: "Contract", note: "Scope + handoff terms", icon: FileText },
  { href: "/handoff", label: "Handoff", note: "Walk-away packet", icon: Handshake },
  { href: "/pipeline", label: "Pipeline", note: "Argus leads → close", icon: Activity },
  { href: "/", label: "Compass", note: "Why we exist", icon: Compass },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Kicker>Internal Hub · v0.1</Kicker>
          <H1 className="mt-5">
            Professional websites for local businesses in
            <span className="text-[var(--accent-bright)]"> greater Tulsa.</span>
          </H1>
          <p className="mt-6 text-lg text-[var(--ink-dim)] max-w-2xl leading-relaxed">
            Green Country Web Co. builds custom one-page and multi-page sites for the
            trades, restaurants, and service businesses that drive the local economy.
            One-time pricing. Clean handoff. Optional Care Plan, no mandatory retainer.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/process"
              className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] text-[#0a0a0a] text-sm font-medium hover:bg-[var(--accent-bright)] transition"
            >
              See the 8-step build
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass glass-hover text-sm"
            >
              Pricing
            </Link>
            <NeutralChip>Validation phase</NeutralChip>
          </div>
        </div>

        <div className="lg:col-span-4">
          <Panel className="p-6 h-full relative overflow-hidden">
            <SectionLabel>What good looks like</SectionLabel>
            <div className="space-y-4 mt-2">
              <Stat label="Per-build price" value="$1.5–3.5K" sub="One-time, 50/50 split" />
              <div className="hairline" />
              <Stat label="Build window" value="7–10 days" sub="From signed to launched" />
              <div className="hairline" />
              <Stat label="Care Plan" value="$150/mo" sub="Optional, 50% attach target" />
              <div className="hairline" />
              <Stat label="Support window" value="30 days" sub="Then Care Plan or hourly" />
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-12 mt-6">
          <SectionLabel>Hub map</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiles.map((t) => (
              <Link key={t.label + t.href} href={t.href}>
                <Panel hover className="p-5 h-full">
                  <div className="flex items-center justify-between">
                    <t.icon size={18} className="text-[var(--accent)]" />
                    <ArrowUpRight size={14} className="text-[var(--ink-faint)]" />
                  </div>
                  <div className="mt-4 font-display text-xl">{t.label}</div>
                  <div className="text-xs text-[var(--ink-faint)] mt-1">{t.note}</div>
                </Panel>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 mt-6">
          <Panel className="p-7 h-full">
            <SectionLabel>The angle</SectionLabel>
            <H2>Saturated market, automated edge.</H2>
            <p className="mt-4 text-[var(--ink-dim)] leading-relaxed">
              Local web design is the most crowded freelance niche on the internet. The
              part that <em>isn&apos;t</em> crowded is doing it with full automation in the back office.
              The studio scans the city twice a day for businesses with sites that are slow, broken, or
              embarrassing on a phone. A working demo gets built before the first call. Madison
              sends it. Madison closes it. The work the competition pays for, we don&apos;t.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[var(--ink-dim)]">
              <Bullet>Free prospecting. Zero per-lead cost.</Bullet>
              <Bullet>Demo mock sent <em>before</em> the call.</Bullet>
              <Bullet>Tulsa-area focus — under-served by national agencies.</Bullet>
              <Bullet>Webflow handoff — they own the site, not us.</Bullet>
            </ul>
          </Panel>
        </div>

        <div className="lg:col-span-6 mt-6">
          <Panel className="p-7 h-full">
            <SectionLabel>What we will not do</SectionLabel>
            <H2>Walk away clean. Every time.</H2>
            <p className="mt-4 text-[var(--ink-dim)] leading-relaxed">
              The reason most freelancers stay stuck is they never escape their first
              ten customers. Hosting on the studio&apos;s account. Domain in the studio&apos;s name. Login
              on the studio&apos;s email. Forever. Green Country refuses the trap. Every build is set up
              on the client&apos;s credit card and credentials from day one. The studio is a
              collaborator during the build, removed at launch unless they opt into the Care Plan.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[var(--ink-dim)]">
              <Bullet>No mandatory retainer — Care Plan is opt-in.</Bullet>
              <Bullet>No hosting on the studio&apos;s infrastructure.</Bullet>
              <Bullet>30-day post-launch support, then Care Plan or hourly.</Bullet>
              <Bullet>Final payment due before domain points to live site.</Bullet>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">{label}</div>
      <div className="mt-1 font-display text-3xl tabular text-[var(--ink)]">{value}</div>
      <div className="text-xs text-[var(--ink-faint)] mt-0.5">{sub}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 h-1 w-1 rounded-full bg-[var(--accent)] shrink-0" />
      <span>{children}</span>
    </li>
  );
}
