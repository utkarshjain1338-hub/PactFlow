"use client";

/**
 * PactFlow — Breadcrumb Component
 * WCAG 2.1 accessible navigation landmark
 */
import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Show home icon as first item */
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: "Dashboard", href: "/dashboard", icon: <Home size={13} /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1 flex-wrap" role="list">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <motion.li
              key={`${item.href}-${index}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center gap-1"
            >
              {/* Separator */}
              {!isFirst && (
                <ChevronRight
                  size={12}
                  className="text-text-disabled shrink-0"
                  aria-hidden="true"
                />
              )}

              {/* Item */}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    isLast
                      ? "text-text-primary"
                      : "text-text-tertiary"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && (
                    <span className="shrink-0" aria-hidden>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    "text-text-tertiary hover:text-text-secondary",
                    "transition-colors duration-150",
                    "rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-400"
                  )}
                >
                  {item.icon && (
                    <span className="shrink-0" aria-hidden>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}
