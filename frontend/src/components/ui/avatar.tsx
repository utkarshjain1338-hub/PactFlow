"use client";

/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Avatar Component (Radix UI accessible primitive)
 *
 * Requirements: Reusable, Accessible (WCAG 2.1 AA), Responsive, Dark Mode first.
 * Features: Image with auto fallback, initials generator, online/busy status indicator, multi-size scale.
 */
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full border border-border-subtle select-none",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-20 w-20 text-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Image alt text */
  alt?: string;
  /** Fallback initials string (e.g. "PF") or full name */
  fallback?: string;
  /** Status dot indicator */
  status?: "online" | "offline" | "busy" | "away";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "md", src, alt, fallback, status, ...props }, ref) => {
  // Helper to compute initials from a full name string or pass through short initials
  const getInitials = (text?: string) => {
    if (!text) return "?";
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={alt || fallback || "Avatar"}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full font-semibold",
            "bg-gradient-to-br from-brand-500/20 via-surface-2 to-brand-900/30 text-text-primary"
          )}
        >
          {getInitials(fallback || alt)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-surface-0",
            size === "xs" ? "h-1.5 w-1.5" : size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
            status === "online" && "bg-status-success animate-pulse",
            status === "busy" && "bg-status-error",
            status === "away" && "bg-status-warning",
            status === "offline" && "bg-text-disabled"
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
});

Avatar.displayName = AvatarPrimitive.Root.displayName;

export { Avatar, avatarVariants };
