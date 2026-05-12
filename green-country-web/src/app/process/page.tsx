import { Panel, SectionLabel, H1, Kicker } from "@/components/Panel";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Sale closes",
    owner: "Madison",
    body: "Verbal yes turns into a signed Green Country Web Co. contract (see Contract page). 50% deposit hits before discovery is scheduled. No deposit, no build.",
    artifacts: ["Signed contract", "50% deposit cleared"],
  },
  {
    n: "02",
    title: "Discovery call · 15 min",
    owner: "Madison runs",
    body: "Single call. The studio collects content, logos, hours, services, photos, social links, target customer, and what their old site got wrong. One Google Doc captures everything. No second call before draft.",
    artifacts: ["Discovery doc", "Asset folder (Drive)"],
  },
  {
    n: "03",
    title: "Account setup — in client's name",
    owner: "Studio guides, client clicks",
    body: "Walk them through signing up for: domain registrar (Cloudflare or Namecheap), Webflow hosting plan, and Google Workspace email — all on their credit card. They add the studio as a collaborator on Webflow. The studio never touches their billing.",
    artifacts: ["Domain registered", "Webflow workspace + invite", "Email tenant created"],
  },
  {
    n: "04",
    title: "Build the site",
    owner: "Studio",
    body: "Webflow. Custom layout, mobile-responsive baked in, real copy from the discovery doc, real photos. 6–12 hours of work once a template library is dialed. No Lorem ipsum, no stock photos of smiling models in headsets.",
    artifacts: ["Working draft on staging URL"],
  },
  {
    n: "05",
    title: "Show client + edit round",
    owner: "Madison presents",
    body: "Send the staging URL with a 60-second Loom walkthrough. One round of edits inside scope. A second round counts as the included revision. Anything past that is billable at $75/hr — contract says so.",
    artifacts: ["Staging URL", "Loom walkthrough", "Edit list (1 round)"],
  },
  {
    n: "06",
    title: "Final payment + launch",
    owner: "Madison collects, studio ships",
    body: "Remaining 50% clears. The studio points the domain at Webflow, publishes the site, sets up SSL, verifies on mobile + desktop + a real phone. Sitemap pinged to Google.",
    artifacts: ["Live site at their domain", "SSL active", "Sitemap submitted"],
  },
  {
    n: "07",
    title: "Handoff packet",
    owner: "Studio delivers",
    body: "One Notion page or PDF: every login (theirs, not ours), a 5-minute Loom on how to edit text and swap photos, a 5-minute Loom on adding a page, our support email, and the 30-day clock.",
    artifacts: ["Handoff packet sent", "Walkthrough Loom(s)"],
  },
  {
    n: "08",
    title: "Remove ourselves",
    owner: "Studio",
    body: "Day 30 (or sooner if client asks): the studio leaves the Webflow workspace. Domain stays with them, hosting stays on their card, email stays in their Google. Zero infrastructure dependency. Move on. Exception: if they opted into Care Plan, the studio stays connected for billed-recurring access only.",
    artifacts: ["Workspace access removed", "Project archived"],
  },
];

export default function Process() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
      <Kicker>Process · 8 steps</Kicker>
      <H1 className="mt-5 max-w-3xl">Signed to walked-away, <em className="text-[var(--accent-bright)]">in 10 working days.</em></H1>
      <p className="mt-5 text-lg text-[var(--ink-dim)] max-w-2xl">
        Every step has an owner, a deliverable, and a gate. No mystery, no
        scope creep, no &quot;we&apos;ll get to it.&quot;
      </p>

      <div className="mt-12 space-y-4">
        {steps.map((s, i) => (
          <Panel key={s.n} className="p-7">
            <div className="grid sm:grid-cols-[80px_1fr_240px] gap-6 items-start">
              <div>
                <div className="font-display text-5xl tabular text-[var(--ink-faint)]">{s.n}</div>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="font-display text-2xl">{s.title}</div>
                  <span className="chip-neutral chip">{s.owner}</span>
                </div>
                <p className="mt-3 text-[var(--ink-dim)] leading-relaxed">{s.body}</p>
              </div>
              <div className="text-xs">
                <div className="uppercase tracking-[0.16em] text-[var(--ink-faint)] mb-2">Artifacts</div>
                <ul className="space-y-1.5">
                  {s.artifacts.map((a) => (
                    <li key={a} className="flex gap-2 text-[var(--ink-dim)]">
                      <ArrowRight size={12} className="mt-1 text-[var(--accent)] shrink-0" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {i < steps.length - 1 && <div className="hairline mt-7" />}
          </Panel>
        ))}
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-5">
        <Panel className="p-7">
          <SectionLabel>What kills a build</SectionLabel>
          <ul className="space-y-3 text-sm text-[var(--ink-dim)]">
            <li>• Client takes &gt;7 days to send photos/copy → invoice paused, timeline slips one week per slip.</li>
            <li>• Scope expansion mid-build → priced separately, signed addendum or it doesn&apos;t happen.</li>
            <li>• Late-stage redesign request → counts as a new project at the same tier price.</li>
            <li>• Failure to pay final 50% → site stays on staging, domain does not point.</li>
          </ul>
        </Panel>
        <Panel className="p-7">
          <SectionLabel>What makes a build smooth</SectionLabel>
          <ul className="space-y-3 text-sm text-[var(--ink-dim)]">
            <li>• Discovery doc complete before account setup starts.</li>
            <li>• Client puts one decision-maker on email — not a committee.</li>
            <li>• Photos delivered as a single shared Drive folder.</li>
            <li>• Edits in one batch, not drip-fed.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
