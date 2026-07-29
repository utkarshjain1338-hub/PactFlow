"use client";

/**
 * PactFlow — Metrics Section & MetricCounter Component
 * Section 10: Animated tabular-numeral counters measuring on-chain impact.
 */
import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, Zap, Milestone, Award } from "lucide-react";

interface MetricCounterProps {
 label: string;
 valueString: string; // e.g. "$14.2M+" or "99.98%" or "48,500+"
 subValue: string;
 icon: React.ReactNode;
 delay?: number;
}

function MetricCounter({ label, valueString, subValue, icon, delay = 0 }: MetricCounterProps) {
 const ref = useRef<HTMLDivElement | null>(null);
 const isInView = useInView(ref, { once: true, margin: "-50px" });
 const [displayValue, setDisplayValue] = useState("0");

 useEffect(() => {
  if (!isInView) return;

  // Extract numeric base and prefix/suffix
  const match = valueString.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
  if (!match) {
   setTimeout(() => setDisplayValue(valueString), 0);
   return;
  }

  const prefix = match[1];
  const numericStr = match[2].replace(/,/g, "");
  const suffix = match[3];
  const target = parseFloat(numericStr);
  const hasDecimal = numericStr.includes(".");
  const duration = 1800; // ms
  const startTime = performance.now();

  const animateCount = (now: number) => {
   const elapsed = now - startTime;
   const progress = Math.min(1, elapsed / duration);
   // Ease out cubic
   const easeProgress = 1 - Math.pow(1 - progress, 3);
   const current = target * easeProgress;

   let formattedNum: string;
   if (hasDecimal) {
    formattedNum = current.toFixed(2);
   } else {
    formattedNum = Math.floor(current).toLocaleString();
   }

   setDisplayValue(`${prefix}${formattedNum}${suffix}`);

   if (progress < 1) {
    requestAnimationFrame(animateCount);
   } else {
    setDisplayValue(valueString);
   }
  };

  requestAnimationFrame(animateCount);
 }, [isInView, valueString]);

 return (
  <motion.div
   ref={ref}
   initial={{ opacity: 0, y: 25 }}
   whileInView={{ opacity: 1, y: 0 }}
   viewport={{ once: true }}
   transition={{ duration: 0.5, delay }}
   className="p-8 rounded-3xl bg-surface-1 border border-border-subtle hover:border-brand-500/40 transition-all shadow-xl flex flex-col justify-between space-y-4 text-center group"
  >
   <div className="mx-auto p-3.5 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-300 group-hover:scale-110 transition-transform">
    {icon}
   </div>

   <div className="space-y-1">
    <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary font-mono tabular-nums tracking-tight">
     {displayValue}
    </span>
    <h4 className="text-sm font-bold text-text-primary pt-1">{label}</h4>
   </div>

   <span className="text-xs text-text-tertiary border-t border-border-subtle pt-3 font-mono">
    {subValue}
   </span>
  </motion.div>
 );
}

export function MetricsSection() {
 return (
  <section className="py-28 px-4 sm:px-6 lg:px-8 bg-surface-0 border-t border-border-subtle relative overflow-hidden">
   {/* Background glow */}
   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-500/10 rounded-full blur-[150px] pointer-events-none" />

   <div className="max-w-7xl mx-auto space-y-16 relative z-10">
    <div className="text-center space-y-4 max-w-3xl mx-auto">
     <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
      Verifiable Impact
     </span>
     <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
      Programmable Trust at Scale.
     </h2>
     <p className="text-base text-text-secondary">
      Every statistic below is backed by public Soroban smart contract receipts on the Stellar consensus network.
     </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
     <MetricCounter
      label="Escrows Protected On-Chain"
      valueString="$14.2M+"
      subValue="Zero custodial loss incidents"
      icon={<ShieldCheck size={26} className="text-status-success" />}
      delay={0.0}
     />
     <MetricCounter
      label="On-Time Payment Releases"
      valueString="99.98%"
      subValue="Automated SLA enforcement"
      icon={<Award size={26} className="text-brand-400" />}
      delay={0.1}
     />
     <MetricCounter
      label="Milestones Verified & Paid"
      valueString="48,500+"
      subValue="Across 62 countries"
      icon={<Milestone size={26} className="text-cyan-400" />}
      delay={0.2}
     />
     <MetricCounter
      label="Avg Settlement Velocity"
      valueString="1.2s"
      subValue="Finalized in 1 SCP ledger"
      icon={<Zap size={26} className="text-purple-400" />}
      delay={0.3}
     />
    </div>
   </div>
  </section>
 );
}
