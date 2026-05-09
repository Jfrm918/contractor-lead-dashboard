import { VantageAtmosphere } from '../../_components/shell';
import { RevenueClient } from '../_components/AdminBitsClient';
import HubNav from '../_components/HubNav';
import { HubPageHeader, Note, ThesisPill } from '../_components/PageBits';

export const metadata = { title: 'Vantage — Revenue' };

export default function RevenuePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/revenue" />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Revenue · admin"
            title="MRR, ARR, tier mix, plan trajectory."
            blurb="Live counters wired to the Customers tab. Updates the moment you add or change a customer there."
          />
          <Note>
            <ThesisPill /> Plan targets (May $500 → Jan $10K) are from /vantage/hub/plan. As real customers land, the bars track actual vs. plan.
          </Note>
          <div className="mt-8" />
          <RevenueClient />
        </main>
      </div>
    </div>
  );
}
