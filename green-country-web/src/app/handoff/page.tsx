import { Panel, SectionLabel, H1, H2, Kicker } from "@/components/Panel";
import { Video, Key, BookOpen, Mail } from "lucide-react";

const items = [
  {
    icon: Key,
    title: "Login inventory",
    body: "One table, alphabetized. Every account they own that touches the site. Domain registrar, Webflow, Google Workspace, Stripe (if applicable), analytics. Username / email / where the password lives (their password manager, not ours). Studio listed nowhere.",
  },
  {
    icon: Video,
    title: "Loom · How to edit your site",
    body: "5 minutes. Walks them through opening the Webflow editor, double-clicking text to change it, swapping a photo, publishing. Filmed on their actual site, not a generic demo. URL pinned at the top of the packet.",
  },
  {
    icon: Video,
    title: "Loom · How to add a new page",
    body: "5 minutes. Duplicate an existing page, change the URL slug, retitle in the editor, add it to the nav. Covers 80% of the &apos;can you add a page about X&apos; requests they&apos;ll ever have.",
  },
  {
    icon: BookOpen,
    title: "Quick reference card",
    body: "One PDF page. Their domain, their Webflow plan, their billing date, the support email, the 30-day support clock. Print-and-tape-to-the-wall format. Nothing fancy.",
  },
  {
    icon: Mail,
    title: "Support email + clock",
    body: "hello@greencountryweb.co (or whatever the studio sets). 30-day clock from launch. After day 30: Care Plan ($150/mo) or hourly at $75/hr — client picks. The studio does NOT promise response times inside the 30 days — best-effort same week, same-business-day on Care Plan.",
  },
];

const exitChecklist = [
  "Final payment received and reconciled",
  "Site live on client's domain, SSL verified",
  "Sitemap submitted to Google Search Console (on their account)",
  "Google Business Profile updated with new URL (if applicable)",
  "All 3 Looms recorded and linked in handoff PDF",
  "Login inventory cross-checked — Studio not listed anywhere as billing owner",
  "Webflow workspace: Studio removed as a member OR scheduled for day-30 removal",
  "Stripe / billing: no recurring charge from Studio",
  "Project archived in pipeline. Client moved to &lsquo;Shipped&rsquo; column.",
  "Testimonial request sent (by Madison, day 7 post-launch)",
];

export default function Handoff() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
      <Kicker>Handoff packet · Exhibit C</Kicker>
      <H1 className="mt-5 max-w-3xl">The packet that makes us <em className="text-[var(--accent-bright)]">replaceable</em> on purpose.</H1>
      <p className="mt-5 text-lg text-[var(--ink-dim)] max-w-2xl">
        Delivered as one Notion page (or PDF). Five items. Every Green Country client gets the
        same five. The reason it&apos;s the same every time is that consistency is the only way
        we walk away without a 6-month tail of &quot;hey can you just...&quot; emails.
      </p>

      <div className="mt-12 space-y-4">
        {items.map((it) => (
          <Panel key={it.title} className="p-7">
            <div className="grid sm:grid-cols-[48px_1fr] gap-5 items-start">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center glass-crisp text-[var(--accent)]">
                <it.icon size={18} />
              </div>
              <div>
                <H2>{it.title}</H2>
                <p className="mt-3 text-[var(--ink-dim)] leading-relaxed">{it.body}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-16">
        <SectionLabel>Exit checklist — studio runs before archiving</SectionLabel>
        <Panel className="p-7">
          <ol className="space-y-3 text-sm text-[var(--ink-dim)]">
            {exitChecklist.map((c, i) => (
              <li key={c} className="flex gap-3">
                <span className="tabular text-[var(--ink-faint)] w-6">{(i + 1).toString().padStart(2, "0")}</span>
                <span className="leading-relaxed">{c}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-5">
        <Panel className="p-7">
          <SectionLabel>The post-handoff conversation</SectionLabel>
          <H2>Day 30 email — Madison sends.</H2>
          <p className="mt-4 text-sm text-[var(--ink-dim)] leading-relaxed italic">
            &quot;Hey [name] — quick note. Today wraps the 30-day support window on your site.
            Everything&apos;s yours, all the logins are in your name. If something breaks down
            the road, our support rate is $75/hr — usually means one email and 30 minutes to
            fix. Otherwise the Looms in your handoff packet cover the editing you&apos;ll want
            day-to-day. Genuinely appreciate you. — Madison&quot;
          </p>
        </Panel>
        <Panel className="p-7">
          <SectionLabel>Why we keep the email short</SectionLabel>
          <ul className="space-y-3 text-sm text-[var(--ink-dim)]">
            <li>• Long email = re-opens the relationship. Short email = closes it cleanly.</li>
            <li>• Care Plan was already pitched at handoff — don&apos;t re-pitch on day 30.</li>
            <li>• Don&apos;t apologize for charging hourly after day 30. That&apos;s the deal.</li>
            <li>• Do leave the door open with one warm sentence. They send referrals.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
