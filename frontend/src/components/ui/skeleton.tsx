/**
 * PactFlow — Skeleton Loader Components
 * Accessible loading placeholders matching layout of real content
 */
import React from "react";
import { cn } from "@/lib/utils";

// ── Base Skeleton ──
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Override default height */
  height?: string | number;
  /** Override default width */
  width?: string | number;
  /** Make it circular */
  circle?: boolean;
}

function Skeleton({ className, height, width, circle = false, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
      style={{
        height,
        width,
        ...style,
      }}
      aria-hidden="true"
      role="presentation"
      {...props}
    />
  );
}

// ── Text skeleton ──
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? `${60 + Math.random() * 20}%` : "100%"}
        />
      ))}
    </div>
  );
}

// ── Avatar skeleton ──
function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton circle height={size} width={size} />;
}

// ── Card skeleton ──
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-surface-1 p-6 space-y-4",
        className
      )}
      aria-busy="true"
      aria-label="Loading..."
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar size={36} />
        <div className="space-y-2 flex-1">
          <Skeleton height={14} width="40%" />
          <Skeleton height={12} width="60%" />
        </div>
        <Skeleton height={24} width={70} className="rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <Skeleton height={12} width="30%" />
        <Skeleton height={32} width={90} />
      </div>
    </div>
  );
}

// ── Stat card skeleton ──
function SkeletonStat({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-xl border border-border-subtle bg-surface-1 p-6", className)}
      aria-busy="true"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton height={12} width="50%" />
          <Skeleton height={32} width="70%" />
          <Skeleton height={12} width="40%" />
        </div>
        <Skeleton height={44} width={44} className="rounded-lg" />
      </div>
    </div>
  );
}

// ── Table row skeleton ──
function SkeletonTableRow({ cols = 5, className }: { cols?: number; className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-4 py-3 border-b border-border-subtle", className)}
      aria-hidden
    >
      <SkeletonAvatar size={32} />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Skeleton key={i} height={14} className="flex-1" />
      ))}
    </div>
  );
}

// ── Milestone list skeleton ──
function SkeletonMilestoneList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading milestones...">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface-1 border border-border-subtle">
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
            <Skeleton height={14} width={14} circle />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton height={14} width="55%" />
            <Skeleton height={12} width="35%" />
          </div>
          <Skeleton height={24} width={80} className="rounded-full" />
          <Skeleton height={32} width={70} />
        </div>
      ))}
    </div>
  );
}

// ── Page header skeleton ──
function SkeletonPageHeader() {
  return (
    <div className="space-y-3 mb-8" aria-hidden>
      <Skeleton height={12} width={200} />
      <Skeleton height={36} width="50%" />
      <Skeleton height={16} width="35%" />
    </div>
  );
}

// ── Dashboard skeleton ──
function SkeletonDashboard() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard...">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton height={24} width={160} />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton height={24} width={140} />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonStat,
  SkeletonTableRow,
  SkeletonMilestoneList,
  SkeletonPageHeader,
  SkeletonDashboard,
};
