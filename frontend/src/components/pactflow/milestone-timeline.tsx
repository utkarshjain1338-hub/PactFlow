"use client";

/**
 * PactFlow — Domain UI Components
 * Milestone Timeline (`MilestoneTimeline`)
 *
 * Chronological milestone chain displaying sequence items (#1, #2, #3...),
 * status badges, deliverable verification links, and role-sensitive action triggers.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Milestone as MilestoneIcon,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Lock,
} from "lucide-react";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import { MilestoneStatusBadge } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Milestone, type MilestoneStatus } from "@/types/domain";

export interface MilestoneTimelineProps {
  milestones: Milestone[];
  /** Active user role ("COMPANY" | "FREELANCER" | "ADMIN") */
  userRole?: string | null;
  /** Callback when user clicks Fund, Submit, or Release */
  onAction?: (milestoneId: string, actionType: "FUND" | "SUBMIT" | "RELEASE") => void;
  className?: string;
}

export function MilestoneTimeline({
  milestones,
  userRole = "COMPANY",
  onAction,
  className,
}: MilestoneTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    milestones.find((m) => m.status === "IN_PROGRESS" || m.status === "SUBMITTED")?.id ??
      milestones[0]?.id ??
      null
  );

  const sortedMilestones = [...milestones].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  return (
    <div className={cn("space-y-4 select-none", className)} role="region" aria-label="Milestone Timeline">
      {sortedMilestones.map((milestone, idx) => {
        const isLast = idx === sortedMilestones.length - 1;
        const isExpanded = expandedId === milestone.id;
        const { id, title, description, amountXlm, assetCode, status, sequenceOrder, dueDate, deliverables } =
          milestone;

        return (
          <div key={id} className="relative flex gap-4 sm:gap-6">
            {/* Left Vertical Step Indicator & Connecting Thread */}
            <div className="flex flex-col items-center">
              <motion.button
                onClick={() => setExpandedId(isExpanded ? null : id)}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs z-10 transition-colors shadow-xs",
                  status === "PAID"
                    ? "bg-status-success text-primary-foreground"
                    : status === "SUBMITTED"
                      ? "bg-brand-500 text-primary-foreground"
                      : status === "FUNDED" || status === "IN_PROGRESS"
                        ? "bg-brand-500/20 border border-brand-500/50 text-brand-300"
                        : "bg-surface-2 border border-border-default text-text-tertiary"
                )}
                aria-label={`Toggle details for Milestone #${sequenceOrder}: ${title}`}
                aria-expanded={isExpanded}
              >
                {status === "PAID" ? <CheckCircle2 size={16} /> : `#${sequenceOrder}`}
              </motion.button>

              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 my-1 transition-colors duration-200",
                    status === "PAID" ? "bg-status-success/50" : "bg-border-subtle"
                  )}
                />
              )}
            </div>

            {/* Right Card Body */}
            <motion.div
              layout
              className={cn(
                "flex-1 rounded-2xl border transition-all duration-200 p-4 sm:p-5 mb-2",
                "bg-surface-1/95 backdrop-blur-md",
                isExpanded
                  ? "border-brand-500/40 shadow-brand-xs"
                  : "border-border-subtle hover:border-border-default"
              )}
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-sm font-bold text-text-primary tracking-tight truncate">
                      {title}
                    </h4>
                    <MilestoneStatusBadge status={status} />
                  </div>
                  {dueDate && (
                    <p className="text-[11px] text-text-tertiary flex items-center gap-1.5">
                      <Clock size={12} className="text-brand-400" />
                      Due: {formatDateShort(dueDate)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-sm font-bold font-mono text-text-primary">
                    {formatCurrency(amountXlm, assetCode)}
                  </span>
                  <button
                    className="p-1 rounded-lg text-text-tertiary hover:text-text-primary transition-colors"
                    aria-label={isExpanded ? "Collapse milestone" : "Expand milestone"}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expandable Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden pt-4 mt-4 border-t border-border-subtle space-y-4"
                  >
                    {description && (
                      <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
                    )}

                    {/* Deliverables Section */}
                    {deliverables && deliverables.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                          Submitted Deliverables ({deliverables.length})
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {deliverables.map((d) => (
                            <a
                              key={d.id}
                              href={d.deliveryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-surface-0 border border-border-subtle hover:border-brand-500/40 text-xs transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText size={15} className="text-brand-400 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-text-primary truncate group-hover:text-brand-300">
                                    {d.title}
                                  </p>
                                  <p className="text-[10px] text-text-tertiary truncate">{d.deliveryUrl}</p>
                                </div>
                              </div>
                              <ExternalLink size={13} className="text-text-tertiary group-hover:text-brand-300 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-surface-0 border border-border-subtle text-center">
                        <p className="text-xs text-text-tertiary">No deliverables submitted yet.</p>
                      </div>
                    )}

                    {/* Role-aware Action Row */}
                    {onAction && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        {status === "DRAFT" && userRole === "COMPANY" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction(id, "FUND");
                            }}
                            className="text-xs h-8"
                          >
                            <Lock size={13} className="mr-1.5" />
                            Fund Milestone in Escrow
                          </Button>
                        )}

                        {(status === "FUNDED" || status === "IN_PROGRESS") && userRole === "FREELANCER" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction(id, "SUBMIT");
                            }}
                            className="text-xs h-8"
                          >
                            <Send size={13} className="mr-1.5" />
                            Submit Work Deliverables
                          </Button>
                        )}

                        {status === "SUBMITTED" && userRole === "COMPANY" && (
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction(id, "RELEASE");
                            }}
                            className="text-xs h-8 bg-status-success hover:bg-status-success/90 text-primary-foreground"
                          >
                            <DollarSign size={13} className="mr-1.5" />
                            Verify &amp; Release Payment
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
