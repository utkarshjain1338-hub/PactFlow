"use client";

/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Toast & Toaster Component (powered by Sonner)
 *
 * Requirements: Reusable, Accessible (aria alert region), Responsive, Dark Mode first.
 */
import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-2 group-[.toaster]:text-text-primary group-[.toaster]:border-border-strong group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-text-secondary text-xs",
          actionButton:
            "group-[.toast]:bg-brand-500 group-[.toast]:text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-all hover:group-[.toast]:bg-brand-600",
          cancelButton:
            "group-[.toast]:bg-surface-1 group-[.toast]:text-text-secondary text-xs px-3 py-1.5 rounded-lg transition-all hover:group-[.toast]:text-text-primary",
          success: "group-[.toaster]:!border-status-success-border group-[.toaster]:!bg-status-success-bg/95",
          error: "group-[.toaster]:!border-status-error-border group-[.toaster]:!bg-status-error-bg/95",
          warning: "group-[.toaster]:!border-status-warning-border group-[.toaster]:!bg-status-warning-bg/95",
          info: "group-[.toaster]:!border-status-info-border group-[.toaster]:!bg-status-info-bg/95",
        },
      }}
      {...props}
    />
  );
};

/**
 * Custom Toast Card container when rich JSX content is triggered via `toast.custom()`
 */
export interface ToastCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning" | "info";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ToastCard = React.forwardRef<HTMLDivElement, ToastCardProps>(
  ({ className, variant = "default", title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "flex w-full max-w-sm flex-col gap-2 rounded-xl bg-surface-2 p-4 text-text-primary shadow-xl border border-border-strong",
          variant === "success" && "border-status-success-border bg-status-success-bg/95",
          variant === "error" && "border-status-error-border bg-status-error-bg/95",
          variant === "warning" && "border-status-warning-border bg-status-warning-bg/95",
          variant === "info" && "border-status-info-border bg-status-info-bg/95",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="flex flex-col gap-0.5">
            {title && <p className="text-sm font-semibold">{title}</p>}
            {description && <p className="text-xs text-text-secondary">{description}</p>}
          </div>
        )}
        {children}
        {action && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={action.onClick}
              className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-600 active:scale-[0.98]"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    );
  }
);
ToastCard.displayName = "ToastCard";

export { Toaster, ToastCard, toast };
