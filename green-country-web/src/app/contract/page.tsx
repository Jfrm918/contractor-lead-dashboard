import { Panel, SectionLabel, H1, H2, Kicker } from "@/components/Panel";

const clauses = [
  {
    n: "01",
    title: "Scope of work",
    body: "Studio will design and deliver a [Storefront / Main Street / Main Street+] tier website per the spec attached as Exhibit A. Spec includes page count, feature list, and content sources.",
  },
  {
    n: "02",
    title: "Account ownership",
    body: "Client owns, and pays for, the domain registrar, hosting platform (Webflow), and email provider (Google Workspace). All accounts are created in Client&apos;s name and on Client&apos;s payment method. Studio is added as a collaborator only for the duration of build and 30-day support window.",
  },
  {
    n: "03",
    title: "Pricing and payment",
    body: "Total fee: $[XXXX]. 50% due on contract signing. Remaining 50% due before domain points to the live site. Studio reserves the right to leave the site on staging until final payment clears.",
  },
  {
    n: "04",
    title: "Timeline",
    body: "Build begins on Client&apos;s delivery of all assets listed in Exhibit B (Discovery Asset List). Standard delivery is 10 business days from asset receipt. Each day of late asset delivery extends the timeline by one business day. Rush delivery (5 business days) available for +25% of total fee.",
  },
  {
    n: "05",
    title: "Revisions",
    body: "Two rounds of revisions included within scope. A revision round is one consolidated list submitted within 3 business days of the staging link. A third round, or any change requested after launch within scope, is billable at $75 / hour, billed in 15-minute increments.",
  },
  {
    n: "06",
    title: "Out-of-scope changes",
    body: "Anything not listed in Exhibit A — additional pages, new features, integrations, copy rewrites, photo replacement after final round — is out of scope and requires a signed addendum at a quoted price. No verbal scope expansion.",
  },
  {
    n: "07",
    title: "Post-launch support",
    body: "Studio provides 30 days of bug-fix support beginning the day the domain points to the live site. &quot;Bug fix&quot; means: something Studio built does not function as specified in Exhibit A. After day 30, Client may engage Studio at $75 / hour or self-manage the site via the Handoff Packet (Exhibit C).",
  },
  {
    n: "08",
    title: "Intellectual property",
    body: "On final payment, Client owns all design, copy, and code delivered by Studio. Studio retains the right to display the work in its portfolio unless Client requests otherwise in writing.",
  },
  {
    n: "09",
    title: "Handoff and removal",
    body: "On day 30 of the support window (or sooner at Client&apos;s request), Studio removes itself as a collaborator from all Client accounts (Webflow, registrar, Google). Client retains full and exclusive control. Studio has no continuing obligation, recurring fee, or access.",
  },
  {
    n: "10",
    title: "Termination",
    body: "Either party may terminate before launch with 7 days written notice. Studio retains the deposit as compensation for work performed. Client retains rights only to deliverables fully paid for at termination.",
  },
];

export default function Contract() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
      <Kicker>Contract template · v1</Kicker>
      <H1 className="mt-5 max-w-3xl">The terms <em className="text-[var(--accent-bright)]">that keep us free.</em></H1>
      <p className="mt-5 text-lg text-[var(--ink-dim)] max-w-2xl">
        Boilerplate to lift into a real legal doc. Plain language, no IP traps, no
        retainer hooks. Every clause exists to keep a build from turning into an unpaid
        IT job.
      </p>

      <div className="mt-10">
        <Panel className="p-3">
          <div className="px-5 py-4 text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)] flex justify-between">
            <span>Green Country Web Co. · Master Build Agreement v1</span>
            <span>Not legal advice — review with counsel</span>
          </div>
        </Panel>
      </div>

      <div className="mt-6 space-y-4">
        {clauses.map((c) => (
          <Panel key={c.n} className="p-6">
            <div className="grid sm:grid-cols-[60px_1fr] gap-5 items-start">
              <div className="font-display text-3xl tabular text-[var(--ink-faint)]">{c.n}</div>
              <div>
                <div className="font-display text-xl">{c.title}</div>
                <p className="mt-2 text-sm text-[var(--ink-dim)] leading-relaxed">{c.body}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-5">
        <Panel className="p-6">
          <SectionLabel>Exhibit A</SectionLabel>
          <H2>Scope spec</H2>
          <p className="mt-3 text-sm text-[var(--ink-dim)] leading-relaxed">
            Page list, feature list, integrations, photo count. Attached per-project,
            generated from the Discovery doc.
          </p>
        </Panel>
        <Panel className="p-6">
          <SectionLabel>Exhibit B</SectionLabel>
          <H2>Asset list</H2>
          <p className="mt-3 text-sm text-[var(--ink-dim)] leading-relaxed">
            What the client owes us before the clock starts. Photos, logo, copy notes,
            social links, login transfers.
          </p>
        </Panel>
        <Panel className="p-6">
          <SectionLabel>Exhibit C</SectionLabel>
          <H2>Handoff packet</H2>
          <p className="mt-3 text-sm text-[var(--ink-dim)] leading-relaxed">
            Delivered at launch. Logins (theirs), Looms on editing, walkthrough on adding
            a page, our support email and the 30-day clock.
          </p>
        </Panel>
      </div>

      <div className="mt-12">
        <Panel className="p-6">
          <SectionLabel>Signature block</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-8 text-sm text-[var(--ink-dim)]">
            <div>
              <div className="text-[var(--ink-faint)] uppercase text-xs tracking-[0.14em]">Studio</div>
              <div className="mt-6 border-b border-[var(--line-bright)] pb-1">_________________________</div>
              <div className="mt-2">Madison Hadrava · Green Country Web Co.</div>
              <div className="text-xs text-[var(--ink-faint)] mt-1">Date</div>
            </div>
            <div>
              <div className="text-[var(--ink-faint)] uppercase text-xs tracking-[0.14em]">Client</div>
              <div className="mt-6 border-b border-[var(--line-bright)] pb-1">_________________________</div>
              <div className="mt-2">[Client name] · [Business]</div>
              <div className="text-xs text-[var(--ink-faint)] mt-1">Date</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
