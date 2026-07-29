"use client";

/**
 * PactFlow — Hero Section Component
 * Section 1: Full-screen constellation interactive hero with Client <-> Freelancer golden connection story.
 */
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Cpu, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustNode } from "@/components/pactflow/trust-node";
import { ConstellationCanvas } from "./constellation-canvas";

export function Hero() {
 return (
  <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-surface-0">
   {/* 60fps Starfield & Trust Threads Background */}
   <ConstellationCanvas starCount={75} connectionDistance={150} accentColor="#F2B84B" />

   {/* Radial Gradient Glow overlays */}
   <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
   <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

   <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 my-auto">
    {/* Top Status Pill */}
    <motion.div
     initial={{ opacity: 0, y: 15 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.6, ease: "easeOut" }}
     className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-brand-500/30 shadow-brand-xs "
    >
     <Sparkles size={14} className="text-brand-400 animate-pulse" />
     <span className="text-xs font-semibold tracking-wide text-text-primary">
      Constellation of Trust — Programmable Web3 Escrow
     </span>
     <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
    </motion.div>

    {/* Large Modern Headline */}
    <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
     className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]"
    >
     The Future of <br className="hidden sm:inline" />
     <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-amber-500">
      Secure Freelance Payments.
     </span>
    </motion.h1>

    {/* Subheadline explaining escrow */}
    <motion.p
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
     className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-text-secondary font-normal leading-relaxed"
    >
     Hardware-enforced Level 4 timelocks, programmable milestone disbursements, and zero third-party custody powered by Soroban smart contracts on the Stellar consensus network.
    </motion.p>

    {/* Primary & Secondary CTAs */}
    <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
     className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
    >
     <Link href="/dashboard" className="w-full sm:w-auto">
      <Button
       size="lg"
       variant="primary"
       rightIcon={<ArrowRight size={18} />}
       className="w-full sm:w-auto px-8 py-4 text-base font-bold shadow-brand-md hover:scale-[1.02] transition-transform"
      >
       Launch App
      </Button>
     </Link>

     <Link href="/escrows" className="w-full sm:w-auto">
      <Button
       size="lg"
       variant="outline"
       leftIcon={<ShieldCheck size={18} className="text-status-success" />}
       className="w-full sm:w-auto px-7 py-4 text-base font-semibold bg-surface-1 hover:bg-surface-2 transition-all border-border-default"
      >
       Explore Escrow Vaults
      </Button>
     </Link>
    </motion.div>

    {/* Constellation Interactive Node Story (Client <-> Golden Thread <-> Freelancer) */}
    <motion.div
     initial={{ opacity: 0, scale: 0.95 }}
     animate={{ opacity: 1, scale: 1 }}
     transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
     className="mt-14 pt-8 border-t border-border-subtle/60 max-w-4xl mx-auto"
    >
     <div className="text-center mb-6">
      <span className="text-[11px] font-mono tracking-widest uppercase text-text-tertiary">
       Interactive Cryptographic Binding
      </span>
     </div>

     <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border-subtle shadow-2xl">
      {/* Client Node */}
      <div className="z-10 w-full sm:w-64">
       <TrustNode
        id="hero-client"
        title="Stellar Ventures"
        subtitle="Client Address • GA3D...GAKL"
        nodeType="CLIENT"
        state="VERIFIED"
        badgeLabel="Staged 150 XLM"
       />
      </div>

      {/* Golden Animated Connecting Thread */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-0 w-full min-w-[140px] z-10">
       <div className="relative w-full flex items-center justify-center">
        {/* SVG glowing golden connection line */}
        <svg className="w-full h-8 overflow-visible" viewBox="0 0 200 32" fill="none">
         {/* Background track */}
         <line x1="0" y1="16" x2="200" y2="16" stroke="hsl(220, 20%, 24%)" strokeWidth="2" strokeDasharray="4 4" />
         
         {/* Animated golden path */}
         <motion.line
          x1="0"
          y1="16"
          x2="200"
          y2="16"
          stroke="#F2B84B"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, delay: 1.0, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
         />

         {/* Pulsing golden photon */}
         <motion.circle
          cx="0"
          cy="16"
          r="5"
          fill="#F2B84B"
          filter="drop-shadow(0 0 6px #F2B84B)"
          initial={{ cx: 0, opacity: 0 }}
          animate={{ cx: [0, 200], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, delay: 1.0, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
         />
        </svg>

        {/* Central Escrow Lock Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-[10px] font-mono font-bold text-brand-300 flex items-center gap-1 shadow-brand-xs whitespace-nowrap">
         <Lock size={11} className="text-brand-400" />
         <span>Soroban Escrow Lock</span>
        </div>
       </div>
       <span className="text-[10px] font-mono text-text-tertiary mt-2">
        Hardware Enforced 2-of-3 Multisig
       </span>
      </div>

      {/* Freelancer Node */}
      <div className="z-10 w-full sm:w-64">
       <TrustNode
        id="hero-freelancer"
        title="Alice Chen"
        subtitle="Assignee Address • GCXK...LAWD"
        nodeType="FREELANCER"
        state="VERIFIED"
        badgeLabel="Milestone Active"
       />
      </div>
     </div>
    </motion.div>
   </div>

   {/* Subtle Scroll Down Prompt */}
   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-tertiary animate-bounce">
    <span className="text-[10px] font-mono uppercase tracking-widest">Scroll to Explore</span>
    <div className="w-1 h-3 rounded-full bg-brand-400/60" />
   </div>
  </section>
 );
}
