/**
 * PactFlow — Master Storytelling Landing Page (`/`)
 * Theme: Constellation of Trust
 * Visual Metaphor: Stars connected by glowing threads where money movement is visualized through animated state transitions.
 */
import React from "react";
import type { Metadata } from "next";
import {
  Navbar,
  Hero,
  ProblemSection,
  RevealSection,
  HowItWorks,
  StellarPowered,
  FeaturesGrid,
  SecuritySection,
  ArchitectureDiagram,
  TestimonialsSection,
  MetricsSection,
  FAQAccordion,
  CTASection,
  Footer,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "PactFlow — The Future of Secure Freelance Payments on Soroban",
  description:
    "Programmable Web3 escrow with Level 4 hardware timelocks and zero third-party custody powered by Soroban smart contracts on the Stellar consensus network.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-text-primary flex flex-col font-sans antialiased selection:bg-brand-500/30 selection:text-brand-300 relative overflow-x-hidden">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* SECTION 1: Hero */}
      <Hero />

      {/* SECTION 2: The Problem */}
      <ProblemSection />

      {/* SECTION 3: PactFlow Reveal */}
      <RevealSection />

      {/* SECTION 4: How PactFlow Works */}
      <HowItWorks />

      {/* SECTION 5: Powered by Stellar */}
      <StellarPowered />

      {/* SECTION 6: Features Grid */}
      <FeaturesGrid />

      {/* SECTION 7: Security (Constellation Shield) */}
      <SecuritySection />

      {/* SECTION 8: Developer Friendly (Architecture Diagram) */}
      <ArchitectureDiagram />

      {/* SECTION 9: Testimonials */}
      <TestimonialsSection />

      {/* SECTION 10: Metrics & Social Proof */}
      <MetricsSection />

      {/* SECTION 11: FAQ Accordion */}
      <FAQAccordion />

      {/* SECTION 12: Final CTA Convergence */}
      <CTASection />

      {/* Landing Footer */}
      <Footer />
    </div>
  );
}
