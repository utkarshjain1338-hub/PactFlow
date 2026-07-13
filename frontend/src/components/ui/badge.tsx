/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Badge Component
 *
 * Requirements: Reusable, Accessible, Responsive, Dark Mode first.
 * Features: Domain status indicator dots, comprehensive cva color variants.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none whitespace-nowrap",
    "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-text-primary border border-border-default",
        brand: "bg-brand-500/15 text-brand-300 border border-brand-500/30",
        secondary: "bg-surface-1 text-text-secondary border border-border-subtle",
        outline: "text-text-primary border border-border-strong bg-transparent",
        destructive: "bg-status-error-bg text-status-error border border-status-error-border",
        error: "bg-status-error-bg text-status-error border border-status-error-border",
        success: "bg-status-success-bg text-status-success border border-status-success-border",
        warning: "bg-status-warning-bg text-status-warning border border-status-warning-border",
        info: "bg-status-info-bg text-status-info border border-status-info-border",
        purple: "bg-purple-950/40 text-purple-300 border border-purple-500/30",
        // Domain Milestone status mappings
        draft: "bg-surface-1 text-ms-draft border border-border-default",
        funded: "bg-status-info-bg text-ms-funded border border-status-info-border",
        "in-progress": "bg-status-warning-bg text-ms-in-progress border border-status-warning-border",
        submitted: "bg-purple-950/40 text-ms-submitted border border-purple-500/30",
        paid: "bg-status-success-bg text-ms-paid border border-status-success-border",
        refunded: "bg-status-error-bg text-ms-refunded border border-status-error-border",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] tracking-wide uppercase",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Show a status indicator dot on the left of the badge */
  showDot?: boolean;
  /** Optional custom dot color class or inline style */
  dotColorClass?: string;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, showDot, dotColorClass, children, ...props }, ref) => {
    // Map variant to a dot color when showDot is requested without a custom color class
    const getDotBg = () => {
      if (dotColorClass) return dotColorClass;
      switch (variant) {
        case "success":
        case "paid":
          return "bg-status-success animate-pulse";
        case "warning":
        case "in-progress":
          return "bg-status-warning";
        case "destructive":
        case "refunded":
          return "bg-status-error";
        case "info":
        case "funded":
          return "bg-status-info";
        case "brand":
        case "submitted":
          return "bg-brand-400";
        default:
          return "bg-text-secondary";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {showDot && (
          <span
            className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", getDotBg())}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
