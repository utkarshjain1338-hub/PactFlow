"use client";

/**
 * PactFlow — Escrows & Vaults Page
 * On-chain Soroban Escrow contracts, Level 4 Hardware Timelocks, and Milestone Timeline management.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Unlock, Cpu, Milestone as MilestoneIcon, Layers } from "lucide-react";
import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import {
  EscrowVault,
  EscrowStatusCard,
  MilestoneTimeline,
  TrustNode,
  TrustThread,
} from "@/components/pactflow";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MOCK_ESCROWS, MOCK_MILESTONES } from "@/lib/mock-data";
import { useAppStore } from "@/store/app-store";

type ViewTab = "VAULTS" | "MILESTONES" | "GRAPH";

export default function EscrowsPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("VAULTS");
  const { activeRole } = useAppStore();

  const handleAction = (milestoneId: string, actionType: "FUND" | "SUBMIT" | "RELEASE") => {
    // Mock action callback handler
    console.log(`Action [${actionType}] triggered on milestone [${milestoneId}]`);
  };

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
              contractId="C...8E1"
              status="ACTIVE"
              lockedAmountXlm="150.0000000"
              releasedAmountXlm="0.0000000"
              timelockExpiry="2026-08-01T00:00:00Z"
              securityTier="LEVEL_4"
            />
            <EscrowStatusCard
              contractId="C...8E0"
              status="RELEASED"
              lockedAmountXlm="0.0000000"
              releasedAmountXlm="100.0000000"
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
                  ? "bg-brand-500 text-white shadow-brand-xs"
                  : "bg-surface-1 text-text-secondary hover:text-text-primary"
              }`}
            >
              <Lock size={14} />
              <span>Soroban Vaults ({MOCK_ESCROWS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("MILESTONES")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "MILESTONES"
                  ? "bg-brand-500 text-white shadow-brand-xs"
                  : "bg-surface-1 text-text-secondary hover:text-text-primary"
              }`}
            >
              <MilestoneIcon size={14} />
              <span>Milestones ({MOCK_MILESTONES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("GRAPH")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "GRAPH"
                  ? "bg-brand-500 text-white shadow-brand-xs"
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
              {MOCK_ESCROWS.map((escrow, index) => (
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
                milestones={MOCK_MILESTONES}
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
              className="p-6 sm:p-8 rounded-2xl bg-surface-1/90 border border-border-subtle backdrop-blur-md flex flex-col items-center justify-center gap-2 my-4"
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
                  label="150 XLM Locked"
                  amountXlm="150.0000000"
                />

                <TrustNode
                  id="escrow-node"
                  title="pactflow_escrow"
                  subtitle="CCV7...C8E1"
                  nodeType="ESCROW_CONTRACT"
                  state="ACTIVE"
                  badgeLabel="2-of-3 Multisig"
                  amountXlm="150.0000000"
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
