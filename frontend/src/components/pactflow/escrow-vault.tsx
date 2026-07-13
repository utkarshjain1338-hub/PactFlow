"use client";

/**
 * PactFlow — Domain UI Components
 * Escrow Vault (`EscrowVault`)
 *
 * Visual representation of an on-chain Soroban Escrow Smart Contract (`pactflow_escrow`).
 * Displays cryptographic status, locked/released balances, timelock security indicators,
 * and state-change transitions upon funding or release.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Cpu,
  Clock,
  KeyRound,
} from "lucide-react";
import { cn, truncateAddress, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type EscrowStatus, type EscrowContract } from "@/types/domain";

export interface EscrowVaultProps {
  escrow: EscrowContract;
  /** Optional custom title override */
  title?: string;
  /** Callback triggered when user clicks view or verify */
  onVerify?: (contractId: string) => void;
  className?: string;
}

export function EscrowVault({
  escrow,
  title = "Soroban On-Chain Vault",
  onVerify,
  className,
}: EscrowVaultProps) {
  const { contractAddress, escrowStatus, lockedAmountXlm, assetCode, fundedAt, releasedAt } = escrow;

  // Map status to vault border and glow
  const getStatusVisuals = () => {
    switch (escrowStatus) {
      case "ACTIVE":
        return {
          border: "border-brand-500/50 bg-brand-500/5 hover:border-brand-500/70",
          badgeVariant: "brand" as const,
          icon: <Lock size={20} className="text-brand-300" />,
          statusLabel: "Locked in Smart Contract",
          glow: "shadow-brand",
        };
      case "RELEASED":
        return {
          border: "border-status-success/50 bg-status-success/5 hover:border-status-success/70",
          badgeVariant: "success" as const,
          icon: <Unlock size={20} className="text-status-success" />,
          statusLabel: "Funds Released On-Chain",
          glow: "shadow-xs",
        };
      case "REFUNDED":
        return {
          border: "border-status-warning/50 bg-status-warning/5 hover:border-status-warning/70",
          badgeVariant: "warning" as const,
          icon: <AlertTriangle size={20} className="text-status-warning" />,
          statusLabel: "Refunded to Client",
          glow: "shadow-xs",
        };
      case "PENDING_DEPLOYMENT":
      default:
        return {
          border: "border-border-default bg-surface-1/80 hover:border-border-strong",
          badgeVariant: "secondary" as const,
          icon: <Clock size={20} className="text-text-tertiary" />,
          statusLabel: "Pending Contract Deployment",
          glow: "shadow-none",
        };
    }
  };

  const visuals = getStatusVisuals();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border p-5 transition-all duration-200 select-none",
        "bg-surface-1/95 backdrop-blur-xl flex flex-col gap-5",
        visuals.border,
        visuals.glow,
        className
      )}
      role="region"
      aria-label={`Escrow Vault: ${title}`}
    >
      {/* Top Header: Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={escrowStatus}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="h-10 w-10 rounded-xl bg-surface-0 border border-border-default flex items-center justify-center shrink-0 shadow-xs"
            >
              {visuals.icon}
            </motion.div>
          </AnimatePresence>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary tracking-tight">{title}</h3>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-300 bg-brand-500/15 px-1.5 py-0.5 rounded border border-brand-500/30">
                Soroban v2.1
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">{visuals.statusLabel}</p>
          </div>
        </div>

        <Badge variant={visuals.badgeVariant} size="md" className="self-start sm:self-auto font-sans">
          {escrowStatus.replace("_", " ")}
        </Badge>
      </div>

      {/* Center: Financial Vault breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-0/80 border border-border-subtle">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Locked Amount
          </span>
          <p className="text-lg font-bold font-mono text-text-primary">
            {formatCurrency(lockedAmountXlm, assetCode)}
          </p>
          <span className="text-[11px] text-text-tertiary flex items-center gap-1">
            <Shield size={11} className="text-brand-400" />
            Level 4 Secured
          </span>
        </div>

        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-2 sm:pt-0 sm:pl-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Contract ID
          </span>
          <p className="text-xs font-mono text-text-secondary truncate mt-1">
            {truncateAddress(contractAddress, 8, 6)}
          </p>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            Stellar Expert <ExternalLink size={10} />
          </a>
        </div>

        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-2 sm:pt-0 sm:pl-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Timelock Security
          </span>
          <p className="text-xs font-semibold text-text-primary mt-1 flex items-center gap-1.5">
            <Cpu size={13} className="text-status-success" />
            Hardware Enforced
          </p>
          <span className="text-[11px] text-text-tertiary">2-of-3 Arbiter Multisig</span>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-text-tertiary">
        <div className="flex items-center gap-2">
          <KeyRound size={14} className="text-text-disabled" />
          <span>
            {fundedAt
              ? `Funded on ${new Date(fundedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : "Awaiting client funding"}
          </span>
        </div>

        {onVerify && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVerify(contractAddress)}
            className="text-xs h-8"
          >
            Verify On-Chain Proof
          </Button>
        )}
      </div>
    </motion.div>
  );
}
