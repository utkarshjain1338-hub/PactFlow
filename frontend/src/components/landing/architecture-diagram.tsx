"use client";

/**
 * PactFlow — Architecture Diagram Section Component
 * Section 8: Interactive full-stack diagram connecting Next.js, Spring Boot, Soroban, and Stellar.
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
 Code2,
 Server,
 Database,
 Cpu,
 Globe,
 Layers,
 CheckCircle2,
 ArrowRight,
 Terminal,
} from "lucide-react";

export function ArchitectureDiagram() {
 const [selectedLayer, setSelectedLayer] = useState<string>("soroban");

 const layers = [
  {
   id: "frontend",
   title: "Next.js 16 App Router (Frontend)",
   badge: "TypeScript + Tailwind + shadcn/ui",
   icon: <Code2 className="text-brand-400" size={24} />,
   details:
    "Strictly presentational architecture. Communicates with Spring Boot via RFC 7807 type-safe REST APIs and interfaces with non-custodial wallets via @stellar/freelighter-api.",
   tech: ["Turbopack", "Framer Motion", "TanStack Query", "Zustand Store"],
  },
  {
   id: "backend",
   title: "Spring Boot Java 21 (Domain Engine)",
   badge: "Clean Architecture + DDD",
   icon: <Server className="text-purple-400" size={24} />,
   details:
    "The authoritative orchestrator of project metadata, milestone workflows, and user identities. Enforces Domain-Driven Design bounded contexts and idempotent request processing.",
   tech: ["Java 21 Virtual Threads", "Spring Security", "Flyway Migrations", "OpenAPI 3.1"],
  },
  {
   id: "database",
   title: "PostgreSQL 16 (Relational State Store)",
   badge: "ACID Compliant + JSONB",
   icon: <Database className="text-amber-400" size={24} />,
   details:
    "Stores off-chain project briefs, deliverable attachments, user profiles, and audit trails. Mirrored and synchronized in real-time with on-chain Soroban events.",
   tech: ["pg_stat_statements", "Connection Pooling", "Row-Level Security", "Audit Triggers"],
  },
  {
   id: "soroban",
   title: "Soroban Wasm Smart Contracts",
   badge: "Rust + WebAssembly",
   icon: <Cpu className="text-cyan-400" size={24} />,
   details:
    "Handles 100% of financial custody (`pactflow_escrow`). Implements 2-of-3 arbiter multisig, hardware timelock expirations, and verifiable cryptographic receipts.",
   tech: ["soroban-sdk v21", "Veridise Audited", "Deterministic Storage", "Zero Reentrancy"],
  },
  {
   id: "stellar",
   title: "Stellar Consensus Network",
   badge: "1.2s Finality Ledger",
   icon: <Globe className="text-status-success" size={24} />,
   details:
    "The global decentralized consensus layer settling XLM and USDC payments instantly across borders with near-zero microscopic fees ($0.0000015 per tx).",
   tech: ["Stellar Consensus Protocol", "Soroban RPC", "Public Explorer", "RFC 7807 Safe"],
  },
 ];

 return (
  <section id="architecture" className="py-32 px-4 sm:px-6 lg:px-8 bg-surface-0 border-t border-border-subtle relative overflow-hidden">
   {/* Background ambient light */}
   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none" />

   <div className="max-w-6xl mx-auto space-y-16 relative z-10">
    {/* Header */}
    <div className="text-center space-y-4 max-w-3xl mx-auto">
     <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
      <Terminal size={14} />
      <span>Developer Friendly & Clean Architecture</span>
     </div>

     <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
      Built for Engineers Who Value <br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-cyan-400 to-brand-300">
       Strict Architectural Boundaries.
      </span>
     </h2>

     <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
      Our core constitution guarantees that blockchain is only responsible for financial trust, while clean application code governs metadata and user experience.
     </p>
    </div>

    {/* Interactive Full-Stack Diagram */}
    <div className="p-8 sm:p-12 rounded-3xl bg-surface-1 border border-border-subtle shadow-2xl space-y-12">
     {/* Visual Stack Flow */}
     <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative items-center">
      {layers.map((layer, idx) => (
       <React.Fragment key={layer.id}>
        <motion.div
         onClick={() => setSelectedLayer(layer.id)}
         whileHover={{ scale: 1.03 }}
         whileTap={{ scale: 0.98 }}
         className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col items-center text-center space-y-3 relative z-10 ${
          selectedLayer === layer.id
           ? "bg-surface-0 border-cyan-400 shadow-lg ring-2 ring-cyan-400/20"
           : "bg-surface-0 border-border-subtle hover:border-border-default opacity-85 hover:opacity-100"
         }`}
        >
         <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle">
          {layer.icon}
         </div>
         <div>
          <h4 className="text-xs font-bold text-text-primary leading-tight">{layer.title.split(" (")[0]}</h4>
          <span className="text-[10px] font-mono text-text-tertiary block mt-0.5">
           {layer.title.split(" (")[1] ? `(${layer.title.split(" (")[1]}` : ""}
          </span>
         </div>
         <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 text-cyan-300 border border-border-subtle">
          {layer.badge}
         </span>
        </motion.div>

        {/* Animated Data Packet Connector Line (Between boxes on desktop) */}
        {idx < layers.length - 1 && (
         <div className="hidden md:flex items-center justify-center relative -mx-2 z-0">
          <svg className="w-full h-6 overflow-visible" viewBox="0 0 40 24">
           <line x1="0" y1="12" x2="40" y2="12" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
           <motion.circle
            cx="0"
            cy="12"
            r="3.5"
            fill="#9FD8FF"
            filter="drop-shadow(0 0 4px #9FD8FF)"
            animate={{ cx: [0, 40], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.4 }}
           />
          </svg>
         </div>
        )}
       </React.Fragment>
      ))}
     </div>

     {/* Selected Layer Deep Dive Details */}
     <div className="p-6 sm:p-8 rounded-2xl bg-surface-0 border border-border-subtle grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
      <div className="lg:col-span-2 space-y-3">
       <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300">
         {layers.find((l) => l.id === selectedLayer)?.icon}
        </div>
        <div>
         <h3 className="text-base sm:text-lg font-bold text-text-primary">
          {layers.find((l) => l.id === selectedLayer)?.title}
         </h3>
         <span className="text-xs font-mono text-cyan-400">
          {layers.find((l) => l.id === selectedLayer)?.badge}
         </span>
        </div>
       </div>
       <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
        {layers.find((l) => l.id === selectedLayer)?.details}
       </p>
      </div>

      <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-2">
       <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-tertiary block mb-2">
        Key Production Specifications
       </span>
       <div className="flex flex-wrap gap-2">
        {layers.find((l) => l.id === selectedLayer)?.tech.map((item) => (
         <span
          key={item}
          className="px-2.5 py-1 rounded-lg bg-surface-0 border border-border-subtle text-xs font-mono text-text-primary flex items-center gap-1.5"
         >
          <CheckCircle2 size={12} className="text-status-success" />
          {item}
         </span>
        ))}
       </div>
      </div>
     </div>
    </div>
   </div>
  </section>
 );
}
