/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Spinner Component
 *
 * Requirements: Reusable, Accessible (aria status + label), Responsive, Dark Mode first.
 * Features: Multi-size scale, color variants, clean SVG animation.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin shrink-0", {
  variants: {
    size: {
      xs: "h-3.5 w-3.5",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
      "2xl": "h-10 w-10",
    },
    variant: {
      brand: "text-brand-400",
      accent: "text-accent-400",
      muted: "text-text-tertiary",
      white: "text-primary-foreground",
      current: "text-current",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "brand",
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Optional accessible screen-reader label */
  label?: string;
  /** Show accompanying loading text next to the spinner */
  showText?: boolean;
  /** Custom text to show alongside spinner */
  text?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label = "Loading...", showText = false, text = "Loading...", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn("inline-flex items-center gap-2 select-none", className)}
        {...props}
      >
        <Loader2 className={cn(spinnerVariants({ size, variant }))} aria-hidden="true" />
        {showText && (
          <span className="text-xs font-medium text-text-secondary animate-pulse">
            {text}
          </span>
        )}
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
