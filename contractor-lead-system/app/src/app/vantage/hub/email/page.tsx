import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — Cold email library',
};

/* ============================================================
   Cold email library
   Templates per buyer segment + subject lines + 3-touch
   follow-up sequence. Every template annotated with WHY.
   ============================================================ */

type Template = {
  segment: string;
  subject: string;
  body: string;
  whyItWorks: string[];
};

const TEMPLATES: Template[] = [
  {
    segment: 'Material rep (insulation / roofing / mechanical)',
    subject: 'quick question on the mingo warehouse',
    body: `Hey [first name],

Saw [GC name] just pulled the permit on the 24,800 sf warehouse off N Mingo Rd. If you're spec'ing the insulation package on that, I figured I'd reach out.

We track every commercial permit in Tulsa weekly — GC, project value, contact info, all verified. If it'd save you the time of grinding through the city portal, happy to send Monday's list.

— Madison`,
    whyItWorks: [
      'Subject line is lowercase + specific — looks like a peer ping, not a sales blast.',
      'Opens with a real, named project (proves we have data, not generic).',
      'Names the GC by name — signals industry literacy.',
      'Offers value before asking for anything (Monday\'s list is free).',
      'No "synergy / leverage / streamline" language — talks like a person.',
    ],
  },
  {
    segment: 'Insulation / HVAC / roofing subcontractor',
    subject: '12 commercial permits this week in tulsa',
    body: `Hey [first name],

12 new commercial permits were filed in Tulsa metro this past week — total project value around $38M. A few that stood out for [their specialty]:

- 24,800 sf warehouse on N Mingo (Crossland)
- 128-unit multi-family on E 71st (Manhattan)
- Self-storage on S Memorial (BL Harbert)

If you want the full list with verified GC project manager contacts, that's what we do. $149/mo, 1 metro, weekly digest. 14-day free trial — happy to send Monday's email and you tell me if it's useful.

Worth 10 minutes?

— Madison`,
    whyItWorks: [
      'Leads with the number — credibility through specificity.',
      'Three real example projects names a GC each time — "we know your world."',
      'Names the price up front. Saves a follow-up email and filters tire-kickers.',
      'Asks for 10 minutes, not a meeting. Lower commitment ask.',
    ],
  },
  {
    segment: 'CRE broker',
    subject: 'tracking the 71st st multi-family',
    body: `Hey [first name],

The 128-unit multi-family at 8420 E 71st filed last Friday — Manhattan as GC, $18–22M range. If your firm represents owners or tenants in that submarket, you probably already saw it. But if you're tracking similar projects across Tulsa, we send a verified weekly list every Monday.

Most brokers we talk to use it for owner-rep prospecting (knowing who broke ground 6 weeks ago = a perfect lease-up call window).

Mind if I send next Monday's list? You can decide if it's useful.

— Madison`,
    whyItWorks: [
      "Names a real project they may already track — establishes peer credibility.",
      "Tells them how other brokers use the data (social proof in numbers).",
      "Soft ask: 'mind if I send' is lighter than 'book a call.'",
      "Frames Monday's list as evaluation material, not a sales pitch.",
    ],
  },
  {
    segment: 'Construction lender / insurer',
    subject: 'commercial permit alerts for tulsa metro',
    body: `Hey [first name],

If your team monitors active construction risk or new project origination in Tulsa metro, we run a verified weekly feed of every commercial permit filed — GC, project value, type, contact info.

Most lenders we work with use it to:
- Flag projects backed by their own loans (early default signal if construction slows)
- Source new origination conversations 4–6 weeks before any draw request lands

$149–$499/mo depending on metros and integration. 14-day trial, no card.

Worth a 15-min look?

— Madison`,
    whyItWorks: [
      "Names a use case the buyer cares about (risk monitoring + origination).",
      "Shows we understand their workflow — not just 'we have leads.'",
      "Ends with a low-friction ask (15 min, not 'demo').",
    ],
  },
  {
    segment: 'GC tracking other GCs',
    subject: 'who else broke ground in tulsa this week',
    body: `Hey [first name],

If you're tracking what other GCs are pulling permits on in Tulsa metro — for competitive intel, sub-recruiting, or pricing benchmarks — we send a weekly verified list every Monday.

This week: 47 permits, $38M total value, all four major GCs active. Top three:

- Crossland: 24,800 sf warehouse, $2.4M
- Manhattan: 128-unit multi-family, $18M
- BL Harbert: 3-bldg self-storage, $4.1M

Want next Monday's list?

— Madison`,
    whyItWorks: [
      "GCs care about competitor activity. This frames us as competitive intel, not lead gen.",
      "Listing competitor GCs and project values is the killer hook — they want it the second they see it.",
      "No price in this version because larger GCs read price too early as 'cheap product.' Surface in reply.",
    ],
  },
];

const SUBJECT_LINE_RULES: { rule: string; example: string }[] = [
  {
    rule: 'Lowercase + specific',
    example: 'quick question on the mingo warehouse',
  },
  {
    rule: 'Lead with a number when relevant',
    example: '12 commercial permits this week in tulsa',
  },
  {
    rule: 'Reference a real project or GC name',
    example: 'tracking the 71st st multi-family',
  },
  {
    rule: 'Avoid: spam triggers (FREE, !!, ALL CAPS, money, urgency)',
    example: '— don\'t use these',
  },
  {
    rule: 'Avoid: corporate speak (synergy, leverage, streamline, opportunity)',
    example: '— sounds like a sales bot',
  },
];

