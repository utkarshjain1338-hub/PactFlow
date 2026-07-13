"use client";

/**
 * PactFlow — Domain UI Components
 * Activity Timeline (`ActivityTimeline`)
 *
 * Chronological audit feed displaying on-chain and off-chain events
 * (milestone funding, deliverables submitted, payment releases, dispute actions).
 *
 * Requirements:
 * - Animations represent state changes only (no decorative/infinite loops).
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  Milestone as MilestoneIcon,
  Send,
  UserCheck,
  Building2,
  Clock,
} from "lucide-react";
import { cn, timeAgo, getInitials } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type ActivityEvent } from "@/types/domain";

export interface ActivityTimelineProps {
  events: ActivityEvent[];
  className?: string;
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "ESCROW_FUNDED":
      case "MILESTONE_FUNDED":
        return <Lock size={14} className="text-brand-300" />;
      case "PAYMENT_RELEASED":
      case "MILESTONE_PAID":
        return <Unlock size={14} className="text-status-success" />;
      case "MILESTONE_SUBMITTED":
        return <Send size={14} className="text-brand-400" />;
      case "PROJECT_CREATED":
      default:
        return <MilestoneIcon size={14} className="text-purple-400" />;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "ESCROW_FUNDED":
      case "MILESTONE_FUNDED":
        return { label: "Locked On-Chain", variant: "brand" as const };
      case "PAYMENT_RELEASED":
      case "MILESTONE_PAID":
        return { label: "Payment Released", variant: "success" as const };
      case "MILESTONE_SUBMITTED":
        return { label: "Work Submitted", variant: "secondary" as const };
      default:
        return { label: "System Audit", variant: "outline" as const };
    }
  };

  return (
    <div className={cn("space-y-3 select-none", className)} role="feed" aria-label="Activity Audit Timeline">
      <AnimatePresence>
        {events.map((evt, index) => {
          const isLast = index === events.length - 1;
          const badge = getEventBadge(evt.eventType);

          return (
            <motion.div
              key={evt.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative flex gap-3.5 sm:gap-4"
              role="article"
            >
              {/* Left Column: Avatar & Vertical Thread */}
              <div className="flex flex-col items-center">
                <div className="relative z-10">
                  <Avatar
                    size="sm"
                    fallback={getInitials(evt.actor.displayName)}
                    src={evt.actor.avatarUrl ?? undefined}
                    className="border-2 border-surface-1 shadow-xs"
                  />
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-surface-2 border border-border-default shadow-xs">
                    {getEventIcon(evt.eventType)}
                  </div>
                </div>

                {!isLast && <div className="w-0.5 flex-1 my-1 bg-border-subtle" />}
              </div>

              {/* Right Column: Event Content Card */}
              <div className="flex-1 rounded-xl bg-surface-1/90 border border-border-subtle p-3.5 mb-2 space-y-2 hover:border-border-default transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-text-primary">
                      {evt.actor.displayName}
                    </span>
                    <Badge variant={badge.variant} size="sm" className="font-sans">
                      {badge.label}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-text-tertiary font-mono flex items-center gap-1">
                    <Clock size={11} />
                    {timeAgo(evt.occurredAt)}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {evt.summary}
                </p>

                {/* Tags for Project / Milestone Context */}
                {(evt.project || evt.milestone) && (
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-text-tertiary">
                    {evt.project && (
                      <span className="px-2 py-0.5 rounded bg-surface-0 border border-border-subtle truncate max-w-[200px]">
                        📁 {evt.project.title}
                      </span>
                    )}
                    {evt.milestone && (
                      <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 truncate max-w-[200px]">
                        🎯 {evt.milestone.title}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
