"use client";

/**
 * PactFlow — Settings & Preferences Page
 * Configure active workspace role simulation, theme mode, Soroban target network, and API security.
 */
import React, { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Laptop,
  ShieldCheck,
  Building2,
  UserCheck,
  Cpu,
  KeyRound,
  Bell,
  CheckCircle2,
  RefreshCw,
  Lock,
} from "lucide-react";
import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";

export default function SettingsPage() {
  const { activeRole, setRole } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [network, setNetwork] = useState("TESTNET");
  const [hardwareLock, setHardwareLock] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardShell title="Settings" breadcrumbs={[{ label: "Settings" }]}>
      <PageHeader
        title="Platform & Security Settings"
        description="Customize your active role simulator, visual theme, Soroban target environment, and hardware timelocks."
        actions={
          <Button size="sm" variant="primary" onClick={handleSave}>
            {saved ? (
              <>
                <CheckCircle2 size={14} className="mr-1.5 text-status-success" />
                Preferences Saved
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        }
      />

      <div className="space-y-8 max-w-4xl">
        {/* Role Simulator (Critical for UX testing both client & freelancer workflows) */}
        <Section
          title="Active Role Simulator"
          action={<Badge variant="brand" size="sm">Live Store State</Badge>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              onClick={() => setRole("COMPANY")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                activeRole === "COMPANY"
                  ? "bg-brand-500/10 border-brand-500 shadow-brand-xs"
                  : "bg-surface-1 border-border-subtle hover:border-border-default"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-300">
                  <Building2 size={20} />
                </div>
                {activeRole === "COMPANY" && (
                  <Badge variant="brand" size="sm">Active View</Badge>
                )}
              </div>
              <h4 className="text-base font-bold text-text-primary">Company / Client Role</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Simulates a client creating projects, funding escrow contracts on-chain, and reviewing deliverable submissions.
              </p>
            </motion.div>

            <motion.div
              onClick={() => setRole("FREELANCER")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                activeRole === "FREELANCER"
                  ? "bg-brand-500/10 border-brand-500 shadow-brand-xs"
                  : "bg-surface-1 border-border-subtle hover:border-border-default"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-300">
                  <UserCheck size={20} />
                </div>
                {activeRole === "FREELANCER" && (
                  <Badge variant="brand" size="sm">Active View</Badge>
                )}
              </div>
              <h4 className="text-base font-bold text-text-primary">Freelancer / Assignee Role</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Simulates a freelancer browsing the marketplace, submitting work deliverables, and tracking reputation velocity.
              </p>
            </motion.div>
          </div>
        </Section>

        {/* Visual Appearance / Theme */}
        <Section title="Appearance Theme">
          <div className="grid grid-cols-3 gap-3 p-1.5 rounded-2xl bg-surface-1 border border-border-subtle">
            {[
              { id: "dark", label: "Dark Constellation", icon: Moon },
              { id: "light", label: "Light Space", icon: Sun },
              { id: "system", label: "System Auto", icon: Laptop },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                  theme === item.id
                    ? "bg-brand-500 text-white shadow-xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Soroban Network Configuration */}
        <Section title="Soroban Target Environment">
          <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-text-primary">Stellar Network Target</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Choose which Soroban RPC endpoint your client connects to for smart contract simulation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["TESTNET", "FUTURENET", "MAINNET"].map((net) => (
                  <button
                    key={net}
                    onClick={() => setNetwork(net)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      network === net
                        ? "bg-status-success text-white shadow-xs"
                        : "bg-surface-2 text-text-tertiary hover:text-text-primary"
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-0 border border-border-subtle font-mono text-xs text-text-secondary flex items-center justify-between">
              <span>RPC URL: https://soroban-testnet.stellar.org:443</span>
              <span className="text-status-success font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" /> Connected
              </span>
            </div>
          </div>
        </Section>

        {/* Security & Timelock Preferences */}
        <Section title="Escrow Security Protocols">
          <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Lock size={15} className="text-brand-400" />
                  Level 4 Hardware Enforced Timelocks
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Automatically require 2-of-3 arbiter multisig signature verification before any refund or timeout release can be finalized.
                </p>
              </div>

              <button
                onClick={() => setHardwareLock(!hardwareLock)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  hardwareLock ? "bg-brand-500" : "bg-surface-3"
                }`}
                aria-label="Toggle Hardware Enforced Timelocks"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    hardwareLock ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5 font-mono">
                <ShieldCheck size={14} className="text-status-success" />
                Idempotency-Key Headers Enabled (RFC 7807 Safe)
              </span>
              <Button size="sm" variant="outline" className="h-7 text-xs font-mono">
                Rotate API Keys
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </DashboardShell>
  );
}
