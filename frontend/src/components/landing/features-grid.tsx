"use client";

/**
 * PactFlow — Features Grid Section Component
 * Section 6: Animated glassmorphism feature cards with subtle hover tilt.
 */
import React from "react";
import { motion } from "framer-motion";
import {
  Milestone,
  RotateCcw,
  Wallet,
  Activity,
  ShieldCheck,
  Globe,
  Lock,
  Zap,
} from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  index: number;
}

function FeatureCard({ title, description, icon, badge, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ scale: 1.02, y: -6 }}
      className="p-7 sm:p-8 rounded-3xl bg-surface-1/80 border border-border-subtle hover:border-brand-500/50 transition-all duration-300 shadow-xl backdrop-blur-xl group flex flex-col justify-between"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-3.5 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
            {icon}
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-2 text-text-tertiary border border-border-default group-hover:text-brand-300 transition-colors">
            {badge}
          </span>
        </div>

        <h3 className="text-xl font-bold text-text-primary group-hover:text-brand-300 transition-colors">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-6 mt-4 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-disabled group-hover:text-text-tertiary transition-colors">
        <span>Soroban v2.1 Protocol</span>
        <span className="text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          Explore Feature →
        </span>
      </div>
    </motion.div>
  );
}

export function FeaturesGrid() {
  const features = [
    {
      title: "Milestone Escrow",
      description:
        "Break complex deliverables into discrete, funded stages. Money is locked upfront on-chain and disbursed automatically upon objective deliverable verification.",
      icon: <Milestone size={22} />,
      badge: "Programmable Trust",
    },
    {
      title: "Automatic Timeout Refunds",
      description:
        "Never worry about abandoned projects. If a milestone deadline expires without deliverable submission, hardware timelocks trigger deterministic client refunds.",
      icon: <RotateCcw size={22} />,
      badge: "Hardware Timelock",
    },
    {
      title: "Non-Custodial Wallet Integration",
      description:
        "Connect Freighter, xBull, or Rabet in one click. You retain 100% control of your private keys; neither PactFlow nor arbitrary middlemen ever hold your reserves.",
      icon: <Wallet size={22} />,
      badge: "Zero Custody",
    },
    {
      title: "Real-time State Tracking",
      description:
        "Monitor live on-chain confirmations, arbiter multisig signatures, and deliverable review timestamps directly through our Constellation dashboard.",
      icon: <Activity size={22} />,
      badge: "60fps Live Sync",
    },
    {
      title: "Transparent & Auditable Payouts",
      description:
        "Every deposit, milestone release, and refund generates an immutable transaction hash verifiable by any party on the Stellar ledger explorer.",
      icon: <ShieldCheck size={22} />,
      badge: "Public Verification",
    },
    {
      title: "Global Cross-Border Freelancing",
      description:
        "Hire top engineering talent anywhere in the world and settle payments in XLM or USDC in 1.2 seconds without SWIFT wire fees or FX markup.",
      icon: <Globe size={22} />,
      badge: "Stellar Consensus",
    },
  ];

  return (
    <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-surface-0 border-t border-border-subtle relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <Zap size={14} />
            <span>Core Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Designed for High-Velocity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-amber-500">
              Web3 Engineering Teams.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Everything you need to collaborate securely across borders, eliminate escrow disputes, and automate milestone accounting without friction.
          </p>
        </div>

        {/* 6-Card Animated Glassmorphism Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <FeatureCard
              key={feature.title}
              index={idx}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              badge={feature.badge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
