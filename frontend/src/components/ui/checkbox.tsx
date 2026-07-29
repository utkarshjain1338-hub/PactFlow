"use client";

/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Checkbox Component (Radix UI accessible primitive)
 *
 * Requirements: Reusable, Accessible (WCAG 2.1 AA keyboard nav + aria), Responsive, Dark Mode first.
 */
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Optional label text shown next to the checkbox */
  label?: string;
  /** Optional description text displayed below the label */
  description?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, id, ...props }, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const checkboxElement = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={inputId}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-md border border-border-default bg-surface-1",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500 data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:bg-brand-500/20 data-[state=indeterminate]:border-brand-500 data-[state=indeterminate]:text-brand-300",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        {props.checked === "indeterminate" ? (
          <Minus className="h-3.5 w-3.5 stroke-[3]" />
        ) : (
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label && !description) {
    return checkboxElement;
  }

  return (
    <div className="flex items-start gap-3 select-none">
      <div className="flex items-center h-5">{checkboxElement}</div>
      <div className="flex flex-col gap-0.5 leading-none">
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
    </div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
