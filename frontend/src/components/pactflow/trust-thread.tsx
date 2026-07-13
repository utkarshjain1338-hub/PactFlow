"use client";

/**
 * PactFlow — Domain UI Components
 * Trust Thread (`TrustThread`)
 *
 * Visual connection line connecting two or more Trust Nodes or Milestones
 * representing cryptographic binding and on-chain escrow state transitions.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ShieldAlert, ArrowDown, ArrowRight, Zap } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export type TrustThreadState =
  | "IDLE"
  | "ACTIVE"
  | "LOCKED"
  | "RELEASED"
  | "BROKEN";

export interface TrustThreadProps {
  state: TrustThreadState;
  orientation?: "vertical" | "horizontal";
  label?: string;
  amountXlm?: string | number;
  className?: string;
}

export function TrustThread({
  state,
  orientation = "vertical",
  label,
  amountXlm,
  className,
}: TrustThreadProps) {
  // Map state to thread visual styling
  const getThreadColor = () => {
    switch (state) {
      case "LOCKED":
        return "bg-brand-500 border-brand-400 text-brand-300";
      case "RELEASED":
        return "bg-status-success border-status-success text-status-success";
      case "ACTIVE":
        return "bg-brand-400/80 border-brand-400 text-brand-200";
      case "BROKEN":
        return "bg-status-error border-status-error text-status-error";
      case "IDLE":
      default:
        return "bg-surface-3 border-border-default text-text-tertiary";
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case "LOCKED":
        return <Lock size={12} className="text-brand-300" />;
      case "RELEASED":
        return <Unlock size={12} className="text-status-success" />;
      case "BROKEN":
        return <ShieldAlert size={12} className="text-status-error" />;
      case "ACTIVE":
        return <Zap size={12} className="text-brand-300" />;
      default:
        return null;
    }
  };

  if (orientation === "horizontal") {
    return (
      <div
        className={cn(
          "flex items-center justify-center relative py-2 px-4 min-w-[120px] select-none",
          className
        )}
        role="separator"
        aria-label={`Trust Thread: ${state}`}
      >
        {/* Horizontal Line */}
        <motion.div
          layout
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "h-0.5 w-full rounded-full transition-colors duration-200",
            getThreadColor().split(" ")[0]
          )}
        />

        {/* Center Pill */}
        {(label || amountXlm !== undefined || getStateIcon()) && (
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute px-2.5 py-1 rounded-full text-[10px] font-semibold border shadow-sm",
                "bg-surface-1/95 backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap",
                getThreadColor()
              )}
            >
              {getStateIcon()}
              {label && <span>{label}</span>}
              {amountXlm !== undefined && (
                <span className="font-mono">{formatCurrency(amountXlm, "XLM")}</span>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        <ArrowRight size={14} className={cn("shrink-0 -ml-1 transition-colors", getThreadColor().split(" ")[2])} />
      </div>
    );
  }

  // Vertical Orientation (default for milestone chains)
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center relative my-1 min-h-[48px] w-full select-none",
        className
      )}
      role="separator"
      aria-label={`Trust Thread: ${state}`}
    >
      {/* Vertical Line */}
      <motion.div
        layout
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "w-0.5 h-full min-h-[32px] rounded-full transition-colors duration-200",
          getThreadColor().split(" ")[0]
        )}
      />

      {/* Center Pill */}
      {(label || amountXlm !== undefined || getStateIcon()) && (
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute px-2.5 py-1 rounded-full text-[10px] font-semibold border shadow-sm",
              "bg-surface-1/95 backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap",
              getThreadColor()
            )}
          >
            {getStateIcon()}
            {label && <span>{label}</span>}
            {amountXlm !== undefined && (
              <span className="font-mono">{formatCurrency(amountXlm, "XLM")}</span>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <ArrowDown size={14} className={cn("shrink-0 -mt-1 transition-colors", getThreadColor().split(" ")[2])} />
    </div>
  );
}
