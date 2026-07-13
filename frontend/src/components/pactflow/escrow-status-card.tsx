"use client";

/**
 * PactFlow — Domain UI Components
 * Escrow Status Card (`EscrowStatusCard`)
 *
 * Compact or detailed KPI status card summarizing an escrow contract's
 * real-time security posture, timelock status, and locked vs released balances.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Lock, Unlock, Clock, AlertCircle, Cpu } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type EscrowStatus } from "@/types/domain";

export interface EscrowStatusCardProps {
  contractId: string;
  status: EscrowStatus;
  lockedAmountXlm: string | number;
  releasedAmountXlm?: string | number;
  assetCode?: string;
  timelockExpiry?: string | null;
  securityTier?: "LEVEL_4" | "LEVEL_3" | "STANDARD";
  className?: string;
}

export function EscrowStatusCard({
  contractId,
  status,
  lockedAmountXlm,
  releasedAmountXlm = "0.0000000",
  assetCode = "XLM",
  timelockExpiry,
  securityTier = "LEVEL_4",
  className,
}: EscrowStatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Locked in Smart Contract",
          variant: "brand" as const,
          icon: <Lock size={16} className="text-brand-300" />,
          bg: "bg-brand-500/5 border-brand-500/30",
        };
      case "RELEASED":
        return {
          label: "Payment Released On-Chain",
          variant: "success" as const,
          icon: <Unlock size={16} className="text-status-success" />,
          bg: "bg-status-success/5 border-status-success/30",
        };
      case "REFUNDED":
        return {
          label: "Refunded to Client Wallet",
          variant: "warning" as const,
          icon: <AlertCircle size={16} className="text-status-warning" />,
          bg: "bg-status-warning/5 border-status-warning/30",
        };
      default:
        return {
          label: "Pending Deployment",
          variant: "secondary" as const,
          icon: <Clock size={16} className="text-text-tertiary" />,
          bg: "bg-surface-2 border-border-default",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-all duration-200 select-none",
        "bg-surface-1/95 backdrop-blur-md flex flex-col justify-between gap-4",
        config.bg,
        className
      )}
      role="region"
      aria-label={`Escrow Status: ${config.label}`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="p-2 rounded-xl bg-surface-0 border border-border-subtle shadow-xs shrink-0"
            >
              {config.icon}
            </motion.div>
          </AnimatePresence>
          <div className="min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Escrow Security Posture
            </h4>
            <p className="text-sm font-bold text-text-primary truncate mt-0.5">
              {config.label}
            </p>
          </div>
        </div>

        <Badge variant={config.variant} size="sm" className="shrink-0 font-sans">
          {status.replace("_", " ")}
        </Badge>
      </div>

      {/* Financial Split */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-0/80 border border-border-subtle text-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
            Locked Balance
          </span>
          <span className="text-sm sm:text-base font-bold font-mono text-text-primary block mt-0.5">
            {formatCurrency(lockedAmountXlm, assetCode)}
          </span>
        </div>
        <div className="border-l border-border-subtle pl-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
            Released Balance
          </span>
          <span className="text-sm sm:text-base font-bold font-mono text-status-success block mt-0.5">
            {formatCurrency(releasedAmountXlm, assetCode)}
          </span>
        </div>
      </div>

      {/* Bottom Security Tier & Timelock Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle text-xs text-text-tertiary">
        <div className="flex items-center gap-1.5 font-medium text-brand-300">
          <ShieldCheck size={14} className="text-brand-400" />
          <span>Level 4 • Hardware Enforced</span>
        </div>

        {timelockExpiry && (
          <div className="flex items-center gap-1 font-mono text-[11px] text-text-secondary">
            <Clock size={12} className="text-text-tertiary" />
            <span>Timelock: {new Date(timelockExpiry).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
