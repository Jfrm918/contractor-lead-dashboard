import { Panel, SectionLabel, H1, H2, Kicker } from "@/components/Panel";

const sections = [
  {
    title: "Business basics",
    items: [
      "Legal business name + DBA, if any",
      "Owner / decision-maker name + cell + email",
      "Physical address (or service-area if mobile)",
      "Years in business",
      "Crew size (helps with photo selection)",
    ],
  },
  {
    title: "What they sell",
    items: [
      "Top 3 services, ranked by revenue",
      "Most profitable service (we will weight this on the site)",
      "Service area — city, county, radius",
      "Price range — starts at $X, average ticket $Y",
      "What they refuse to do (helps qualify leads)",
    ],
  },
  {
    title: "The customer",
    items: [
      "Who buys most often (homeowner, GC, property manager, etc.)",
      "Why customers picked them last time, in their words",
      "Top 3 questions every customer asks before booking",
      "Top objection that kills deals",
    ],
  },
  {
    title: "Visual + voice",
    items: [
      "Existing logo file (any format)",
      "Brand colors, if defined (HEX or photo of truck)",
      "10–30 photos: real jobs, real crew, real product",
      "Anything they want kept out (people, addresses, etc.)",
      "Tone preference: friendly, dead-serious, technical, plain",
    ],
  },
  {
    title: "Where they are now",
    items: [
      "Current website URL (we already have it)",
      "What they hate about it",
      "Where leads currently come from (referrals, Google, Facebook)",
      "Google Business Profile claimed? Reviews count?",
      "Existing domain registrar + login status",
    ],
  },
  {
    title: "Where they want to go",
    items: [
      "One sentence on what the new site is for (book jobs, build trust, list services)",
      "Target: phone calls, form fills, both, neither",
      "Competitors they think are doing it right",
      "Anything off-limits (no quote calculator, no chatbot, etc.)",
    ],
  },
  {
    title: "Logistics",
    items: [
      "Best contact method during the build",
      "Decision-maker for approvals — one person",
      "Timeline expectations / hard deadlines (event, season, etc.)",
      "Email host today (Gmail, Outlook, GoDaddy, none)",
    ],
  },
];

export default function Discovery() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
      <Kicker>Discovery · 15-minute call</Kicker>
      <H1 className="mt-5 max-w-3xl">One call. <em className="text-[var(--accent-bright)]">One doc.</em> No second meeting.</H1>
      <p className="mt-5 text-lg text-[var(--ink-dim)] max-w-2xl">
        Madison runs the call. Everything below lands in one shared Google Doc that drives the
        build. If we walk away missing something, the studio gets it by email — not by booking
        another 30 minutes on the client&apos;s calendar.
      </p>

      <div className="mt-12 grid md:grid-cols-2 gap-5">
        {sections.map((s) => (
          <Panel key={s.title} className="p-7">
            <div className="font-display text-xl mb-4">{s.title}</div>
            <ol className="space-y-2.5 text-sm">
              {s.items.map((it, i) => (
                <li key={it} className="flex gap-3 text-[var(--ink-dim)]">
                  <span className="tabular text-[var(--ink-faint)] w-5">{(i + 1).toString().padStart(2, "0")}</span>
                  <span className="leading-relaxed">{it}</span>
                </li>
              ))}
            </ol>
          </Panel>
        ))}
      </div>

      <div className="mt-16">
        <SectionLabel>Madison&apos;s call script — opening</SectionLabel>
        <Panel className="p-7">
          <H2>The 60-second open.</H2>
          <p className="mt-4 text-[var(--ink-dim)] leading-relaxed">
            <em>&quot;Hey [name], thanks for jumping on. I&apos;ll keep this to fifteen minutes — promise.
            What we want to walk away with is enough to actually build you a draft site this
            week, so I&apos;m going to ask short questions and you give short answers. If something
            doesn&apos;t apply, just say &lsquo;skip.&rsquo; Sound good?&quot;</em>
          </p>
          <div className="hairline my-6" />
          <H2>The close at minute 14.</H2>
          <p className="mt-4 text-[var(--ink-dim)] leading-relaxed">
            <em>&quot;Perfect. Last thing — what would have to be true on this site for you to look at
            it and say, &lsquo;yeah, send people here&rsquo;? ... Got it. I&apos;ll have the staging link in
            your inbox in [X] days. Anything urgent in the meantime, you&apos;ve got my email.&quot;</em>
          </p>
        </Panel>
      </div>

      <div className="mt-16">
        <SectionLabel>Asset request — sent within an hour of the call</SectionLabel>
        <Panel className="p-7">
          <ol className="space-y-3 text-sm text-[var(--ink-dim)] list-decimal pl-5">
            <li>Email subject: &quot;Green Country — assets we need to start [business name]&quot;</li>
            <li>Shared Drive folder link, pre-created and labeled by section.</li>
            <li>Plain-English list of what to drop in (photos, logo file, copy notes).</li>
            <li>Soft deadline: 5 business days. After that, build pauses and the timeline slips one week per slip — as written in the contract.</li>
          </ol>
        </Panel>
      </div>
    </div>
  );
}
