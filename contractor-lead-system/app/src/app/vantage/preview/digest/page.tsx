import { RoutedTabs } from '../../_components/interactions';
import { DigestPreview, PREVIEW_TABS } from '../../_components/previews';
import { VantageAtmosphere, VantagePreviewNav } from '../../_components/shell';

export default function DigestPreviewPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#060910] text-zinc-100 antialiased [font-feature-settings:'ss01','cv11']">
      <VantageAtmosphere />
      <div className="relative z-10">
        <VantagePreviewNav />
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <header className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Preview · Monday digest
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
              The email that lands every Monday at 6:00am.
            </h1>
            <p className="mt-4 text-[15px] leading-[1.6] text-zinc-300/85">
              Top three highlights, full sortable table of every new permit. One read, one cup of
              coffee, you know what&apos;s on the board this week.
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
                active="/vantage/preview/digest"
              />
              <DigestPreview />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
