import { VantageAtmosphere } from '../_components/shell';
import HubClient from './_components/HubClient';
import HubNav from './_components/HubNav';

export const metadata = {
  title: 'Vantage — Operator Hub',
  description: 'Internal command surface for Madison + Jason.',
};

export default function VantageHub() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <HubNav active="/vantage/hub" />
        <main className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
          <header className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
              Today
            </p>
            <h1 className="mt-2 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
              Tonight&apos;s board.
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-[1.6] text-zinc-300/85">
              One screen for what we&apos;re building, who we&apos;re chasing, and where we are on the
              90-day plan.
            </p>
          </header>
          <HubClient />
        </main>
      </div>
    </div>
  );
}

