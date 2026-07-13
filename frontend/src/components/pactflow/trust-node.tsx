"use client";

/**
 * PactFlow — Domain UI Components
 * Trust Node (`TrustNode`)
 *
 * Represents an entity (Client, Freelancer, Escrow Contract, Arbiter, or Deliverable)
 * inside the Constellation of Trust graph.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 * - production-ready, accessible, dark-mode first.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  UserCheck,
  Building2,
  FileCode2,
  Scale,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn, truncateAddress, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type TrustNodeType =
  | "CLIENT"
  | "FREELANCER"
  | "ESCROW_CONTRACT"
  | "ARBITER"
  | "DELIVERABLE";

export type TrustNodeState =
  | "ACTIVE"
  | "VERIFIED"
  | "PENDING"
  | "LOCKED"
  | "RELEASED"
  | "ERROR";

export interface TrustNodeProps {
  id: string;
  title: string;
  subtitle?: string;
  nodeType: TrustNodeType;
  state: TrustNodeState;
  badgeLabel?: string;
  amountXlm?: string | number;
  className?: string;
  onClick?: () => void;
}

export function TrustNode({
  id,
  title,
  subtitle,
  nodeType,
  state,
  badgeLabel,
  amountXlm,
  className,
  onClick,
}: TrustNodeProps) {
  // Map node type to icon
  const getNodeIcon = () => {
    switch (nodeType) {
      case "CLIENT":
        return <Building2 size={18} className="text-brand-400" />;
      case "FREELANCER":
        return <UserCheck size={18} className="text-brand-300" />;
      case "ESCROW_CONTRACT":
        return state === "RELEASED" ? (
          <Unlock size={18} className="text-status-success" />
        ) : (
          <Lock size={18} className="text-status-warning" />
        );
      case "ARBITER":
        return <Scale size={18} className="text-purple-400" />;
      case "DELIVERABLE":
        return <FileCode2 size={18} className="text-blue-400" />;
    }
  };

  // Map state to border/background accent colors
  const getStateStyle = () => {
    switch (state) {
      case "VERIFIED":
      case "RELEASED":
        return "border-status-success/40 bg-status-success/5 hover:border-status-success/60";
      case "LOCKED":
      case "ACTIVE":
        return "border-brand-500/40 bg-brand-500/5 hover:border-brand-500/60 shadow-brand-xs";
      case "PENDING":
        return "border-status-warning/40 bg-status-warning/5 hover:border-status-warning/60";
      case "ERROR":
        return "border-status-error/40 bg-status-error/5 hover:border-status-error/60";
    }
  };

  const getStateBadgeVariant = () => {
    switch (state) {
      case "VERIFIED":
      case "RELEASED":
        return "success";
      case "LOCKED":
      case "ACTIVE":
        return "brand";
      case "PENDING":
        return "warning";
      case "ERROR":
        return "destructive";
    }
  };

  return (
    <motion.div
      layout
      // State change transition only — no decorative loop animations
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border p-4 transition-all duration-200 select-none",
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3.5",
        "bg-surface-1/90 backdrop-blur-md",
        getStateStyle(),
        onClick && "cursor-pointer active:scale-[0.99]",
        className
      )}
      role={onClick ? "button" : "region"}
      aria-label={`Trust Node: ${title} (${nodeType}, status: ${state})`}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Left Icon and Details */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${nodeType}-${state}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
              "bg-surface-0 border-border-default shadow-xs"
            )}
          >
            {getNodeIcon()}
          </motion.div>
        </AnimatePresence>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-text-primary tracking-tight truncate">
              {title}
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
              {nodeType.replace("_", " ")}
            </span>
          </div>

          {subtitle && (
            <p className="text-[11px] font-mono text-text-secondary truncate flex items-center gap-1">
              <span>{subtitle.startsWith("G") && subtitle.length > 20 ? truncateAddress(subtitle) : subtitle}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right State Indicator and Amount */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
        {amountXlm !== undefined && (
          <div className="text-right">
            <p className="text-xs font-bold font-mono text-text-primary">
              {formatCurrency(amountXlm, "XLM")}
            </p>
            <p className="text-[10px] text-text-tertiary">Secured Value</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <Badge variant={getStateBadgeVariant()} size="sm">
              {badgeLabel ?? state}
            </Badge>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
