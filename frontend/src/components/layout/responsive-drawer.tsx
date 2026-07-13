"use client";

/**
 * PactFlow — Application Layout Components
 * Responsive Drawer (`ResponsiveDrawer`)
 *
 * Slide-over drawer component (`side="left"` or `side="right"`) built on Radix UI Dialog
 * with smooth Framer Motion transitions, ideal for mobile menus, filters, and escrow audits.
 */
import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResponsiveDrawerProps {
  /** Controlled open state */
  open?: boolean;
  /** Open change callback */
  onOpenChange?: (open: boolean) => void;
  /** Trigger element */
  trigger?: React.ReactNode;
  /** Drawer title for accessibility */
  title?: string;
  /** Drawer description for accessibility */
  description?: string;
  /** Slide direction (`left` for mobile menu, `right` for filters/details) */
  side?: "left" | "right";
  /** Drawer content */
  children: React.ReactNode;
  /** Optional custom width class */
  className?: string;
}

export function ResponsiveDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  side = "right",
  children,
  className,
}: ResponsiveDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      )}

      <DialogPrimitive.Portal>
        {/* Backdrop overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-overlay bg-surface-ground/80 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        {/* Drawer slide panel */}
        <DialogPrimitive.Content
          className={cn(
            "fixed z-modal top-0 bottom-0 flex flex-col bg-surface-1 border-border-default shadow-2xl focus:outline-none",
            side === "left"
              ? "left-0 w-[280px] sm:w-[320px] border-r data-[state=open]:animate-slide-in-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left"
              : "right-0 w-[320px] sm:w-[440px] border-l data-[state=open]:animate-slide-in-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
            className
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-2/60 shrink-0">
              <div className="flex flex-col gap-0.5 min-w-0">
                {title && (
                  <DialogPrimitive.Title className="text-sm font-bold text-text-primary truncate">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-xs text-text-tertiary truncate">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-3 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  aria-label="Close drawer"
                >
                  <X size={16} />
                </button>
              </DialogPrimitive.Close>
            </div>
          )}

          {!title && !description && (
            <div className="absolute top-3 right-3 z-10">
              <DialogPrimitive.Close asChild>
                <button
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-3 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  aria-label="Close drawer"
                >
                  <X size={16} />
                </button>
              </DialogPrimitive.Close>
            </div>
          )}

          {/* Scrollable drawer body */}
          <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
