"use client";

/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Switch Component (Radix UI accessible primitive)
 *
 * Requirements: Reusable, Accessible (WCAG 2.1 AA keyboard nav + aria), Responsive, Dark Mode first.
 */
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const switchRootVariants = cva(
  [
    "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
    "transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=unchecked]:bg-surface-2 data-[state=checked]:bg-brand-500",
  ],
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const switchThumbVariants = cva(
  [
    "pointer-events-none block rounded-full bg-surface-0 shadow-lg ring-0 transition-transform duration-200 ease-in-out",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchRootVariants> {
  /** Optional label text shown next to the switch */
  label?: string;
  /** Optional description text displayed below the label */
  description?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, label, description, id, ...props }, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const switchElement = (
    <SwitchPrimitive.Root
      className={cn(switchRootVariants({ size }), className)}
      id={inputId}
      ref={ref}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn(switchThumbVariants({ size }))} />
    </SwitchPrimitive.Root>
  );

  if (!label && !description) {
    return switchElement;
  }

  return (
    <div className="flex items-center justify-between gap-4 select-none">
      <div className="flex flex-col gap-0.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-text-tertiary">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{switchElement}</div>
    </div>
  );
});

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
