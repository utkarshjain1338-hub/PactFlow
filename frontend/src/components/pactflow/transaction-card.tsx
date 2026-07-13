"use client";

/**
 * PactFlow — Domain UI Components
 * Transaction Card (`TransactionCard`)
 *
 * Represents an individual Soroban/Stellar on-chain transaction.
 * Displays cryptographic transaction hash, operation type, ledger block sequence,
 * network fee, and direct Explorer links.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ExternalLink,
  Lock,
  Unlock,
  AlertCircle,
  FileCode2,
  Copy,
  Check,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { cn, truncateAddress, formatCurrency, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type BlockchainTransaction, type TxType } from "@/types/domain";

export interface TransactionCardProps {
  transaction: BlockchainTransaction;
  className?: string;
}

export function TransactionCard({ transaction, className }: TransactionCardProps) {
  const [copied, setCopied] = useState(false);
  const {
    id,
    txHash,
    txType,
    network,
    amountXlm,
    assetCode,
    networkFeeXlm,
    ledgerSequence,
    milestone,
    project,
    confirmedAt,
  } = transaction;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTxConfig = () => {
    switch (txType) {
      case "ESCROW_FUND":
        return {
          label: "Escrow Funded On-Chain",
          variant: "brand" as const,
          icon: <Lock size={16} className="text-brand-300" />,
          bg: "bg-brand-500/5 border-brand-500/30",
        };
      case "PAYMENT_RELEASE":
        return {
          label: "Payment Released",
          variant: "success" as const,
          icon: <Unlock size={16} className="text-status-success" />,
          bg: "bg-status-success/5 border-status-success/30",
        };
      case "REFUND":
        return {
          label: "Escrow Refunded",
          variant: "warning" as const,
          icon: <AlertCircle size={16} className="text-status-warning" />,
          bg: "bg-status-warning/5 border-status-warning/30",
        };
      case "CONTRACT_DEPLOY":
      default:
        return {
          label: "Soroban Contract Deployed",
          variant: "secondary" as const,
          icon: <FileCode2 size={16} className="text-purple-400" />,
          bg: "bg-surface-2 border-border-default",
        };
    }
  };

  const config = getTxConfig();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-all duration-200 select-none",
        "bg-surface-1/95 backdrop-blur-md hover:border-border-default flex flex-col gap-4",
        config.bg,
        className
      )}
      role="article"
      aria-label={`Transaction Card: ${config.label}`}
    >
      {/* Top Header: Operation Type & Amount */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-surface-0 border border-border-subtle shadow-xs shrink-0">
            {config.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-text-primary truncate">
                {config.label}
              </span>
              <Badge variant={config.variant} size="sm" className="font-sans">
                {txType.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-[11px] font-mono text-text-tertiary mt-0.5 flex items-center gap-1.5">
              <Clock size={11} />
              Confirmed {timeAgo(confirmedAt)}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-base font-bold font-mono text-text-primary">
            {formatCurrency(amountXlm, assetCode)}
          </span>
          <span className="text-[10px] font-mono text-text-tertiary block">
            Fee: {networkFeeXlm} XLM
          </span>
        </div>
      </div>

      {/* Middle Hash & Block Sequence Box */}
      <div className="p-3 rounded-xl bg-surface-0/80 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary shrink-0">
            Tx Hash:
          </span>
          <span className="font-mono text-text-secondary font-medium truncate min-w-0">
            {truncateAddress(txHash, 14, 12)}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle">
          <span className="text-[11px] font-mono text-text-tertiary flex items-center gap-1">
            <Cpu size={12} className="text-brand-400" />
            Ledger #{ledgerSequence}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyHash}
              className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors"
              title="Copy Transaction Hash"
              aria-label="Copy transaction hash"
            >
              {copied ? <Check size={13} className="text-status-success" /> : <Copy size={13} />}
            </button>
            <a
              href={`https://stellar.expert/explorer/${network.toLowerCase()}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors"
              title="View on Stellar Expert Explorer"
              aria-label="View on Stellar Expert Explorer"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Context: Project / Milestone Links */}
      {(project || milestone) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-tertiary">
          <div className="flex items-center gap-2">
            <span>Project:</span>
            <span className="font-semibold text-text-secondary truncate max-w-[180px]">
              {project.title}
            </span>
            {milestone && (
              <>
                <span>•</span>
                <span>Milestone:</span>
                <span className="font-semibold text-brand-300 truncate max-w-[180px]">
                  {milestone.title}
                </span>
              </>
            )}
          </div>

          <span className="text-[10px] font-mono text-status-success flex items-center gap-1">
            <CheckCircle2 size={11} />
            Finalized ({network})
          </span>
        </div>
      )}
    </motion.div>
  );
}
