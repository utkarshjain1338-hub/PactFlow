"use client";

/**
 * PactFlow — Reusable Button Component
 * Variants: primary, secondary, ghost, danger, outline, link
 * Sizes: sm, md, lg
 * States: loading, disabled, icon-only
 */
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── CVA variant definitions ──
const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium rounded-lg",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "select-none relative overflow-hidden",
    "border border-transparent",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-brand-500 text-white",
          "hover:bg-brand-600 hover:shadow-brand",
          "active:scale-[0.98]",
          "shimmer",
        ],
        secondary: [
          "bg-surface-2 text-text-primary border-border-default",
          "hover:bg-surface-3 hover:border-border-strong",
          "active:scale-[0.98]",
        ],
        ghost: [
          "bg-transparent text-text-secondary",
          "hover:bg-surface-2 hover:text-text-primary",
          "active:scale-[0.98]",
        ],
        outline: [
          "bg-transparent text-brand-400 border-brand-500/40",
          "hover:bg-brand-500/10 hover:border-brand-500/60",
          "active:scale-[0.98]",
        ],
        danger: [
          "bg-red-600/20 text-red-400 border-red-500/30",
          "hover:bg-red-600/30 hover:border-red-500/50",
          "active:scale-[0.98]",
        ],
        accent: [
          "bg-accent-400 text-surface-0",
          "hover:bg-accent-500 hover:shadow-accent",
          "active:scale-[0.98]",
          "shimmer",
        ],
        link: [
          "bg-transparent text-brand-400 underline-offset-4",
          "hover:underline hover:text-brand-300",
          "h-auto p-0",
        ],
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-md",
        "icon-lg": "h-12 w-12 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// ── Component Props ──
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show loading spinner */
  isLoading?: boolean;
  /** Icon to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right */
  rightIcon?: React.ReactNode;
  /** Animate on mount */
  animate?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      animate = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const button = (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2
            className="animate-spin shrink-0"
            size={size === "sm" || size === "xs" ? 14 : 16}
            aria-hidden
          />
        )}

        {/* Left icon (hidden while loading) */}
        {!isLoading && leftIcon && (
          <span className="shrink-0" aria-hidden>
            {leftIcon}
          </span>
        )}

        {/* Content */}
        {children && (
          <span className={cn(size === "icon" || size === "icon-sm" || size === "icon-lg" ? "sr-only" : "")}>
            {children}
          </span>
        )}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden>
            {rightIcon}
          </span>
        )}
      </button>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "inline-flex" }}
        >
          {button}
        </motion.div>
      );
    }

    return button;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
