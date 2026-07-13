"use client";

/**
 * PactFlow — Security Section Component
 * Section 7: Elegant Constellation Shield animation explaining Level 4 security protocols.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Cpu, Eye, RotateCcw, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export function SecuritySection() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const securityPillars = [
    {
      id: "locking",
      title: "Hardware Enforced Escrow Locking",
      badge: "Level 4 Security Tier",
      icon: <Lock className="text-brand-400" size={24} />,
      summary:
        "When a client funds a contract, the funds are deposited directly into a decentralized Soroban vault on the Stellar blockchain. Neither the client, the freelancer, nor PactFlow can withdraw these funds unilaterally until milestone terms are fulfilled.",
      keyPoint: "Mathematical certainty replaces verbal guarantees.",
    },
    {
      id: "contracts",
      title: "Audited WebAssembly Smart Contracts",
      badge: "Wasm Sandbox",
      icon: <Cpu className="text-cyan-400" size={24} />,
      summary:
        "Our escrow logic (`pactflow_escrow`) is compiled directly to WebAssembly (Wasm) and executed within Soroban's isolated virtual machine. This prevents reentrancy bugs, integer overflows, and unauthorized state modifications.",
      keyPoint: "Rigorous third-party security audits (Veridise).",
    },
    {
      id: "transparent",
      title: "100% Transparent On-Chain Ledger",
      badge: "Zero Hidden Logic",
      icon: <Eye className="text-status-success" size={24} />,
      summary:
        "Every deposit, milestone submission, and payment release leaves an immutable audit trail on the public Stellar ledger. Any party can independently verify contract balances and signatures directly via Stellar Expert without logging in.",
      keyPoint: "Trust what you can verify on the public ledger.",
    },
    {
      id: "timeouts",
      title: "Deterministic Timeout & Refund Protection",
      badge: "Automated Safety Nets",
      icon: <RotateCcw className="text-amber-400" size={24} />,
      summary:
        "If a project stalls or a party becomes unresponsive beyond the agreed deadline, built-in timelock expirations automatically execute deterministic refunds to the client or trigger impartial 2-of-3 arbiter multisig resolution.",
      keyPoint: "Your capital is never trapped in limbo.",
    },
  ];

  return (
    <section id="security" className="py-32 px-4 sm:px-6 lg:px-8 bg-surface-1/90 border-t border-border-subtle relative overflow-hidden">
      {/* Emerald & Golden Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-status-success/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-status-success/15 border border-status-success/30 text-status-success text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Bank-Grade Cryptographic Protection</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Security That Doesn&apos;t Require <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-status-success via-emerald-400 to-cyan-400">
              A Leap of Faith.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            We built PactFlow from the ground up on the principle that blockchain is exclusively responsible for financial trust and immutable accounting.
          </p>
        </div>

        {/* Constellation Shield Interactive Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Constellation Shield Animation */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-surface-0 border border-status-success/40 shadow-2xl relative min-h-[420px]">
            {/* Glowing Shield Visualizer */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Pulsing outer rings */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border-2 border-status-success/30 bg-status-success/5"
              />
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-6 rounded-full border border-status-success/20"
              />

              {/* Central Glowing Shield Icon */}
              <motion.div
                key={activeTab}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="relative z-10 w-32 h-32 rounded-3xl bg-gradient-to-br from-status-success via-emerald-600 to-cyan-700 p-0.5 shadow-2xl flex items-center justify-center"
              >
                <div className="w-full h-full bg-surface-0 rounded-[22px] flex flex-col items-center justify-center p-4 text-center space-y-1">
                  <Shield size={44} className="text-status-success" />
                  <span className="text-[10px] font-mono font-bold uppercase text-text-primary tracking-wider">
                    {securityPillars[activeTab].badge}
                  </span>
                </div>
              </motion.div>

              {/* Orbiting Constellation Security Nodes */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-7 h-7 rounded-full bg-brand-500 border-2 border-surface-0 shadow-lg flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  1
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-7 h-7 rounded-full bg-cyan-500 border-2 border-surface-0 shadow-lg flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  2
                </div>
                <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-7 h-7 rounded-full bg-status-success border-2 border-surface-0 shadow-lg flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  3
                </div>
                <div className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 w-7 h-7 rounded-full bg-purple-500 border-2 border-surface-0 shadow-lg flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  4
                </div>
              </motion.div>
            </div>

            <div className="mt-10 text-center space-y-1">
              <span className="text-xs font-bold text-text-primary uppercase tracking-widest">
                Constellation Shield Architecture
              </span>
              <p className="text-[11px] font-mono text-text-tertiary">
                Click a pillar on the right to inspect its exact security guarantee
              </p>
            </div>
          </div>

          {/* Right: Security Pillar Selector */}
          <div className="lg:col-span-6 space-y-3">
            {securityPillars.map((pillar, index) => (
              <motion.div
                key={pillar.id}
                onClick={() => setActiveTab(index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  activeTab === index
                    ? "bg-surface-0 border-status-success shadow-lg"
                    : "bg-surface-0/50 border-border-subtle hover:border-border-default opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    activeTab === index ? "bg-status-success/15 border border-status-success/30" : "bg-surface-1"
                  }`}>
                    {pillar.icon}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-text-primary">{pillar.title}</h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-status-success/10 text-status-success border border-status-success/20 font-bold shrink-0">
                        Pillar #{index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{pillar.summary}</p>
                    <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-status-success">
                      <CheckCircle2 size={13} />
                      <span>{pillar.keyPoint}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
