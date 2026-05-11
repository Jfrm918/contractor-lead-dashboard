import { VantageAtmosphere } from '../../_components/shell';
import { BillingClient } from '../_components/AdminBitsClient';
import HubNav from '../_components/HubNav';
import { HubPageHeader, Note, ThesisPill } from '../_components/PageBits';

export const metadata = { title: 'Vantage — Billing' };

export default function BillingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/billing" />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Billing · admin"
            title="Billing events — every charge, every renewal, every cancel."
            blurb="Today logs events from the Customers tab. Friday we wire Stripe webhooks so real charges + failures + renewals flow in automatically."
          />
          <Note>
            <ThesisPill /> Stripe integration is on Friday&apos;s build list. Account setup waits on LLC + bank (Saturday morning).
          </Note>
          <div className="mt-8" />
          <BillingClient />
        </main>
      </div>
    </div>
  );
}
