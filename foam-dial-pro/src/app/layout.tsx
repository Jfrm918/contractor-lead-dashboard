import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "FoamDial Pro - Spray Foam Intelligence Platform",
  description:
    "Professional-grade spray foam job logging, analytics, and dial-in calculator for insulation companies.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* Atmospheric background layers */}
        <div className="fd-bg-base" />
        <div className="fd-bg-grain" />
        <div className="fd-bg-mesh" />
        <div className="fd-bg-vignette" />
        <div className="fd-bg-glow" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
