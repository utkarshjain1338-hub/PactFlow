"use client";

/**
 * PactFlow — Stellar Powered Section Component
 * Section 5: Camera zoom-out network expansion showing hundreds of escrow connections and visual proofs.
 */
import React from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, ShieldCheck, Globe, Layers, ExternalLink } from "lucide-react";
import { ConstellationCanvas } from "./constellation-canvas";

export function StellarPowered() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-surface-0 overflow-hidden border-t border-border-subtle">
      {/* 60fps Network Cyan Constellation Background simulating zoom-out */}
      <ConstellationCanvas starCount={110} connectionDistance={180} accentColor="#9FD8FF" />

      {/* Cyan & Indigo radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-20 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-md"
          >
            <Globe size={14} className="animate-pulse" />
            <span>Stellar Consensus Network Powered</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.08]"
          >
            From One Escrow Connection <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-brand-300">
              To A Global Galaxy of Trust.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            By compiling our smart contracts to WebAssembly inside Soroban, PactFlow scales to millions of global interactions with sub-second finality and near-zero cost.
          </motion.p>
        </div>

        {/* Interactive Visual Metrics (No Bullet Lists!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Visual Proof 1: Fast Settlement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="p-8 rounded-3xl bg-surface-1/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 w-fit text-cyan-300">
                <Zap size={24} />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                Instant On-Chain Settlement
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-mono tabular-nums">
                1.2 Seconds
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Stellar Consensus Protocol (SCP) guarantees mathematical settlement in ~1.2 seconds without confirmation reorgs or multi-day pending holds.
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-tertiary">
              <span>Finality: Guaranteed</span>
              <span className="text-status-success font-bold">100% Deterministic</span>
            </div>
          </motion.div>

          {/* Visual Proof 2: Near-Zero Fees */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="p-8 rounded-3xl bg-surface-1/90 border border-brand-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-brand-500/15 border border-brand-500/30 w-fit text-brand-300">
                <Cpu size={24} />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-400">
                Microscopic Network Fees
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-300 font-mono tabular-nums">
                0.00001 XLM
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Pay a fraction of a cent per milestone operation. Say goodbye to the 20% platform rake charged by Web2 middlemen.
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-tertiary">
              <span>Fee Cost: ≈ $0.0000015 USD</span>
              <span className="text-brand-400 font-bold">Save 99.9%</span>
            </div>
          </motion.div>

          {/* Visual Proof 3: Transparent Ledger */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="p-8 rounded-3xl bg-surface-1/90 border border-status-success/30 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-status-success/15 border border-status-success/30 w-fit text-status-success">
                <Layers size={24} />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-status-success">
                Verifiable Public Ledger
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Zero Custody
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                All contract state, timelock parameters, and deliverable review signatures are auditable by anyone directly on the Stellar ledger explorer.
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-tertiary">
              <a
                href="https://stellar.expert/explorer/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-status-success hover:underline flex items-center gap-1 font-bold"
              >
                <span>Live Testnet Proof</span>
                <ExternalLink size={11} />
              </a>
              <span>RFC 7807 Safe</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
