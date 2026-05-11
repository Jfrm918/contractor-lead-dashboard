import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { HubPageHeader, Note, ThesisPill } from '../_components/PageBits';
import DecisionsClient from './_DecisionsClient';

export const metadata = {
  title: 'Vantage — Decisions log',
};

export default function DecisionsLogPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/decisions" />
        <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Decisions log · internal"
            title="Every meaningful decision, with the reasoning."
            blurb="Tomorrow-Jason and tomorrow-Madison won't remember why we made a call today. This is where we save the WHY so we can defend, revisit, or reverse with full context."
          />
          <Note>
            <ThesisPill /> Best practice from Amazon (the &quot;memo culture&quot;), Stripe internal docs,
            and Notion&apos;s company-wiki playbook: every non-trivial decision deserves 3 sentences
            of written reasoning. Skipping this step is the #1 reason small companies drift —
            you forget why you chose X and end up undoing it for nothing.
          </Note>
          <div className="mt-8" />
          <DecisionsClient />
        </main>
      </div>
    </div>
  );
}
