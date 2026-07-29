/**
 * PactFlow — Root Application Layout
 * Configures fonts, providers, and html/body structure.
 */
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { AuthGuard } from "@/components/auth-guard";
import "@/app/globals.css";

// ── Font Configuration ──
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// ── Metadata ──
export const metadata: Metadata = {
  title: {
    default: "PactFlow — Building Trust in Global Freelancing",
    template: "%s | PactFlow",
  },
  description:
    "The world's most trusted freelance collaboration platform powered by Stellar. Milestone-based escrow contracts that guarantee payment for freelancers and quality for companies.",
  keywords: [
    "freelance platform",
    "Stellar blockchain",
    "escrow payments",
    "milestone tracking",
    "Soroban smart contracts",
    "global freelancing",
  ],
  authors: [{ name: "PactFlow Team" }],
  creator: "PactFlow",
  metadataBase: new URL("https://app.pactflow.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.pactflow.io",
    title: "PactFlow — Building Trust in Global Freelancing",
    description:
      "Milestone-based escrow contracts powered by Stellar. Build trust between companies and freelancers worldwide.",
    siteName: "PactFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "PactFlow",
    description: "Building Trust in Global Freelancing.",
    creator: "@pactflow_io",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/pactflow-icon.svg",
    shortcut: "/pactflow-icon.svg",
    apple: "/pactflow-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1729",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// ── Root Layout ──
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={inter.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
