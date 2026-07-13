"use client";

/**
 * PactFlow — Reveal Section Component
 * Section 3: Escrow node reveal transforming broken connections into programmable trust.
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Lock, Cpu, CheckCircle2, Zap } from "lucide-react";
import { TrustNode } from "@/components/pactflow/trust-node";
import { TrustThread } from "@/components/pactflow/trust-thread";
import { Button } from "@/components/ui/button";

export function RevealSection() {
  const [ignited, setIgnited] = useState(true);

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-surface-0 relative overflow-hidden">
      {/* Golden Constellation Ignition Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-brand-500/15 via-amber-500/10 to-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider shadow-brand-xs"
          >
            <Sparkles size={14} className="text-brand-400 animate-spin-slow" />
            <span>The PactFlow Breakthrough</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]"
          >
            Trust isn&apos;t a promise. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-amber-500">
              It&apos;s programmable.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            By placing an immutable Soroban smart contract between employer and engineer, money only moves when objective milestone proofs are verified on-chain.
          </motion.p>

          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIgnited(!ignited)}
              leftIcon={<Zap size={14} className="text-brand-400" />}
            >
              {ignited ? "Replay Constellation Ignition" : "Ignite Escrow Node"}
            </Button>
          </div>
        </div>

        {/* Constellation Reveal Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="p-8 sm:p-12 rounded-3xl bg-surface-1/90 border border-brand-500/30 shadow-2xl backdrop-blur-xl relative space-y-10"
        >
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-status-success animate-ping" />
              <span className="text-xs font-mono font-bold text-status-success uppercase tracking-wider">
                Soroban Escrow Contract Active • Level 4 Verified
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-text-tertiary">
              <span className="flex items-center gap-1">
                <Cpu size={14} className="text-brand-400" /> Wasm Enforced
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock size={14} className="text-brand-400" /> 2-of-3 Multisig
              </span>
            </div>
          </div>

          {/* 3-Node Connected Constellation Architecture */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-4">
            {/* Client Node */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full lg:w-72"
            >
              <TrustNode
                id="reveal-client"
                title="Stellar Ventures"
                subtitle="Client Wallet • GA3D...GAKL"
                nodeType="CLIENT"
                state="VERIFIED"
                badgeLabel="Locked 300 XLM"
              />
            </motion.div>

            {/* Left Thread (Client -> Escrow) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-1 flex flex-col items-center w-full min-w-[120px]"
            >
              <TrustThread
                state="LOCKED"
                orientation="horizontal"
                label="300 XLM Locked"
                amountXlm="300.0000000"
              />
            </motion.div>

            {/* Central Escrow Star Node (The Hero Reveal) */}
            <motion.div
              key={ignited ? "ignited" : "reset"}
              initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
              className="w-full lg:w-80 relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-500 to-amber-500 rounded-3xl blur-xl opacity-30 animate-pulse pointer-events-none" />
              
              <TrustNode
                id="reveal-escrow"
                title="pactflow_escrow v2.1"
                subtitle="Contract ID • CCV7...C8E0"
                nodeType="ESCROW_CONTRACT"
                state="ACTIVE"
                badgeLabel="⭐ Central Escrow Vault"
                amountXlm="300.0000000"
                className="border-2 border-brand-400 shadow-brand-lg relative z-10"
              />
            </motion.div>

            {/* Right Thread (Escrow -> Freelancer) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex-1 flex flex-col items-center w-full min-w-[120px]"
            >
              <TrustThread
                state="ACTIVE"
                orientation="horizontal"
                label="Milestone 1 Active"
                amountXlm="150.0000000"
              />
            </motion.div>

            {/* Freelancer Node */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-full lg:w-72"
            >
              <TrustNode
                id="reveal-freelancer"
                title="Alice Chen"
                subtitle="Assignee Wallet • GCXK...LAWD"
                nodeType="FREELANCER"
                state="VERIFIED"
                badgeLabel="Ready for Payout"
              />
            </motion.div>
          </div>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border-subtle">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-brand-300 font-bold text-sm">
                <CheckCircle2 size={16} />
                <span>Zero Counterparty Risk</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Neither party holds the funds during active work. The Soroban smart contract holds 100% of escrow reserves.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-status-success font-bold text-sm">
                <CheckCircle2 size={16} />
                <span>Hardware Timelock Expirations</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                If a milestone deadline passes without deliverable submission or review, automated timeout rules trigger safe refunds or arbiter reviews.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <CheckCircle2 size={16} />
                <span>Instant On-Chain Settlement</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Once approved, XLM or USDC settles to the freelancer&apos;s wallet in ~1.2 seconds without bank delays or multi-day pending holds.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
