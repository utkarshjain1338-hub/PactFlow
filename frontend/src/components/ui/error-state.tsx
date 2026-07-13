"use client";

/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Error State Component
 *
 * Requirements: Reusable, Accessible (WCAG role="alert" + live regions), Responsive, Dark Mode first.
 * Features: Inline / Card / Full variants, Retry action button, Technical details collapsible stack.
 */
import * as React from "react";
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "./button";
import { cn } from "@/lib/utils";

const errorStateVariants = cva(
  "flex flex-col items-center justify-center text-center rounded-xl transition-all select-none",
  {
    variants: {
      variant: {
        card: "bg-surface-1 border border-status-error-border p-6 shadow-md max-w-lg mx-auto",
        inline: "bg-status-error-bg/50 border border-status-error-border/60 p-4 rounded-lg flex-row text-left items-start gap-3 w-full",
        full: "bg-surface-0 border border-border-default p-10 min-h-[360px] max-w-2xl mx-auto w-full",
      },
    },
    defaultVariants: {
      variant: "card",
    },
  }
);

export interface ErrorStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorStateVariants> {
  /** Error title */
  title?: string;
  /** Error description text */
  description?: string;
  /** Optional HTTP or internal error code (e.g. "ERR_SOROBAN_TIMEOUT" or "404") */
  errorCode?: string | number;
  /** Technical error string or stack trace for developers */
  errorDetails?: string;
  /** Callback triggered when user clicks the Retry CTA button */
  onRetry?: () => void;
  /** Custom label for retry button */
  retryLabel?: string;
  /** Custom action buttons */
  actions?: React.ReactNode;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      variant = "card",
      title = "Something went wrong",
      description = "An unexpected error occurred while communicating with the network. Please try again.",
      errorCode,
      errorDetails,
      onRetry,
      retryLabel = "Retry Action",
      actions,
      ...props
    },
    ref
  ) => {
    const [showDetails, setShowDetails] = React.useState(false);

    if (variant === "inline") {
      return (
        <div ref={ref} role="alert" aria-live="assertive" className={cn(errorStateVariants({ variant }), className)} {...props}>
          <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-status-error">{title}</h4>
              {errorCode && (
                <span className="text-[10px] font-mono bg-status-error-bg px-1.5 py-0.5 rounded text-status-error border border-status-error-border">
                  {errorCode}
                </span>
              )}
            </div>
            {description && <p className="mt-1 text-xs text-text-secondary leading-relaxed">{description}</p>}
            {onRetry && (
              <Button
                variant="danger"
                size="xs"
                onClick={onRetry}
                leftIcon={<RefreshCw className="h-3 w-3" />}
                className="mt-3"
              >
                {retryLabel}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} role="alert" aria-live="assertive" className={cn(errorStateVariants({ variant }), className)} {...props}>
        <div className="h-12 w-12 rounded-full bg-status-error-bg border border-status-error-border flex items-center justify-center mb-4 text-status-error shadow-sm">
          <ShieldAlert className="h-6 w-6" />
        </div>

        {errorCode && (
          <span className="mb-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-status-error-bg text-status-error border border-status-error-border uppercase tracking-wider">
            Error {errorCode}
          </span>
        )}

        <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-secondary max-w-md mb-6 leading-relaxed">{description}</p>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {onRetry && (
            <Button
              variant="danger"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              {retryLabel}
            </Button>
          )}
          {actions}
        </div>

        {errorDetails && (
          <div className="mt-6 w-full text-left border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <span>Technical Diagnostics</span>
              {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {showDetails && (
              <pre className="mt-2 p-3 rounded-lg bg-surface-0 border border-border-subtle text-xs font-mono text-status-error overflow-x-auto max-h-48 whitespace-pre-wrap select-text">
                {errorDetails}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }
);

ErrorState.displayName = "ErrorState";

export { ErrorState, errorStateVariants };
