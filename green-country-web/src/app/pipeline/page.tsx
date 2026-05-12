import { Panel, SectionLabel, H1, Kicker, NeutralChip } from "@/components/Panel";

const columns = [
  {
    name: "Argus surfaced",
    count: 0,
    description: "Twice-daily scan. Top 5 candidates with site-quality scores.",
    color: "var(--ink-faint)",
  },
  {
    name: "Approved to outreach",
    count: 0,
    description: "Jason or Madison gave a green light. Awaiting cold send.",
    color: "var(--accent)",
  },
  {
    name: "In outreach",
    count: 0,
    description: "Cold email sent. Day 0 → Day 14 cadence.",
    color: "var(--accent-bright)",
  },
  {
    name: "Replied / call booked",
    count: 0,
    description: "Live thread. Madison runs reply, Jason takes the call.",
    color: "#9db8d8",
  },
  {
    name: "Proposal sent",
    count: 0,
    description: "Quoted price + contract. Awaiting signature + deposit.",
    color: "#c4a3e8",
  },
  {
    name: "Building",
    count: 0,
    description: "Signed. Athena is shipping. Inside 10-business-day clock.",
    color: "#e8a575",
  },
  {
    name: "Shipped",
    count: 0,
    description: "Site live, handoff packet delivered, 30-day clock running.",
    color: "#75d8a5",
  },
];

export default function Pipeline() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
      <Kicker>Pipeline · Live</Kicker>
      <H1 className="mt-5 max-w-3xl">Where every lead lives <em className="text-[var(--accent-bright)]">until it ships or dies.</em></H1>
      <p className="mt-5 text-lg text-[var(--ink-dim)] max-w-2xl">
        Seven columns. Argus drops at the top, builds drop out the bottom. Each card carries
        a business name, site URL, score, and the next action with an owner.
      </p>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Panel className="p-5" crisp>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">Pipeline value</div>
          <div className="mt-2 font-display text-3xl tabular text-[var(--accent-bright)]">$0</div>
          <div className="text-xs text-[var(--ink-faint)] mt-1">Sum of in-flight × tier price</div>
        </Panel>
        <Panel className="p-5" crisp>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">Open builds</div>
          <div className="mt-2 font-display text-3xl tabular">0</div>
          <div className="text-xs text-[var(--ink-faint)] mt-1">Cap: 3 concurrent</div>
        </Panel>
        <Panel className="p-5" crisp>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">Outreach this week</div>
          <div className="mt-2 font-display text-3xl tabular">0</div>
          <div className="text-xs text-[var(--ink-faint)] mt-1">Target: 25 sends / week</div>
        </Panel>
        <Panel className="p-5" crisp>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">Reply rate</div>
          <div className="mt-2 font-display text-3xl tabular">—</div>
          <div className="text-xs text-[var(--ink-faint)] mt-1">Replies ÷ sends, last 30d</div>
        </Panel>
      </div>

      <div className="mt-12">
        <SectionLabel>Stages</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((c) => (
            <Panel key={c.name} className="p-5 min-h-[180px] flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <div className="text-sm text-[var(--ink)]">{c.name}</div>
                </div>
                <div className="font-display text-xl tabular text-[var(--ink-faint)]">{c.count}</div>
              </div>
              <p className="mt-3 text-xs text-[var(--ink-faint)] leading-relaxed flex-1">{c.description}</p>
              <div className="mt-3 border-t border-dashed border-[var(--line)] pt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                Cards land here
              </div>
            </Panel>
          ))}
        </div>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-5">
        <Panel className="p-7">
          <SectionLabel>Argus scoring rubric</SectionLabel>
          <ul className="space-y-3 text-sm text-[var(--ink-dim)]">
            <li>• <span className="text-[var(--ink)]">Mobile broken</span> — fails Lighthouse mobile, no responsive viewport, horizontal scroll. +30</li>
            <li>• <span className="text-[var(--ink)]">No SSL</span> — HTTP-only or expired cert. +20</li>
            <li>• <span className="text-[var(--ink)]">Old design</span> — last-updated &gt; 2 yrs by inspection / copyright year. +15</li>
            <li>• <span className="text-[var(--ink)]">No CTA above the fold</span> — no phone, no form. +15</li>
            <li>• <span className="text-[var(--ink)]">Slow load</span> — &gt; 5s on 4G simulation. +10</li>
            <li>• <span className="text-[var(--ink)]">Stock-photo overload</span> — visual heuristic. +10</li>
          </ul>
          <div className="mt-5 text-xs text-[var(--ink-faint)]">
            Top 5 candidates by score → Telegram digest, twice daily.
          </div>
        </Panel>
        <Panel className="p-7">
          <SectionLabel>Validation phase — first 30 days</SectionLabel>
          <ul className="space-y-3 text-sm text-[var(--ink-dim)]">
            <li>• Goal: <span className="text-[var(--ink)]">1 paid build</span> in the first 30 days. That&apos;s it.</li>
            <li>• If 1 paid build: prove the model, then automate outreach.</li>
            <li>• If 0 paid builds after 25+ sends with reply rate &lt; 5%: market is saying no. Kill the project, refocus.</li>
            <li>• If 0 builds but reply rate &gt; 10%: pitch is wrong, not market. Iterate the demo.</li>
          </ul>
          <div className="mt-5">
            <NeutralChip>Status · Validation</NeutralChip>
          </div>
        </Panel>
      </div>
    </div>
  );
}
