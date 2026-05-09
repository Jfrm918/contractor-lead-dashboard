import { MouseLight, RoutedTabs } from '../../_components/interactions';
import { PortalPreview, PREVIEW_TABS } from '../../_components/previews';
import { VantageAtmosphere, VantagePreviewNav } from '../../_components/shell';

export default function PortalPreviewPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <VantagePreviewNav />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <header className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Preview · Live portal
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
              Search, filter, and export every permit on demand.
            </h1>
            <p className="mt-4 text-[15px] leading-[1.6] text-zinc-300/85">
              Active filters on the left. Live KPIs and the full match list on the right. Saved
              searches save what you care about; CSV export gets the data into your tools.
            </p>
          </header>

          <div className="mt-10 glass-frosted glass-textured overflow-hidden">
            <span className="glass-grain" />
            <div className="relative z-10">
              <RoutedTabs
                tabs={PREVIEW_TABS.map((t) => ({
                  label: t.label,
                  href: t.href,
                  subtitle: t.subtitle,
                }))}
                active="/vantage/preview/portal"
              />
              <PortalPreview />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
