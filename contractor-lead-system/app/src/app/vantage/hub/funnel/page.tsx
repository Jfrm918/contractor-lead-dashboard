import { VantageAtmosphere } from '../../_components/shell';
import HubNav from '../_components/HubNav';
import { HubPageHeader, Note, ThesisPill } from '../_components/PageBits';
import FunnelClient from './_FunnelClient';

export const metadata = {
  title: 'Vantage — Funnel & metrics',
};

export default function FunnelPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/funnel" />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Funnel & metrics · internal"
            title="Where prospects are stuck, where revenue is leaking."
            blurb="Live counts from your prospect pipeline, conversion rates per stage, and the pace targets we need to hit for $1,500 MRR by day 90."
          />
          <Note>
            <ThesisPill /> Conversion targets below are projections from published B2B SMB
            cold-outbound benchmarks (Lemlist, Mailshake, Apollo, SaaStr 2024–2025 reports). As
            we accumulate real numbers, these targets get replaced with measured baselines.
          </Note>
          <div className="mt-8" />
          <FunnelClient />
        </main>
      </div>
    </div>
  );
}
