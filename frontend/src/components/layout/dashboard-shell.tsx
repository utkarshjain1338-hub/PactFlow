"use client";

/**
 * PactFlow — Dashboard Shell Layout
 * The master layout wrapper used by all authenticated pages
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopNav } from "./topnav";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

interface DashboardShellProps {
  /** Page title shown in TopNav */
  title?: string;
  /** Breadcrumb trail */
  breadcrumbs?: BreadcrumbItem[];
  /** Page-level action buttons (shown in TopNav right area) */
  headerActions?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  className?: string;
  /** Constrain width to content max */
  constrained?: boolean;
}

export function DashboardShell({
  title,
  breadcrumbs,
  headerActions,
  children,
  className,
  constrained = true,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-surface-ground overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopNav */}
        <TopNav title={title}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb items={breadcrumbs} />
          )}
        </TopNav>

        {/* Page content */}
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 overflow-y-auto",
            "focus:outline-none"
          )}
          aria-label="Main content"
        >
          {/* Skip to content link (accessibility) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:bg-brand-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
          >
            Skip to main content
          </a>

          <div
            className={cn(
              "px-6 py-6 lg:px-8 lg:py-8",
              constrained && "max-w-[1280px] mx-auto",
              className
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Page Header ──
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-3" />}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section ──
interface SectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, description, action, children, className }: SectionProps) {
  return (
    <section className={cn("", className)} aria-labelledby={title ? `section-${title}` : undefined}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          {title && (
            <div>
              <h2
                id={`section-${title}`}
                className="text-base font-semibold text-text-primary"
              >
                {title}
              </h2>
              {description && (
                <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
              )}
            </div>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
