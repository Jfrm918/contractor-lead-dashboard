import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { Card, HubPageHeader, Note, Section, ThesisPill } from '../_components/PageBits';

export const metadata = {
  title: 'Vantage — Discovery call playbook',
};

/* ============================================================
   Discovery call playbook
   Frame: 15-min structured call to qualify or kill in <15 min.
   Methodology lineage: SPIN Selling (Rackham), MEDDIC, SaaStr SMB
   playbook. We're not inventing — we're applying.
   ============================================================ */

const QUESTIONS: {
  q: string;
  why: string;
  listen: string;
  killIf: string;
}[] = [
  {
    q: "Walk me through how you currently find new commercial projects in your metro.",
    why: "Establishes status quo + competitive landscape. Tells us what we're replacing.",
    listen:
      "Manual portal grinding · BidClerk / ConstructConnect · word-of-mouth · broker relationships · trade publications.",
    killIf:
      "They already use Dodge or have an internal data team — they're upmarket of our pricing and unlikely to downgrade.",
  },
  {
    q: "Roughly how many new commercial projects do you close in a typical year?",
    why: "Sizes the buyer's deal volume. Validates this is a 'pursuing growth' operator, not a referral-only business.",
    listen:
      "2–15 new closes/year is our sweet spot. Above 15 means they have process/intel already; below 2 means lifestyle business.",
    killIf:
      "Under 2 commercial closes/year with no pipeline aspiration — not a fit, they'll churn.",
  },
  {
    q: "What does an ideal lead look like for you? Project type, size, GC, anything else.",
    why: "Reveals their qualification rigor. Also gives us the filter spec for their account.",
    listen:
      "Specifics: 'commercial industrial >$1M', 'multi-family 50+ units', 'Crossland or Manhattan as GC', etc.",
    killIf:
      "They can't articulate it ('any commercial project'). Means they don't qualify, will be unhappy with anything we send.",
  },
  {
    q: "If we showed you 5 fresh commercial permits this Monday with verified GC contacts, how would you action them?",
    why: "Tests intent. Anyone who's serious has a workflow already imagined.",
    listen:
      "Concrete actions: 'call the PM same day', 'email + send my outside rep', 'feed to BD team for follow-up'.",
    killIf:
      "'I'd think about it' / 'send to my team and see' — no real intent signal, they're tire-kicking.",
  },
  {
    q: "What does missing a commercial project cost you, ballpark?",
    why: "Anchors the value frame. They state the number, not us.",
    listen:
      "A specific dollar figure — could be margin, lost bid, missed quota. The number doesn't matter as much as their willingness to give one.",
    killIf:
      "'Hard to say' / shrug — they don't track ROI on lead intel, won't justify recurring spend internally.",
  },
  {
    q: "What do you spend per month on lead intelligence today?",
    why: "Reveals budget headroom and sophistication level.",
    listen:
      "$0 (greenfield buyer, sells on ROI) · $50–$300 (price-sensitive, fits Starter or Growth) · $500+ (sophisticated, may upgrade to Pro).",
    killIf:
      "$0 plus 'we'd never pay for that' — they're not a buyer at any price.",
  },
  {
    q: "If we got you 10 verified commercial permits this Monday, fitting your filters, what would 1 closed deal off that be worth to you?",
    why: "The trial close. Forces them to articulate value in their own words.",
    listen:
      "Concrete number — even an order-of-magnitude. The act of saying it out loud commits them mentally to the math.",
    killIf:
      "'It depends' or shrug after probing — they don't have margin clarity, can't internally justify the spend.",
  },
];

const KILL_RULES = [
  "Already paying Dodge or BuiltWith — too sophisticated, won't downgrade",
  "Zero commercial closes per year and no growth motion",
  "Can't articulate ideal lead profile after 2 attempts",
  "Can't (or won't) name a dollar figure on a single closed deal",
  "Decision needs >2 people approval — not fit for our SMB pricing model",
  "Asks for a custom contract, NDA, or vendor onboarding before trial — wrong-tier buyer",
];

