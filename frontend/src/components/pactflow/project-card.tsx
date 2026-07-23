"use client";

/**
 * PactFlow — Domain UI Components
 * Project Card (`ProjectCard`)
 *
 * Card representing an escrow project with milestone progress metrics,
 * client/assignee avatars, Level 4 verification tags, and budget tracking.
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Milestone as MilestoneIcon,
} from "lucide-react";
import { cn, formatCurrency, getProgress, formatDateShort, getInitials } from "@/lib/utils";
import { ProjectStatusBadge } from "@/components/ui/typography";
import { Avatar } from "@/components/ui/avatar";
import { type Project } from "@/types/domain";

export interface ProjectCardProps {
  project: Project;
  /** Whether the card is rendered as a clickable link or static summary */
  href?: string;
  className?: string;
}

export function ProjectCard({ project, href, className }: ProjectCardProps) {
  const {
    id,
    title,
    description,
    status,
    totalBudgetXlm,
    assetCode,
    deadline,
  } = project;

  const cardContent = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative rounded-2xl border p-5 transition-all duration-200 select-none",
        "bg-surface-1/90 backdrop-blur-md border-border-subtle hover:border-brand-500/40",
        "flex flex-col justify-between gap-5",
        href && "hover:shadow-brand-xs active:scale-[0.995] cursor-pointer",
        className
      )}
      role="article"
      aria-label={`Project Card: ${title}`}
    >
      {/* Header: Title & Status */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
              <FolderKanban size={16} />
            </div>
            <h3 className="text-base font-bold text-text-primary tracking-tight truncate group-hover:text-brand-300 transition-colors">
              {title}
            </h3>
          </div>
          <ProjectStatusBadge status={status} className="shrink-0 font-sans" />
        </div>

        {description && (
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

        {/* Progress removed for brevity since API doesn't return count yet */}

      {/* Bottom: Budget, Deadline, & Participants */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
              Total Budget
            </span>
            <span className="text-sm font-bold font-mono text-text-primary">
              {formatCurrency(totalBudgetXlm, assetCode)}
            </span>
          </div>

          {deadline && (
            <div className="border-l border-border-subtle pl-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
                Deadline
              </span>
              <span className="text-xs font-medium text-text-secondary flex items-center gap-1 mt-0.5">
                <Clock size={12} className="text-text-tertiary" />
                {formatDateShort(deadline)}
              </span>
            </div>
          )}
        </div>

        {/* Client & Freelancer Avatars */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-semibold text-brand-400 bg-brand-500/15 px-1.5 py-0.5 rounded border border-brand-500/30 flex items-center gap-1">
            <ShieldCheck size={11} />
            Level 4
          </span>
          {href && (
            <ArrowRight
              size={15}
              className="text-text-tertiary group-hover:text-brand-300 group-hover:translate-x-0.5 transition-all ml-1"
            />
          )}
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block">{cardContent}</Link>;
  }

  return cardContent;
}
