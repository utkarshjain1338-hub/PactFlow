"use client";

/**
 * PactFlow — Empty State Component
 * Shown when no data exists for a particular view
 */
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Decorative illustration variant */
  illustration?: "default" | "search" | "error" | "locked";
}

// Inline SVG illustrations (no external dependency)
function ConstellationIllustration({ variant = "default" }: { variant?: string }) {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      aria-hidden="true"
      className="opacity-60"
    >
      {/* Background dots */}
      {[...Array(12)].map((_, i) => (
        <circle
          key={i}
          cx={20 + (i % 6) * 24}
          cy={20 + Math.floor(i / 6) * 60}
          r="1.5"
          fill="hsl(240, 84%, 60%)"
          opacity="0.3"
        />
      ))}

      {variant === "default" && (
        <>
          {/* Large hollow circle */}
          <circle cx="80" cy="60" r="32" stroke="hsl(240, 84%, 60%)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          {/* Orbit nodes */}
          <circle cx="80" cy="28" r="4" fill="hsl(240, 84%, 60%)" opacity="0.6" />
          <circle cx="112" cy="60" r="3" fill="hsl(158, 64%, 52%)" opacity="0.6" />
          <circle cx="80" cy="92" r="4" fill="hsl(240, 84%, 60%)" opacity="0.6" />
          <circle cx="48" cy="60" r="3" fill="hsl(158, 64%, 52%)" opacity="0.6" />
          {/* Center */}
          <circle cx="80" cy="60" r="10" fill="hsl(240, 84%, 60%)" opacity="0.08" />
          <circle cx="80" cy="60" r="5" fill="hsl(240, 84%, 60%)" opacity="0.25" />
          <circle cx="80" cy="60" r="2" fill="hsl(240, 84%, 60%)" opacity="0.7" />
          {/* Connector lines */}
          <line x1="80" y1="28" x2="112" y2="60" stroke="hsl(240, 84%, 60%)" strokeWidth="0.5" opacity="0.3" />
          <line x1="112" y1="60" x2="80" y2="92" stroke="hsl(240, 84%, 60%)" strokeWidth="0.5" opacity="0.3" />
          <line x1="80" y1="92" x2="48" y2="60" stroke="hsl(240, 84%, 60%)" strokeWidth="0.5" opacity="0.3" />
          <line x1="48" y1="60" x2="80" y2="28" stroke="hsl(240, 84%, 60%)" strokeWidth="0.5" opacity="0.3" />
        </>
      )}

      {variant === "search" && (
        <>
          <circle cx="72" cy="56" r="26" stroke="hsl(215, 20%, 65%)" strokeWidth="1.5" opacity="0.4" />
          <line x1="91" y1="75" x2="108" y2="92" stroke="hsl(215, 20%, 65%)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <circle cx="72" cy="56" r="16" stroke="hsl(240, 84%, 60%)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        </>
      )}

      {variant === "locked" && (
        <>
          <rect x="62" y="58" width="36" height="28" rx="4" stroke="hsl(240, 84%, 60%)" strokeWidth="1.5" opacity="0.5" fill="none" />
          <path d="M 70 58 V 50 A 10 10 0 0 1 90 50 V 58" stroke="hsl(240, 84%, 60%)" strokeWidth="1.5" fill="none" opacity="0.5" />
          <circle cx="80" cy="72" r="4" fill="hsl(240, 84%, 60%)" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
  illustration = "default",
}: EmptyStateProps) {
  const sizeConfig = {
    sm: { wrapper: "py-8", title: "text-sm", desc: "text-xs", iconBox: "w-10 h-10" },
    md: { wrapper: "py-12", title: "text-base", desc: "text-sm", iconBox: "w-12 h-12" },
    lg: { wrapper: "py-16", title: "text-lg", desc: "text-base", iconBox: "w-16 h-16" },
  }[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeConfig.wrapper,
        "px-6",
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Illustration or Icon */}
      {icon ? (
        <div
          className={cn(
            sizeConfig.iconBox,
            "flex items-center justify-center",
            "bg-surface-2 border border-border-default rounded-2xl",
            "text-text-tertiary mb-5",
          )}
        >
          {icon}
        </div>
      ) : (
        <div className="mb-5">
          <ConstellationIllustration variant={illustration} />
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          sizeConfig.title,
          "font-semibold text-text-primary mb-2"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            sizeConfig.desc,
            "text-text-tertiary leading-relaxed max-w-xs"
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </motion.div>
  );
}
