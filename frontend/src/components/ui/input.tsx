/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Input Component
 *
 * Requirements: Reusable, Accessible (WCAG 2.1 AA), Responsive, Dark Mode first.
 * Features: Left/Right icons, Prefix/Suffix addons, Error states, Helper text, Polymorphic sizing.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "flex w-full rounded-lg bg-surface-1 text-text-primary text-sm",
    "border border-border-default transition-all duration-200 ease-out",
    "placeholder:text-text-disabled",
    "focus-visible:outline-none focus-visible:border-border-brand focus-visible:ring-2 focus-visible:ring-brand-500/20",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-0",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-3.5 text-sm",
        lg: "h-12 px-4 text-base",
      },
      status: {
        default: "border-border-default",
        error: "border-status-error focus-visible:border-status-error focus-visible:ring-status-error/20",
        success: "border-status-success focus-visible:border-status-success focus-visible:ring-status-success/20",
      },
    },
    defaultVariants: {
      size: "md",
      status: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Optional icon displayed on the left inside the input */
  leftIcon?: React.ReactNode;
  /** Optional icon displayed on the right inside the input */
  rightIcon?: React.ReactNode;
  /** Optional prefix text inside the left edge of the input */
  prefix?: string;
  /** Optional suffix text inside the right edge of the input */
  suffix?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error text displayed below the input (overrides helperText and sets status="error") */
  errorText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      size,
      status,
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      helperText,
      errorText,
      disabled,
      ...props
    },
    ref
  ) => {
    const computedStatus = errorText ? "error" : status;
    const hasLeftElement = Boolean(leftIcon || prefix);
    const hasRightElement = Boolean(rightIcon || suffix);

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="relative flex items-center w-full">
          {hasLeftElement && (
            <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none text-text-tertiary select-none">
              {leftIcon && <span className="flex-shrink-0 text-base">{leftIcon}</span>}
              {prefix && <span className="text-xs font-medium text-text-secondary">{prefix}</span>}
            </div>
          )}

          <input
            type={type}
            className={cn(
              inputVariants({ size, status: computedStatus }),
              hasLeftElement && (size === "lg" ? "pl-11" : "pl-9"),
              hasRightElement && (size === "lg" ? "pr-11" : "pr-9"),
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={computedStatus === "error"}
            {...props}
          />

          {hasRightElement && (
            <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none text-text-tertiary select-none">
              {suffix && <span className="text-xs font-medium text-text-secondary">{suffix}</span>}
              {rightIcon && <span className="flex-shrink-0 text-base">{rightIcon}</span>}
            </div>
          )}
        </div>

        {errorText && (
          <p className="text-xs font-medium text-status-error flex items-center gap-1.5 animate-fade-in" role="alert">
            <span>{errorText}</span>
          </p>
        )}
        {!errorText && helperText && (
          <p className="text-xs text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
