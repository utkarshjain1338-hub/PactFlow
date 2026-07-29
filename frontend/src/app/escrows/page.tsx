"use client";
import { formatXlmCompact } from "@/lib/utils";

/**
 * PactFlow — Escrows & Vaults Page
 * On-chain Soroban Escrow contracts, Level 4 Hardware Timelocks, and Milestone Timeline management.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Unlock, Cpu, Milestone as MilestoneIcon, Layers, Loader2 } from "lucide-react";
import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import {
 EscrowVault,
 EscrowStatusCard,
 MilestoneTimeline,
 TrustNode,
 TrustThread,
} from "@/components/pactflow";
import { useAppStore } from "@/store/app-store";
import { useDashboardData } from "@/hooks/use-dashboard-data";

type ViewTab = "VAULTS" | "MILESTONES" | "GRAPH";

export default function EscrowsPage() {
 const [activeTab, setActiveTab] = useState<ViewTab>("VAULTS");
 const { activeRole } = useAppStore();
 const { allEscrows, allMilestones, isLoading } = useDashboardData();

 const handleAction = (milestoneId: string, actionType: "FUND" | "SUBMIT" | "RELEASE") => {
  // Mock action callback handler - realistically this would trigger API or contract calls
  console.log(`Action [${actionType}] triggered on milestone [${milestoneId}]`);
 };

 if (isLoading) {
  return (
   <DashboardShell title="Escrows & Vaults" breadcrumbs={[{ label: "Escrows" }]}>
    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500 w-8 h-8" /></div>
   </DashboardShell>
  );
 }

 // Derive top 2 escrows for the status cards
 const activeEscrows = allEscrows.filter(e => e.status !== "RELEASED" && e.status !== "REFUNDED");
 const releasedEscrows = allEscrows.filter(e => e.status === "RELEASED");
 
 const sampleActive = activeEscrows[0];
 const sampleReleased = releasedEscrows[0];

 return (
  <DashboardShell title="Escrows & Vaults" breadcrumbs={[{ label: "Escrows" }]}>
   <PageHeader
    title="Soroban Escrow Vaults & Milestones"
    description="Hardware-enforced Level 4 timelocks, 2-of-3 arbiter multisig verification, and milestone disbursements."
    actions={
     <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-status-success bg-status-success/10 px-2.5 py-1 rounded-xl border border-status-success/30 flex items-center gap-1.5">
       <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
       Soroban v2.1 Online
      </span>
     </div>
    }
   />

   <div className="space-y-8">
    {/* Top Summary Status Cards */}
    <Section title="Escrow Security Overview">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <EscrowStatusCard
       contractId={sampleActive ? sampleActive.id.substring(0, 8) + "..." : "C...8E1"}
       status={sampleActive ? sampleActive.status : "ACTIVE"}
       lockedAmountXlm={sampleActive ? String(sampleActive.fundedAmount || 0) : "0"}
       releasedAmountXlm="0"
       timelockExpiry={sampleActive?.createdAt || "2026-08-01T00:00:00Z"}
       securityTier="LEVEL_4"
      />
      <EscrowStatusCard
       contractId={sampleReleased ? sampleReleased.id.substring(0, 8) + "..." : "C...8E0"}
       status={sampleReleased ? sampleReleased.status : "RELEASED"}
       lockedAmountXlm="0"
       releasedAmountXlm={sampleReleased ? String(sampleReleased.fundedAmount || 0) : "0"}
       timelockExpiry={null}
       securityTier="LEVEL_4"
      />
     </div>
    </Section>

    {/* View Switch Tabs */}
    <div className="flex items-center justify-between gap-4 pb-2 border-b border-border-subtle">
     <div className="flex items-center gap-2">
      <button
       onClick={() => setActiveTab("VAULTS")}
       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
        activeTab === "VAULTS"
         ? "bg-brand-500 text-primary-foreground shadow-brand-xs"
         : "bg-surface-1 text-text-secondary hover:text-text-primary"
       }`}
      >
       <Lock size={14} />
       <span>Soroban Vaults ({allEscrows.length})</span>
      </button>

      <button
       onClick={() => setActiveTab("MILESTONES")}
       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
        activeTab === "MILESTONES"
         ? "bg-brand-500 text-primary-foreground shadow-brand-xs"
         : "bg-surface-1 text-text-secondary hover:text-text-primary"
       }`}
      >
       <MilestoneIcon size={14} />
       <span>Milestones ({allMilestones.length})</span>
      </button>

      <button
       onClick={() => setActiveTab("GRAPH")}
       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
        activeTab === "GRAPH"
         ? "bg-brand-500 text-primary-foreground shadow-brand-xs"
         : "bg-surface-1 text-text-secondary hover:text-text-primary"
       }`}
      >
       <Layers size={14} />
       <span>Trust Graph</span>
      </button>
     </div>
    </div>

    {/* Main Tab Views */}
    <AnimatePresence mode="wait">
     {activeTab === "VAULTS" && (
      <motion.div
       key="vaults"
       initial={{ opacity: 0, y: 6 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -6 }}
       transition={{ duration: 0.2 }}
       className="space-y-5"
      >
       {allEscrows.map((escrow, index) => (
        <EscrowVault
         key={escrow.id}
         escrow={escrow}
         title={`Escrow Contract #${index + 1}`}
         onVerify={(id) => console.log("Verifying on-chain proof for:", id)}
        />
       ))}
      </motion.div>
     )}

     {activeTab === "MILESTONES" && (
      <motion.div
       key="milestones"
       initial={{ opacity: 0, y: 6 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -6 }}
       transition={{ duration: 0.2 }}
      >
       <MilestoneTimeline
        milestones={allMilestones}
        userRole={activeRole}
        onAction={handleAction}
       />
      </motion.div>
     )}

     {activeTab === "GRAPH" && (
      <motion.div
       key="graph"
       initial={{ opacity: 0, y: 6 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -6 }}
       transition={{ duration: 0.2 }}
       className="p-6 sm:p-8 rounded-2xl bg-surface-1 border border-border-subtle flex flex-col items-center justify-center gap-2 my-4"
      >
       <div className="text-center space-y-1 mb-4 max-w-md">
        <h3 className="text-sm font-bold text-text-primary">Constellation of Trust Architecture</h3>
        <p className="text-xs text-text-secondary">
         Cryptographic binding between client funds, hardware timelocks, and verified deliverable proofs.
        </p>
       </div>

       <div className="flex flex-col sm:flex-row items-center justify-center w-full max-w-4xl gap-2 sm:gap-4 py-6">
        <TrustNode
         id="client-node"
         title="Stellar Ventures"
         subtitle="GA3D...GAKL"
         nodeType="CLIENT"
         state="VERIFIED"
         badgeLabel="Client Identity"
         className="w-full sm:w-auto flex-1"
        />

        <TrustThread
         state="LOCKED"
         orientation="horizontal"
         label={`${allEscrows.length > 0 ? formatXlmCompact(allEscrows.reduce((sum, e) => sum + (e.fundedAmount || 0), 0)) : "0"} Locked`}
         amountXlm={String(allEscrows.reduce((sum, e) => sum + (e.fundedAmount || 0), 0))}
        />

        <TrustNode
         id="escrow-node"
         title="pactflow_escrow"
         subtitle={allEscrows.length > 0 ? allEscrows[0].id.substring(0,8) + "..." : "CCV7...C8E1"}
         nodeType="ESCROW_CONTRACT"
         state="ACTIVE"
         badgeLabel="2-of-3 Multisig"
         amountXlm={String(allEscrows.reduce((sum, e) => sum + (e.fundedAmount || 0), 0))}
         className="w-full sm:w-auto flex-1 border-brand-500/50"
        />

        <TrustThread
         state="ACTIVE"
         orientation="horizontal"
         label="Pending Work"
        />

        <TrustNode
         id="freelancer-node"
         title="Alice Chen"
         subtitle="GCXK...LAWD"
         nodeType="FREELANCER"
         state="VERIFIED"
         badgeLabel="Assignee"
         className="w-full sm:w-auto flex-1"
        />
       </div>
      </motion.div>
     )}
    </AnimatePresence>
   </div>
  </DashboardShell>
 );
}
