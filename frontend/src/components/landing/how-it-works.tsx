"use client";

/**
 * PactFlow — How It Works Section Component
 * Section 4: Interactive 5-step milestone progression where each step advances one escrow state.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Lock,
  Send,
  Unlock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustNode } from "@/components/pactflow/trust-node";
import { TrustThread } from "@/components/pactflow/trust-thread";

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: "Client Funds Escrow",
      subtitle: "Client initializes a milestone contract with 150 XLM. Funds are deposited directly from their non-custodial wallet into the Soroban contract address.",
      actionLabel: "Fund Contract On-Chain",
      icon: <Wallet size={20} className="text-brand-400" />,
      badge: "150 XLM Staged",
      clientState: "VERIFIED" as const,
      escrowState: "ACTIVE" as const,
      freelancerState: "ACTIVE" as const,
      threadState: "ACTIVE" as const,
      threadLabel: "Staging 150 XLM",
    },
    {
      step: 2,
      title: "Funds Cryptographically Locked",
      subtitle: "The Soroban Wasm contract verifies the deposit and locks the reserves. A 2-of-3 arbiter multisig timelock is enabled to protect both parties against defaults.",
      actionLabel: "Lock Reserves & Timelock",
      icon: <Lock size={20} className="text-amber-400" />,
      badge: "Hardware Enforced Lock",
      clientState: "VERIFIED" as const,
      escrowState: "LOCKED" as const,
      freelancerState: "VERIFIED" as const,
      threadState: "LOCKED" as const,
      threadLabel: "Locked • 150 XLM",
    },
    {
      step: 3,
      title: "Freelancer Submits Milestone Work",
      subtitle: "Alice Chen completes Milestone #1 (DeFi Dashboard UI) and attaches verifiable deliverable proof (GitHub commit / deployment URL) on-chain.",
      actionLabel: "Submit Deliverable Proofs",
      icon: <Send size={20} className="text-cyan-400" />,
      badge: "Deliverable Submitted",
      clientState: "VERIFIED" as const,
      escrowState: "ACTIVE" as const,
      freelancerState: "VERIFIED" as const,
      threadState: "ACTIVE" as const,
      threadLabel: "Work Review Pending",
    },
    {
      step: 4,
      title: "Verification & Payment Release",
      subtitle: "Client inspects the deliverable and signs the release transaction. Soroban instantly disburses 150 XLM directly to Alice's wallet in 1.2 seconds.",
      actionLabel: "Verify & Release Payment",
      icon: <Unlock size={20} className="text-status-success" />,
      badge: "150 XLM Released",
      clientState: "VERIFIED" as const,
      escrowState: "VERIFIED" as const,
      freelancerState: "VERIFIED" as const,
      threadState: "RELEASED" as const,
      threadLabel: "Disbursed 150 XLM",
    },
    {
      step: 5,
      title: "Level 4 Receipt & Reputation Updated",
      subtitle: "The contract emits an on-chain cryptographic receipt. Both Client and Freelancer earn Level 4 verified reputation scores permanently recorded on the Stellar ledger.",
      actionLabel: "Finalize Contract & Reputation",
      icon: <CheckCircle2 size={20} className="text-purple-400" />,
      badge: "Contract Completed ⭐",
      clientState: "VERIFIED" as const,
      escrowState: "VERIFIED" as const,
      freelancerState: "VERIFIED" as const,
      threadState: "RELEASED" as const,
      threadLabel: "Level 4 Verified",
    },
  ];

  const currentStep = steps.find((s) => s.step === activeStep) || steps[0];

  return (
    <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 bg-surface-1/95 border-t border-border-subtle relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <Cpu size={14} />
            <span>Programmable Milestone Escrow</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            How PactFlow Works <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-amber-500">
              In 5 Interactive Steps.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Experience real-time state transitions through our interactive simulation below. Click through each milestone stage to see how Soroban protects your money.
          </p>
        </div>

        {/* Step Progress Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-surface-0 border border-border-subtle max-w-4xl mx-auto">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeStep === s.step
                  ? "bg-brand-500 text-white shadow-brand-xs scale-[1.02]"
                  : activeStep > s.step
                  ? "bg-surface-2/80 text-status-success hover:bg-surface-2"
                  : "bg-transparent text-text-tertiary hover:text-text-primary hover:bg-surface-2/40"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] ${
                activeStep === s.step ? "bg-white text-brand-700" : activeStep > s.step ? "bg-status-success/20 text-status-success" : "bg-surface-3 text-text-tertiary"
              }`}>
                {activeStep > s.step ? "✓" : s.step}
              </span>
              <span className="truncate font-sans">{s.title.split(" ")[0]} {s.title.split(" ")[1]}</span>
            </button>
          ))}
        </div>

        {/* Interactive Step Stage Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-8 sm:p-12 rounded-3xl bg-surface-0 border border-brand-500/30 shadow-2xl relative space-y-10"
          >
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-brand-500/15 border border-brand-500/30">
                  {currentStep.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-400">
                      Step {currentStep.step} of 5
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border-default text-[10px] font-mono text-text-secondary">
                      {currentStep.badge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-1">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                  leftIcon={<ArrowLeft size={14} />}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setActiveStep((prev) => (prev === 5 ? 1 : prev + 1))}
                  rightIcon={<ArrowRight size={14} />}
                >
                  {activeStep === 5 ? "Reset Simulation" : "Next Milestone Step"}
                </Button>
              </div>
            </div>

            {/* Step Description */}
            <p className="text-sm sm:text-base text-text-secondary max-w-3xl leading-relaxed">
              {currentStep.subtitle}
            </p>

            {/* Live Interactive Constellation Node Visualizer for this Step */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-1 border border-border-subtle/80 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="w-full lg:w-64">
                <TrustNode
                  id={`step-${currentStep.step}-client`}
                  title="Stellar Ventures"
                  subtitle="Client Employer"
                  nodeType="CLIENT"
                  state={currentStep.clientState}
                  badgeLabel="Client Wallet"
                />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center w-full min-w-[130px]">
                <TrustThread
                  state={currentStep.threadState}
                  orientation="horizontal"
                  label={currentStep.threadLabel}
                  amountXlm="150.0000000"
                />
              </div>

              <div className="w-full lg:w-72">
                <TrustNode
                  id={`step-${currentStep.step}-escrow`}
                  title="pactflow_escrow"
                  subtitle="Soroban Contract Address"
                  nodeType="ESCROW_CONTRACT"
                  state={currentStep.escrowState}
                  badgeLabel={currentStep.badge}
                  amountXlm="150.0000000"
                  className="border-brand-500/60 shadow-brand-sm"
                />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center w-full min-w-[130px]">
                <TrustThread
                  state={currentStep.threadState}
                  orientation="horizontal"
                  label="Deliverable Proof"
                />
              </div>

              <div className="w-full lg:w-64">
                <TrustNode
                  id={`step-${currentStep.step}-freelancer`}
                  title="Alice Chen"
                  subtitle="Senior Assignee"
                  nodeType="FREELANCER"
                  state={currentStep.freelancerState}
                  badgeLabel="Assignee Wallet"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