const FOLLOW_UP_3 = [
  {
    day: 'Day 0',
    label: 'Initial cold',
    body: '(See templates above.)',
  },
  {
    day: 'Day 3',
    label: 'Soft bump',
    body: `Hey [first name] — bumping this up. If timing's bad, no pressure. If you'd like next Monday's list to evaluate, just hit reply with "send it."`,
  },
  {
    day: 'Day 8',
    label: 'Concrete value',
    body: `Hey [first name] — last note. Here are the top 3 commercial permits filed in Tulsa this week (took me 2 minutes to pull, would've taken you 90):

- 24,800 sf warehouse · Crossland · $2.4M · PM: Mike Petrowski (mpetrowski@crossland.com)
- 128-unit multi-family · Manhattan · $18M · PM: Sarah Chen (schen@manhattanco.com)
- Self-storage · BL Harbert · $4.1M · PM: Dan Whitcomb (dwhitcomb@blharbert.com)

If this is useful, we send a full list every Monday. If not, no worries — won't email again.`,
  },
];

export default function ColdEmailLibraryPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/email" />
        <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Cold email library · internal"
            title="Templates by segment, with the why."
            blurb="Five templates Madison can copy directly. Subject-line rules and a three-touch follow-up sequence. Don't change the structure without thinking through what you're breaking."
          />

          <Section title="Operating principles" eyebrow="Before you write">
            <Note>
              <ThesisPill /> The principles below are what works for us specifically — small B2B,
              single-sender, real human voice. They borrow from established cold-email playbooks
              (Steli Efti / Close, Outbound Sales by Jeb Blount, Mailshake's docs) but the
              specific phrasing is calibrated for our buyers.
            </Note>
            <ul className="mt-5 space-y-2 text-[14px] leading-[1.6] text-zinc-300/90">
              {[
                'One sender, one name. Madison sends from madison@vantageco.io. Verified data: female senders see ~30% higher reply rates in B2B (Mailshake / Lemlist published benchmarks).',
                'Plain text only. No images, no logos, no HTML signatures. They look like a peer ping, not a marketing blast.',
                'Reference one real, specific thing in every email. Project name, GC name, address — proof we have data and aren\'t mass-blasting.',
                'Make the ask small. "Mind if I send Monday\'s list" beats "book a 30-min demo" every time.',
                'Cap the sequence at 3 touches. After day 8, stop. Re-engage in 90 days if priority shifts.',
                'Never use: synergy, leverage, streamline, revolutionary, game-changing, AI-powered. All read as bot.',
                'Always send Tuesday/Wednesday/Thursday between 9–11am local. Industry data shows these are highest open rates for B2B (HubSpot / Outreach reports).',
              ].map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                  {i}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Subject lines" eyebrow="The 30% of the work">
            <Note>
              Most B2B cold emails get judged in the inbox preview. The subject line decides
              whether the body even gets read. <ThesisPill /> Our convention is opinionated.
            </Note>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {SUBJECT_LINE_RULES.map((r) => (
                <Card key={r.rule}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                    {r.rule}
                  </div>
                  <div className="mt-2 font-mono text-[13px] text-zinc-200">{r.example}</div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Templates by segment" eyebrow="Copy and customize">
            <div className="space-y-5">
              {TEMPLATES.map((t) => (
                <Card key={t.segment} className="overflow-hidden">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300/90">
                    {t.segment}
                  </div>
                  <div className="mt-3 grid gap-5 lg:grid-cols-[1.6fr,1fr]">
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                        Subject
                      </div>
                      <div className="mt-1 font-mono text-[13px] text-zinc-100">{t.subject}</div>

                      <div className="mt-4 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                        Body
                      </div>
                      <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-white/[0.05] bg-black/20 px-4 py-3 font-sans text-[13.5px] leading-[1.55] text-zinc-100">
                        {t.body}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                        Why it works
                      </div>
                      <ul className="mt-2 space-y-1.5 text-[12.5px] leading-[1.55] text-zinc-300/85">
                        {t.whyItWorks.map((w) => (
                          <li key={w} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Three-touch follow-up sequence" eyebrow="Persistence (capped)">
            <Note>
              <ThesisPill /> Three touches at days 0, 3, 8. Mailshake / Outreach benchmarks
              suggest 80%+ of replies come within those windows; further follow-ups hurt reply
              rate and damage sender reputation.
            </Note>
            <div className="mt-5 space-y-4">
              {FOLLOW_UP_3.map((f) => (
                <Card key={f.day}>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[12px] tabular-nums text-amber-300">
                      {f.day}
                    </span>
                    <span className="text-[14px] font-semibold text-white">{f.label}</span>
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/[0.05] bg-black/20 px-4 py-3 font-sans text-[13.5px] leading-[1.55] text-zinc-100">
                    {f.body}
                  </pre>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Reply-rate targets" eyebrow="What good looks like">
            <Note>
              <ThesisPill /> Targets below are projections based on standard B2B cold email
              benchmarks (Lemlist, Mailshake, Apollo published 2024–2025 data). Real numbers
              replace these as we measure.
            </Note>
            <div className="mt-5 grid gap-3 lg:grid-cols-4">
              {[
                ['25–35%', 'Open rate', 'Below 20% = subject line problem'],
                ['5–9%', 'Reply rate', 'Below 3% = body or list problem'],
                ['1–3%', 'Positive reply rate', 'Below 1% = wrong segment'],
                ['10–15%', 'Demo-to-trial conversion', 'Below 5% = poor qualification on call'],
              ].map(([v, l, n]) => (
                <Card key={l}>
                  <div className="text-2xl font-semibold tabular-nums text-amber-300">{v}</div>
                  <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-white">
                    {l}
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.5] text-zinc-400">{n}</p>
                </Card>
              ))}
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
