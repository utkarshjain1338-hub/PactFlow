"use client";

/**
 * PactFlow — Domain UI Components
 * Analytics Card (`AnalyticsCard`)
 *
 * Domain analytics widget tracking financial trust metrics: total volume paid/earned,
 * active escrow locked XLM, milestone velocity, and completion rate.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  FolderKanban,
  Zap,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type UserAnalytics } from "@/types/domain";

export interface AnalyticsCardProps {
  analytics: UserAnalytics;
  /** Optional title override */
  title?: string;
  className?: string;
}

export function AnalyticsCard({
  analytics,
  title = "Financial Trust & Velocity Analytics",
  className,
}: AnalyticsCardProps) {
  const isCompany = analytics.accountType === "COMPANY";
  const { period, summary } = analytics;

  // Extract metrics based on role
  const primaryVolumeXlm = isCompany
    ? (summary as { totalPaidXlm: string }).totalPaidXlm
    : (summary as { totalEarnedXlm: string }).totalEarnedXlm;

  const secondaryVolumeXlm = isCompany
    ? (summary as { totalLockedInEscrowXlm: string }).totalLockedInEscrowXlm
    : null;

  const milestonesCompleted = summary.milestonesCompleted;
  const activeProjects = summary.activeProjects;
  const avgSpeed = !isCompany
    ? (summary as { avgCompletionDays: number }).avgCompletionDays
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border p-5 transition-all duration-200 select-none",
        "bg-surface-1/95 backdrop-blur-xl border-border-subtle hover:border-border-default shadow-xs",
        "flex flex-col gap-5",
        className
      )}
      role="region"
      aria-label={`Analytics Card: ${title}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-300 shrink-0">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight">{title}</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {isCompany ? "Company / Client Expenditure Summary" : "Freelancer Earnings & Reputation Velocity"}
            </p>
          </div>
        </div>

        <Badge variant="secondary" size="sm" className="self-start sm:self-auto font-mono">
          Period: {period.from} → {period.to}
        </Badge>
      </div>

      {/* Primary Financial Volume Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface-0/80 border border-border-subtle">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {isCompany ? "Total Volume Paid Out" : "Total Volume Earned"}
          </span>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold font-mono text-text-primary">
              {formatCurrency(primaryVolumeXlm, "XLM")}
            </p>
            <span className="text-xs font-semibold text-status-success flex items-center gap-0.5">
              <TrendingUp size={12} />
              +14.2%
            </span>
          </div>
        </div>

        {secondaryVolumeXlm && (
          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Locked in Active Escrow
            </span>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold font-mono text-brand-300">
                {formatCurrency(secondaryVolumeXlm, "XLM")}
              </p>
              <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                <Shield size={11} className="text-brand-400" />
                Level 4 Protected
              </span>
            </div>
          </div>
        )}

        {!isCompany && avgSpeed && (
          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Avg Delivery Speed
            </span>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold font-mono text-status-success">
                {avgSpeed} Days
              </p>
              <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                <Clock size={11} />
                Per Milestone
              </span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Grid Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-surface-2/60 border border-border-subtle flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-status-success shrink-0" />
          <div>
            <span className="text-[10px] text-text-tertiary block">Completed Milestones</span>
            <span className="font-bold font-mono text-text-primary text-sm">{milestonesCompleted}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/60 border border-border-subtle flex items-center gap-2.5">
          <FolderKanban size={16} className="text-brand-400 shrink-0" />
          <div>
            <span className="text-[10px] text-text-tertiary block">Active Projects</span>
            <span className="font-bold font-mono text-text-primary text-sm">{activeProjects}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/60 border border-border-subtle flex items-center gap-2.5">
          <Shield size={16} className="text-purple-400 shrink-0" />
          <div>
            <span className="text-[10px] text-text-tertiary block">Security Tier</span>
            <span className="font-bold text-text-primary text-xs">Level 4 Verified</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/60 border border-border-subtle flex items-center gap-2.5">
          <Zap size={16} className="text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-text-tertiary block">Avg Finality</span>
            <span className="font-bold font-mono text-status-success text-xs">1.2s Testnet</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
