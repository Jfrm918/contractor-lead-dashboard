import { Panel, SectionLabel, H1, H2, Kicker } from "@/components/Panel";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Storefront",
    price: "$1,500",
    sub: "One-time · 50% deposit",
    blurb: "One-page site. Phone, services, hours, gallery, contact form. The kind of site a roofer or restaurant actually needs.",
    features: [
      "Custom 1-page design",
      "Mobile + desktop responsive",
      "Contact form → their email",
      "Google Maps embed",
      "Up to 12 photos",
      "Basic SEO (titles, meta, schema)",
      "2 rounds of revisions",
      "30-day post-launch support",
    ],
    accent: false,
  },
  {
    name: "Main Street",
    price: "$2,000",
    sub: "One-time · 50% deposit",
    blurb: "Multi-page site. Services pages, testimonials, blog-ready, gallery. For shops with more to say than one page holds.",
    features: [
      "5-page custom design",
      "Mobile + desktop responsive",
      "Contact form → their email",
      "Embedded Google reviews",
      "Up to 30 photos",
      "Blog scaffolding (CMS-ready)",
      "Full SEO setup",
      "2 rounds of revisions",
      "30-day post-launch support",
    ],
    accent: true,
  },
  {
    name: "Main Street+",
    price: "$3,500",
    sub: "One-time · 50% deposit",
    blurb: "Bigger build. Booking widget, Stripe payments, multi-location, custom integrations. Quote only after discovery.",
    features: [
      "8-12 page custom design",
      "Booking / scheduling widget",
      "Stripe payment integration",
      "Multi-location pages",
      "Email automation hookup",
      "Conversion tracking + GA4",
      "3 rounds of revisions",
      "30-day post-launch support",
    ],
    accent: false,
  },
];

const addons = [
  { name: "Logo refresh", price: "$350", note: "Vector cleanup, modern variants" },
  { name: "Photography day", price: "$500", note: "Local photographer hired, client keeps the files" },
  { name: "Copywriting", price: "$300", note: "Full site copy from a 30-min interview" },
  { name: "Domain + email setup", price: "$150", note: "Cloudflare + Google Workspace, on their accounts" },
  { name: "Rush delivery", price: "+25%", note: "5 business days from signed contract" },
];

const carePlanFeatures = [
  "Hosting on the studio&apos;s Webflow account (or stays on theirs — their call)",
  "Google Business Profile management (posts, photos, Q&A monitoring)",
  "One round of small edits per month (copy tweaks, photo swaps, hours updates)",
  "Uptime monitoring + monthly health email",
  "Priority response — same business day vs. best-effort same week",
  "Cancel anytime, no penalty",
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
      <Kicker>Pricing</Kicker>
      <H1 className="mt-5 max-w-3xl">Three tiers. One-time. <em className="text-[var(--accent-bright)]">No retainer trap.</em></H1>
      <p className="mt-5 text-lg text-[var(--ink-dim)] max-w-2xl">
        Default is a one-time build, fully owned by the client. The Care Plan stacks on top
        for clients who want hands-off after launch — opt-in, never required.
      </p>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {tiers.map((t) => (
          <Panel key={t.name} className={`p-7 flex flex-col ${t.accent ? "ring-1 ring-[var(--accent)]/40" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="font-display text-2xl">{t.name}</div>
              {t.accent && <span className="chip">Most common</span>}
            </div>
            <div className="mt-5 font-display text-5xl tabular">{t.price}</div>
            <div className="text-xs text-[var(--ink-faint)] mt-1">{t.sub}</div>
            <p className="mt-5 text-sm text-[var(--ink-dim)] leading-relaxed">{t.blurb}</p>
            <ul className="mt-6 space-y-2.5 text-sm flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check size={14} className="mt-1 text-[var(--accent)] shrink-0" />
                  <span className="text-[var(--ink-dim)]">{f}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <div className="mt-16">
        <SectionLabel>Care Plan — optional add-on to any build</SectionLabel>
        <Panel className="p-7 ring-1 ring-[var(--accent-bright)]/30">
          <div className="grid md:grid-cols-[1fr_280px] gap-7 items-start">
            <div>
              <H2>$150/mo. Hands-off after launch.</H2>
              <p className="mt-4 text-[var(--ink-dim)] leading-relaxed max-w-prose">
                A site is an asset, but it&apos;s an asset that drifts — phone numbers change, photos go stale,
                Google Business needs posts, hosting bills come due. Care Plan handles the drift so the
                client never has to think about it. Pitched at handoff, opt-in. Target attach rate: 50%.
              </p>
              <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {carePlanFeatures.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check size={14} className="mt-1 text-[var(--accent-bright)] shrink-0" />
                    <span className="text-[var(--ink-dim)]" dangerouslySetInnerHTML={{ __html: f }} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-l border-[var(--line)] pl-7">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">Price</div>
              <div className="mt-1 font-display text-5xl tabular text-[var(--accent-bright)]">$150</div>
              <div className="text-xs text-[var(--ink-faint)] mt-0.5">per month</div>
              <div className="mt-6 text-xs text-[var(--ink-faint)] leading-relaxed">
                Billed monthly. Cancel anytime. Replaces hourly support after day 30 if attached at handoff.
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-16">
        <SectionLabel>Payment terms</SectionLabel>
        <Panel className="p-7">
          <H2>50 / 50, gated on the domain.</H2>
          <div className="mt-5 grid sm:grid-cols-3 gap-5 text-sm">
            <Item title="Signed contract" body="50% deposit. Build starts." />
            <Item title="Approval round" body="Show, edit, approve. No extra charge inside scope." />
            <Item title="Domain pointing" body="Final 50% clears before the domain points to live site. Leverage to get paid." />
          </div>
        </Panel>
      </div>

      <div className="mt-16">
        <SectionLabel>Add-ons</SectionLabel>
        <Panel className="p-2">
          <div className="divide-y divide-[var(--line)]">
            {addons.map((a) => (
              <div key={a.name} className="px-5 py-4 flex items-center justify-between gap-6">
                <div>
                  <div className="text-[var(--ink)]">{a.name}</div>
                  <div className="text-xs text-[var(--ink-faint)] mt-0.5">{a.note}</div>
                </div>
                <div className="font-display tabular text-xl text-[var(--accent-bright)]">{a.price}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Item({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">{title}</div>
      <div className="mt-1.5 text-[var(--ink-dim)] leading-relaxed">{body}</div>
    </div>
  );
}
