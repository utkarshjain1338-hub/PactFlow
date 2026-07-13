"use client";

/**
 * PactFlow — Domain UI Components
 * Wallet Card (`WalletCard`)
 *
 * Displays connected Stellar / Soroban wallet details, verified cryptographic identity,
 * public address copy button, testnet balance, and simulated Faucet action.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Zap,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { cn, truncateAddress, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type WalletConnection, type WalletProvider } from "@/types/domain";

export interface WalletCardProps {
  wallet?: WalletConnection | null;
  /** Estimated balance in XLM (mocked) */
  balanceXlm?: string | number;
  /** Estimated balance in USD */
  balanceUsd?: string | number;
  /** Callback to trigger wallet connection / disconnection */
  onConnect?: () => void;
  onDisconnect?: () => void;
  /** Callback to trigger mock testnet faucet request */
  onRequestFaucet?: () => void;
  className?: string;
}

export function WalletCard({
  wallet,
  balanceXlm = "1250.0000000",
  balanceUsd = "187.50",
  onConnect,
  onDisconnect,
  onRequestFaucet,
  className,
}: WalletCardProps) {
  const [copied, setCopied] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);

  const handleCopy = () => {
    if (!wallet?.stellarPublicKey) return;
    navigator.clipboard.writeText(wallet.stellarPublicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFaucet = () => {
    if (!onRequestFaucet) return;
    setFaucetLoading(true);
    setTimeout(() => {
      onRequestFaucet();
      setFaucetLoading(false);
    }, 1000);
  };

  if (!wallet) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "rounded-2xl border border-dashed border-border-default p-6 text-center select-none",
          "bg-surface-1/60 backdrop-blur-md flex flex-col items-center justify-center gap-3",
          className
        )}
      >
        <div className="h-12 w-12 rounded-2xl bg-surface-2 border border-border-default flex items-center justify-center text-text-tertiary">
          <Wallet size={24} />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-sm font-bold text-text-primary">Stellar Wallet Disconnected</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Connect your Freighter, xBull, or Rabet wallet to interact with on-chain Soroban escrow contracts.
          </p>
        </div>
        {onConnect && (
          <Button onClick={onConnect} variant="primary" size="sm" className="mt-2 text-xs">
            Connect Stellar Wallet
          </Button>
        )}
      </motion.div>
    );
  }

  const { stellarPublicKey, walletProvider, isPrimary, verifiedAt } = wallet;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border p-5 transition-all duration-200 select-none",
        "bg-surface-1/95 backdrop-blur-xl border-brand-500/30 hover:border-brand-500/50 shadow-xs",
        "flex flex-col justify-between gap-5",
        className
      )}
      role="region"
      aria-label={`Wallet Card: ${walletProvider}`}
    >
      {/* Top Header: Provider & Verified Badge */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-300 shrink-0 font-bold text-xs shadow-xs">
            <Wallet size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-text-primary">{walletProvider}</h4>
              {isPrimary && (
                <Badge variant="brand" size="sm" className="font-sans">
                  Primary
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-text-tertiary flex items-center gap-1 mt-0.5">
              <ShieldCheck size={12} className="text-status-success" />
              Verified On-Chain • {new Date(verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success" />
          </span>
          <span className="text-[11px] font-mono text-status-success font-semibold hidden sm:inline">
            Stellar Testnet
          </span>
        </div>
      </div>

      {/* Center: Address and Copy */}
      <div className="p-3.5 rounded-xl bg-surface-0 border border-border-subtle flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
            Stellar Public Address
          </span>
          <span className="text-xs sm:text-sm font-mono text-text-primary font-bold truncate block mt-0.5">
            {truncateAddress(stellarPublicKey, 10, 8)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors"
            title="Copy Public Address"
            aria-label="Copy public key to clipboard"
          >
            {copied ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${stellarPublicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors"
            title="View on Stellar Expert"
            aria-label="View account on Stellar Expert Explorer"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Balance & Faucet Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
            Testnet Balance
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold font-mono text-text-primary">
              {formatCurrency(balanceXlm, "XLM")}
            </span>
            <span className="text-xs font-mono text-text-tertiary">
              (≈ ${balanceUsd} USD)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRequestFaucet && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFaucet}
              disabled={faucetLoading}
              className="text-xs h-8 border-brand-500/40 text-brand-300 hover:bg-brand-500/10"
            >
              <RefreshCw size={12} className={cn("mr-1.5", faucetLoading && "animate-spin")} />
              Request Testnet XLM
            </Button>
          )}

          {onDisconnect && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDisconnect}
              className="text-xs h-8 text-text-tertiary hover:text-status-error"
            >
              <LogOut size={13} className="mr-1 sm:mr-0" />
              <span className="hidden sm:inline ml-1">Disconnect</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
