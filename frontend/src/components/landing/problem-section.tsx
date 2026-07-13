"use client";

/**
 * PactFlow — Problem Section Component
 * Section 2: Interactive comparison showing common freelance problems & broken connections.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, XCircle, DollarSign, UserX, FileWarning } from "lucide-react";
import { TrustNode } from "@/components/pactflow/trust-node";
import { TrustThread } from "@/components/pactflow/trust-thread";

export function ProblemSection() {
  const [activeScenario, setActiveScenario] = useState<number>(0);

  const scenarios = [
    {
      id: "ghosted",
      title: "Ghosted After Upfront Payment",
      subtitle: "Client sends 50% upfront via traditional wire/crypto — freelancer vanishes without delivering any code.",
      clientStatus: "ACTIVE" as const,
      clientBadge: "Loss of $5,000 USD",
      freelancerStatus: "LOCKED" as const,
      freelancerBadge: "Vanished / Unresponsive",
      threadState: "BROKEN" as const,
      icon: <UserX className="text-status-error" size={24} />,
      riskLevel: "CRITICAL FINANCIAL RISK",
    },
    {
      id: "unpaid",
      title: "Work Delivered But Unpaid",
      subtitle: "Freelancer completes 3 months of frontend development — client delays payment indefinitely or disputes quality without proof.",
      clientStatus: "LOCKED" as const,
      clientBadge: "Refusing Disbursement",
      freelancerStatus: "ACTIVE" as const,
      freelancerBadge: "Uncompensated Work",
      threadState: "BROKEN" as const,
      icon: <DollarSign className="text-status-error" size={24} />,
      riskLevel: "EXPLOITATION RISK",
    },
    {
      id: "custody",
      title: "Third-Party Escrow Freezes & High Fees",
      subtitle: "Traditional freelance marketplaces charge 10%–20% in fees and arbitrarily lock client funds for 60+ days during manual reviews.",
      clientStatus: "LOCKED" as const,
      clientBadge: "Funds Frozen by Platform",
      freelancerStatus: "LOCKED" as const,
      freelancerBadge: "Waiting 45 Days for Payout",
      threadState: "BROKEN" as const,
      icon: <FileWarning className="text-status-warning" size={24} />,
      riskLevel: "CUSTODIAL & FEE OVERHEAD",
    },
  ];

  return (
    <section id="problem" className="py-28 px-4 sm:px-6 lg:px-8 bg-surface-1/90 border-t border-border-subtle relative overflow-hidden">
      {/* Decorative red/amber warning gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-red-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle size={14} />
            <span>The Broken Web2 Status Quo</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Traditional Freelancing is Built on <br />
            <span className="text-status-error underline decoration-status-error/40 underline-offset-8">Blind Trust & Broken Promises.</span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed pt-2">
            Without programmatic cryptographic guarantees, both clients and engineers remain trapped in high-fee, high-risk relationships with zero recourse when disputes occur.
          </p>
        </div>

        {/* Interactive Broken Connection Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Scenario Selector Sidebar */}
          <div className="lg:col-span-5 space-y-3">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                onClick={() => setActiveScenario(index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  activeScenario === index
                    ? "bg-surface-2 border-status-error shadow-lg"
                    : "bg-surface-0/60 border-border-subtle hover:border-border-default opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    activeScenario === index ? "bg-red-500/15 border border-red-500/30" : "bg-surface-1"
                  }`}>
                    {scenario.icon}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-text-primary">{scenario.title}</h3>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        Scenario #{index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{scenario.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Broken Trust Thread Animation Display */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={scenarios[activeScenario].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-10 rounded-3xl bg-surface-0 border border-status-error/40 shadow-2xl relative overflow-hidden space-y-8"
              >
                {/* Top Warning Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                  <span className="text-xs font-mono font-bold text-status-error flex items-center gap-2">
                    <XCircle size={15} />
                    {scenarios[activeScenario].riskLevel}
                  </span>
                  <span className="text-[11px] font-mono text-text-tertiary">
                    No Smart Contract Protection
                  </span>
                </div>

                {/* Broken Nodes & Snapped Thread Visualization */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-6">
                  <div className="w-full sm:w-56">
                    <TrustNode
                      id="problem-client"
                      title="Stellar Ventures"
                      subtitle="Client Employer"
                      nodeType="CLIENT"
                      state={scenarios[activeScenario].clientStatus}
                      badgeLabel={scenarios[activeScenario].clientBadge}
                    />
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center w-full sm:w-auto my-2">
                    {/* Animated Snapped Thread */}
                    <div className="relative w-full flex items-center justify-center">
                      <svg className="w-full h-12 overflow-visible" viewBox="0 0 160 48" fill="none">
                        {/* Left half of broken line */}
                        <motion.line
                          x1="0"
                          y1="24"
                          x2="65"
                          y2="28"
                          stroke="#EF4444"
                          strokeWidth="3"
                          strokeDasharray="6 4"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        {/* Right half of broken line */}
                        <motion.line
                          x1="95"
                          y1="20"
                          x2="160"
                          y2="24"
                          stroke="#EF4444"
                          strokeWidth="3"
                          strokeDasharray="6 4"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        {/* Sparks/Broken point */}
                        <circle cx="75" cy="30" r="4" fill="#EF4444" filter="drop-shadow(0 0 8px #EF4444)" />
                        <circle cx="85" cy="18" r="3" fill="#F87171" />
                      </svg>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-[10px] font-mono font-bold text-red-300 shadow-md whitespace-nowrap flex items-center gap-1.5">
                        <ShieldAlert size={12} />
                        <span>Connection Severed</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-status-error mt-3">
                      Zero On-Chain Recourse
                    </span>
                  </div>

                  <div className="w-full sm:w-56">
                    <TrustNode
                      id="problem-freelancer"
                      title="Alice Chen"
                      subtitle="Senior Engineer"
                      nodeType="FREELANCER"
                      state={scenarios[activeScenario].freelancerStatus}
                      badgeLabel={scenarios[activeScenario].freelancerBadge}
                    />
                  </div>
                </div>

                {/* Bottom explanation */}
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 leading-relaxed flex items-start gap-3">
                  <AlertTriangle size={18} className="shrink-0 text-red-400 mt-0.5" />
                  <span>
                    <strong>Why this happens:</strong> Conventional payment gateways cannot verify deliverable quality or enforce programmatic timeouts. Once funds leave a bank account or unmanaged crypto wallet, recovery requires expensive, multi-month legal arbitration.
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
