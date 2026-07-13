"use client";

/**
 * PactFlow — Final CTA Section Component
 * Section 12: Dark dramatic starfield convergence into a single brilliant golden node.
 */
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConstellationCanvas } from "./constellation-canvas";

export function CTASection() {
  return (
    <section className="relative py-36 px-4 sm:px-6 lg:px-8 bg-surface-0 overflow-hidden border-t border-border-subtle text-center flex flex-col items-center justify-center min-h-[600px]">
      {/* High-density converging starfield canvas */}
      <ConstellationCanvas starCount={120} connectionDistance={210} accentColor="#F2B84B" />

      {/* Deep Space Central Convergence Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-500/25 via-amber-500/20 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Central Converged Star Node Visualizer */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 via-brand-500 to-amber-600 p-0.5 shadow-brand-xl flex items-center justify-center relative group"
        >
          <div className="absolute -inset-4 rounded-3xl bg-brand-500 blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
          <div className="w-full h-full bg-surface-0 rounded-[22px] flex items-center justify-center relative z-10">
            <Sparkles size={36} className="text-brand-300 animate-spin-slow" />
          </div>
        </motion.div>

        {/* Dramatic Headline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-text-primary leading-[1.06]">
            Build Trust. <br />
            Build Faster. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-amber-400 to-amber-600">
              Build with PactFlow.
            </span>
          </h2>
          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed pt-2">
            Join the decentralized engineering revolution. Launch your first Level 4 timelocked milestone contract on Soroban testnet today.
          </p>
        </motion.div>

        {/* Buttons: Launch App & GitHub */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight size={18} />}
              className="w-full sm:w-auto px-9 py-4 text-base font-bold shadow-brand-lg hover:scale-105 transition-all"
            >
              Launch App
            </Button>
          </Link>

          <a
            href="https://github.com/stellar/soroban-examples"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              variant="outline"
              leftIcon={<Code2 size={18} />}
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-surface-1/80 hover:bg-surface-2 transition-all"
            >
              GitHub Repository
            </Button>
          </a>
        </motion.div>

        {/* Bottom trust assurance */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="pt-6 flex items-center justify-center gap-2 text-xs font-mono text-text-tertiary"
        >
          <ShieldCheck size={14} className="text-status-success" />
          <span>Non-custodial • Wasm Enforced • RFC 7807 Compliant</span>
        </motion.div>
      </div>
    </section>
  );
}
