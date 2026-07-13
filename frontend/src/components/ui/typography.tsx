"use client";

/**
 * PactFlow — Typography Component System
 * Semantic text components with design-token driven styles
 */
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────
// HEADING
// ─────────────────────────────────────────
const headingVariants = cva("font-semibold tracking-tight text-text-primary", {
  variants: {
    size: {
      h1: "text-4xl md:text-5xl leading-tight",
      h2: "text-3xl md:text-4xl leading-tight",
      h3: "text-2xl md:text-3xl leading-snug",
      h4: "text-xl md:text-2xl leading-snug",
      h5: "text-lg md:text-xl leading-normal",
      h6: "text-base md:text-lg leading-normal",
    },
    gradient: {
      none: "",
      brand: "gradient-text",
      warm: "gradient-text-warm",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: { size: "h2", gradient: "none", weight: "semibold" },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as, size = "h2", gradient, weight, children, ...props }, ref) => {
    const Tag = as ?? (size as HeadingTag) ?? "h2";
    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ size, gradient, weight }), className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Heading.displayName = "Heading";

// ─────────────────────────────────────────
// TEXT
// ─────────────────────────────────────────
const textVariants = cva("", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    color: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      tertiary: "text-text-tertiary",
      disabled: "text-text-disabled",
      brand: "text-brand-400",
      accent: "text-accent-400",
      error: "text-red-400",
      warning: "text-yellow-400",
      success: "text-accent-400",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    leading: {
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
    },
  },
  defaultVariants: {
    size: "base",
    color: "secondary",
    weight: "normal",
    leading: "normal",
  },
});

interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label" | "small";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, as = "p", size, color, weight, leading, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Tag = as as any;
    return (
      <Tag
        ref={ref}
        className={cn(textVariants({ size, color, weight, leading }), className)}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

// ─────────────────────────────────────────
// CODE BLOCK
// ─────────────────────────────────────────
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
}

function Code({ className, inline = false, children, ...props }: CodeProps) {
  if (inline) {
    return (
      <code
        className={cn(
          "font-mono text-sm text-brand-300",
          "bg-brand-500/10 border border-brand-500/20",
          "px-1.5 py-0.5 rounded",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }
  return (
    <pre
      className={cn(
        "font-mono text-sm text-text-secondary",
        "bg-surface-2 border border-border-default",
        "px-4 py-3 rounded-lg overflow-x-auto",
        "scrollbar-hide",
        className
      )}
      {...props}
    >
      <code>{children}</code>
    </pre>
  );
}

// ─────────────────────────────────────────
// LABEL
// ─────────────────────────────────────────
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium text-text-primary", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-400 ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

// ─────────────────────────────────────────
// BADGE / STATUS CHIP
// ─────────────────────────────────────────
const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-text-secondary border-border-default",
        brand: "bg-brand-500/15 text-brand-300 border-brand-500/30",
        success: "bg-accent-400/15 text-accent-400 border-accent-400/30",
        warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        error: "bg-red-500/15 text-red-400 border-red-500/30",
        info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "success" ? "bg-accent-400" :
            variant === "warning" ? "bg-yellow-400" :
            variant === "error" ? "bg-red-400" :
            variant === "brand" ? "bg-brand-400" :
            variant === "info" ? "bg-blue-400" :
            variant === "purple" ? "bg-purple-400" :
            "bg-text-tertiary"
          )}
        />
      )}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────
// MILESTONE STATUS BADGE
// ─────────────────────────────────────────
import type { MilestoneStatus, ProjectStatus } from "@/types/domain";

const milestoneStatusConfig: Record<
  MilestoneStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  DRAFT: { label: "Draft", variant: "default" },
  FUNDED: { label: "Funded", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "warning" },
  SUBMITTED: { label: "Submitted", variant: "purple" },
  PAID: { label: "Paid", variant: "success" },
  REFUNDED: { label: "Refunded", variant: "error" },
};

function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const config = milestoneStatusConfig[status];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

const projectStatusConfig: Record<
  ProjectStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  DRAFT: { label: "Draft", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "error" },
};

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = projectStatusConfig[status];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

export {
  Heading,
  Text,
  Code,
  Label,
  Badge,
  MilestoneStatusBadge,
  ProjectStatusBadge,
  headingVariants,
  textVariants,
  badgeVariants,
};
