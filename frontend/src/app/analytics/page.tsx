"use client";

/**
 * PactFlow — Analytics & ROI Page
 * Role-aware financial velocity analytics, hardware security health, and reputation metrics.
 */
import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ShieldCheck, Zap, Cpu, Award, Lock, CheckCircle2 } from "lucide-react";
import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import { AnalyticsCard, TrustNode, TrustThread } from "@/components/pactflow";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/card";
import { MOCK_COMPANY_ANALYTICS, MOCK_FREELANCER_ANALYTICS } from "@/lib/mock-data";
import { useAppStore } from "@/store/app-store";

export default function AnalyticsPage() {
  const { activeRole } = useAppStore();
  const analytics = activeRole === "COMPANY" ? MOCK_COMPANY_ANALYTICS : MOCK_FREELANCER_ANALYTICS;

  return (
    <DashboardShell title="Analytics" breadcrumbs={[{ label: "Analytics" }]}>
      <PageHeader
        title="Financial Trust & Escrow Velocity"
        description="Deep dive into your on-chain financial volume, completion speed, and reputation ROI."
        actions={
          <Badge variant="brand" size="md">
            {activeRole === "COMPANY" ? "Client Analytics View" : "Freelancer Velocity View"}
          </Badge>
        }
      />

      <div className="space-y-8">
        {/* Primary Analytics Card */}
        <Section title="Period Financial Performance">
          <AnalyticsCard
            analytics={analytics}
            title={activeRole === "COMPANY" ? "Client Expenditure & Escrow ROI" : "Freelancer Earnings & Reputation Velocity"}
          />
        </Section>

        {/* Secondary KPI Grid */}
        <Section title="On-Chain Reliability & Security KPIs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Hardware Timelock Health"
              value="100.0%"
              subValue="Zero protocol violations"
              icon={<ShieldCheck size={20} className="text-status-success" />}
              trend={{ value: "Level 4 Verified", direction: "up" }}
            />
            <StatCard
              label="Stellar Consensus Finality"
              value="1.2s"
              subValue="Average confirmation"
              icon={<Zap size={20} className="text-brand-400" />}
              trend={{ value: "Testnet v21", direction: "neutral" }}
            />
            <StatCard
              label="Arbiter Dispute Rate"
              value="0.00%"
              subValue="Lifetime disputes resolved"
              icon={<CheckCircle2 size={20} className="text-status-success" />}
              trend={{ value: "Perfect record", direction: "up" }}
            />
            <StatCard
              label={activeRole === "COMPANY" ? "Avg Project Budget" : "On-Chain Reputation"}
              value={activeRole === "COMPANY" ? "331 XLM" : "⭐ 4.98 / 5.0"}
              subValue={activeRole === "COMPANY" ? "Per contract" : "Top 1% rated"}
              icon={<Award size={20} className="text-purple-400" />}
              trend={{ value: "+8.4% YoY", direction: "up" }}
            />
          </div>
        </Section>

        {/* Hardware Timelock & Security Deep Dive */}
        <Section title="Level 4 Cryptographic Verification">
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-1/90 border border-border-subtle backdrop-blur-md grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success">
                  <Cpu size={20} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Level 4 Escrow Enforcer Active
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Every milestone transaction processed on PactFlow is governed by smart contracts compiled to WebAssembly (Wasm) and executed inside Soroban on the Stellar consensus network.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg bg-surface-0 border border-border-default text-xs font-mono text-brand-300">
                  🔐 2-of-3 Multisig Arbiter
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-0 border border-border-default text-xs font-mono text-status-success">
                  ⚡ Hardware Enforced Expirations
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-0 border border-border-default text-xs font-mono text-purple-300">
                  🛡️ Zero Third-Party Custody
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-0 border border-border-subtle space-y-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                System Security Status
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Smart Contract Audits</span>
                <span className="font-bold text-status-success">PASSED (Veridise)</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-2">
                <span className="text-text-secondary">Host VM Finality</span>
                <span className="font-bold font-mono text-text-primary">1,240 ms</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-2">
                <span className="text-text-secondary">Escrow Reserve Ratio</span>
                <span className="font-bold font-mono text-brand-300">100% Solvency</span>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </DashboardShell>
  );
}
