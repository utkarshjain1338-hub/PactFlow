"use client";

/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Divider / Separator Component (Radix UI accessible primitive)
 *
 * Requirements: Reusable, Accessible (aria separator), Responsive, Dark Mode first.
 * Features: Horizontal & Vertical orientations, embedded label or pill options.
 */
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

export interface DividerProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Optional text or badge displayed centered across a horizontal divider */
  label?: React.ReactNode;
  /** Visual emphasis */
  variant?: "subtle" | "default" | "strong" | "brand";
}

const Divider = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  DividerProps
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      label,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const getVariantClass = () => {
      switch (variant) {
        case "subtle":
          return "bg-border-subtle";
        case "strong":
          return "bg-border-strong";
        case "brand":
          return "bg-brand-500/40";
        default:
          return "bg-border-default";
      }
    };

    if (label && orientation === "horizontal") {
      return (
        <div className="relative flex items-center w-full my-4 select-none">
          <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn("flex-1 h-px", getVariantClass(), className)}
            {...props}
          />
          <span className="mx-3 px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-text-tertiary bg-surface-1 border border-border-subtle rounded-full">
            {label}
          </span>
          <SeparatorPrimitive.Root
            decorative={decorative}
            orientation={orientation}
            className={cn("flex-1 h-px", getVariantClass(), className)}
          />
        </div>
      );
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0",
          orientation === "horizontal" ? "h-px w-full my-2" : "h-full w-px mx-2",
          getVariantClass(),
          className
        )}
        {...props}
      />
    );
  }
);

Divider.displayName = SeparatorPrimitive.Root.displayName;

const Separator = Divider;

export { Divider, Separator };
