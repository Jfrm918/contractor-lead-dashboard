import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Green Country Web Co. — Internal Hub",
  description: "Internal operating hub. Pricing, process, roles, pipeline.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="mt-24 border-t border-[var(--line)] py-10">
          <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-xs text-[var(--ink-faint)]">
            <span>Green Country Web Co. — internal hub, not customer-facing</span>
            <span className="tabular">v0.1 · {new Date().getFullYear()}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
