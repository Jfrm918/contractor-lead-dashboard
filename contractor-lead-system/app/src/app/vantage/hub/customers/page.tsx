import { VantageAtmosphere } from '../../_components/shell';
import { CustomersClient } from '../_components/AdminBitsClient';
import HubNav from '../_components/HubNav';
import { HubPageHeader, Note, ThesisPill } from '../_components/PageBits';

export const metadata = { title: 'Vantage — Customers' };

export default function CustomersPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub/customers" />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <HubPageHeader
            eyebrow="Customers · admin"
            title="Paying customers — the only chart that matters."
            blurb="One row per paying customer. Tier, MRR contribution, status, last digest, last login. Add stepdad here Saturday the moment he says yes."
          />
          <Note>
            <ThesisPill /> Storage is browser localStorage tonight, ready to swap to Postgres + Stripe webhooks the moment customer #1 lands. Adding a customer here also creates a billing event in the Billing tab.
          </Note>
          <div className="mt-8" />
          <CustomersClient />
        </main>
      </div>
    </div>
  );
}