export default function DiscoveryPlaybookPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/discovery" />
        <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Discovery call playbook · internal"
            title="Seven questions that decide if a prospect closes."
            blurb="Fifteen minutes, structured. Either qualify them into a paid demo or kick them back to their day. Don't waste your time or theirs."
          />

          <Section title="Pre-call checklist (5 min)" eyebrow="Setup">
            <Note>
              <ThesisPill /> The framework below applies standard B2B discovery practice (SPIN
              Selling, MEDDIC, SaaStr SMB sales) to our specific buyers. The seven questions and
              kill rules are our adaptation, not a published source.
            </Note>
            <ul className="mt-4 space-y-2 text-[14px] leading-[1.55] text-zinc-300/85">
              {[
                'Confirm the calendar invite has the prospect\'s mobile number — drop a 5-min reminder text 10 min before.',
                'Pull the prospect\'s company\'s recent permits from our DB and have them on screen. Specifics earn credibility.',
                'Have the pricing one-pager ready in a tab (do not lead with price; close with it).',
                'Set a 15-minute timer. Hard stop. Long calls feel desperate.',
                'Open Notion (or a notepad) in a separate window — log answers in real time, not from memory.',
              ].map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                  {i}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="The opener (90 seconds)" eyebrow="Frame the call">
            <Card>
              <p className="text-[14.5px] italic leading-[1.65] text-zinc-200/95">
                "Hey [name], thanks for grabbing 15 minutes. Quick context: we send weekly
                commercial permit intelligence to [their segment] in [their metro]. I want to
                learn how you currently find new projects, see if what we do is actually useful,
                and if not — kick you back to your day. Cool with that?"
              </p>
            </Card>
            <ul className="mt-5 space-y-1.5 text-[13px] text-zinc-400">
              <li>· Names what you do in one sentence (no jargon, no buzzwords).</li>
              <li>· Permission-based ("cool with that?") — small commitment increases follow-through.</li>
              <li>· Frame ends with "kick you back to your day" — signals you're not desperate, won't waste their time.</li>
            </ul>
          </Section>

          <Section title="The seven questions" eyebrow="Qualify or kill">
            <div className="space-y-4">
              {QUESTIONS.map((q, i) => (
                <Card key={q.q}>
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-mono text-[12px] font-semibold tabular-nums text-amber-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <p className="text-[15.5px] font-medium leading-[1.45] text-white">"{q.q}"</p>
                      <div className="mt-4 grid gap-4 border-t border-white/[0.05] pt-4 sm:grid-cols-3">
                        <Field label="Why ask" value={q.why} />
                        <Field label="Listen for" value={q.listen} />
                        <Field label="Kill if" value={q.killIf} accent="red" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="The trial close (after Q7)" eyebrow="Recap + ask">
            <Card>
              <p className="text-[14.5px] italic leading-[1.65] text-zinc-200/95">
                "Quick recap — sounds like you'd value{' '}
                <strong className="not-italic text-amber-300">[specific thing they said]</strong>,
                you close{' '}
                <strong className="not-italic text-amber-300">[X deals/year]</strong>, and one
                closed deal is worth roughly{' '}
                <strong className="not-italic text-amber-300">[Y]</strong>. We're $149 / $299 /
                $499 a month depending on metros and access. If we got you ten fresh permits next
                Monday matching your filters, would you be in for a 14-day trial?"
              </p>
            </Card>
            <p className="mt-4 text-[13px] leading-[1.6] text-zinc-400">
              The recap forces them to confirm or correct. Once they confirm, the price feels
              tiny against the deal value they just stated. Listen for "yes / let me think /
              no" — that's your answer. Don't talk past it.
            </p>
          </Section>

          <Section title="Kill rules — disqualify in <15 min if any" eyebrow="When to walk">
            <Card>
              <ul className="space-y-2 text-[14px] leading-[1.5] text-zinc-200/90">
                {KILL_RULES.map((r) => (
                  <li key={r} className="flex items-start gap-2.5">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
            <p className="mt-4 text-[13px] leading-[1.6] text-zinc-400">
              Killing fast is a kindness — to them, to you, to the customers who deserve your
              attention. A bad-fit customer churns in 60 days, costs ~$400 in support, and burns
              the time you could've spent on the next 5 prospects.
            </p>
          </Section>

          <Section title="Next-step scripts" eyebrow="Close out">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                  Yes
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-zinc-200/90 italic">
                  "Great — calendar invite for a 30-min walkthrough next [day]. Bring your laptop.
                  I'll pull permits matching your filters in advance so we review them live."
                </p>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                  Maybe
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-zinc-200/90 italic">
                  "What would make this an easy yes for you?" — wait for their answer, address it,
                  then ask: "If I solved that, would you trial it next Monday?"
                </p>
              </Card>
              <Card>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  No
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-zinc-200/90 italic">
                  "Appreciate the time. If your situation changes, you have my contact." Don't
                  push. Don't follow up unsolicited. Add to a 90-day re-engagement list.
                </p>
              </Card>
            </div>
          </Section>

          <Section title="Post-call (10 min)" eyebrow="Lock it in">
            <ul className="space-y-2 text-[14px] leading-[1.55] text-zinc-300/85">
              {[
                'Update the prospect record in /vantage/hub: stage, last touch, next action.',
                'Send a 4-line follow-up email within 30 minutes — recap their answers, confirm next step.',
                'Calendar the next step before you close the call (don\'t leave it to "I\'ll send something later").',
                'Log any quote-worthy phrasing the prospect used — verbatim — into the email library for future cold outreach.',
              ].map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                  {i}
                </li>
              ))}
            </ul>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'red';
}) {
  return (
    <div>
      <div
        className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] ${
          accent === 'red' ? 'text-red-300/80' : 'text-zinc-500'
        }`}
      >
        {label}
      </div>
      <p className="mt-1 text-[13px] leading-[1.55] text-zinc-300/90">{value}</p>
    </div>
  );
}
