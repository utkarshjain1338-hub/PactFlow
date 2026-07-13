"use client";

/**
 * PactFlow — Reusable Card Component
 * Variants: default, elevated, glass, feature, stat
 */
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── CVA variant definitions ──
const cardVariants = cva(
  "rounded-xl border transition-all duration-200",
  {
    variants: {
      variant: {
        default: [
          "bg-surface-1 border-border-subtle",
          "hover:border-border-default hover:shadow-lg",
        ],
        elevated: [
          "bg-surface-2 border-border-default",
          "shadow-md hover:shadow-lg",
        ],
        glass: [
          "glass",
          "hover:border-border-default",
        ],
        feature: [
          "bg-surface-1 border-border-subtle",
          "hover:border-brand-500/30 hover:shadow-brand",
        ],
        stat: [
          "bg-surface-1 border-border-subtle",
          "hover:border-accent-400/30 hover:shadow-accent",
        ],
        outline: [
          "bg-transparent border-border-default",
          "hover:border-border-strong hover:bg-surface-1/50",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

// ── Card Root ──
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Animate card entrance */
  animate?: boolean;
  /** Delay for staggered animations (in seconds) */
  animateDelay?: number;
  /** Make card clickable with hover effect */
  clickable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      animate = false,
      animateDelay = 0,
      clickable = false,
      children,
      ...props
    },
    ref
  ) => {
    const cardEl = (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding }),
          clickable && "cursor-pointer active:scale-[0.99]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: animateDelay,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {cardEl}
        </motion.div>
      );
    }

    return cardEl;
  }
);
Card.displayName = "Card";

// ── Card Header ──
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// ── Card Title ──
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold text-text-primary leading-tight tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ── Card Description ──
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ── Card Content ──
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ── Card Footer ──
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 pt-4 border-t border-border-subtle mt-4",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// ── Stat Card (Specialised) ──
interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  animate?: boolean;
  animateDelay?: number;
}

function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  animate = false,
  animateDelay = 0,
}: StatCardProps) {
  const trendColor =
    trend?.direction === "up"
      ? "text-accent-400"
      : trend?.direction === "down"
        ? "text-red-400"
        : "text-text-tertiary";

  return (
    <Card variant="stat" animate={animate} animateDelay={animateDelay}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-text-primary tracking-tight">
            {value}
          </p>
          {subValue && (
            <p className="text-sm text-text-secondary mt-0.5">{subValue}</p>
          )}
          {trend && (
            <p className={cn("text-xs font-medium mt-2", trendColor)}>
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-lg shrink-0 text-brand-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  cardVariants,
};
