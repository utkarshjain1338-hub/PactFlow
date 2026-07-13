"use client";

/**
 * PactFlow — Application Layout Components
 * Master Dashboard Layout Shell (`DashboardShell`)
 *
 * Orchestrates Sidebar, TopNav (with BreadcrumbNav, SearchBar, NotificationBell, UserMenu),
 * main accessible content area (`#main-content`), Footer, and MobileNav.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopNav } from "./topnav";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { BreadcrumbNav } from "./breadcrumb-nav";

export interface DashboardShellProps {
  /** Optional page header title override */
  title?: string;
  /** Explicit breadcrumb override */
  breadcrumbs?: BreadcrumbItem[];
  /** Custom action slot in TopNav right area */
  headerActions?: React.ReactNode;
  /** Main page content */
  children: React.ReactNode;
  className?: string;
  /** Whether to constrain content width to 1280px */
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
    <div className="flex h-screen w-full bg-surface-ground text-text-primary overflow-hidden">
      {/* Skip to main content link for screen reader accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:bg-brand-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-semibold shadow-2xl"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar (hidden on mobile md:hidden) */}
      <Sidebar />

      {/* Main Column Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative">
        {/* Sticky Top Navigation Bar */}
        <TopNav title={title}>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <BreadcrumbNav items={breadcrumbs} />
          ) : undefined}
          {headerActions}
        </TopNav>

        {/* Scrollable Main Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden flex flex-col focus:outline-none pb-16 md:pb-0"
          )}
          aria-label="Main application content"
        >
          <div
            className={cn(
              "flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 w-full",
              constrained && "max-w-[1280px] mx-auto",
              className
            )}
          >
            {children}
          </div>

          {/* Global Footer */}
          <Footer />
        </main>

        {/* Mobile Navigation Bar & Drawer Trigger (`md:hidden`) */}
        <MobileNav />
      </div>
    </div>
  );
}

// ── Page Header Component for modular page top sections ──
export interface PageHeaderProps {
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
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="space-y-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <BreadcrumbNav items={breadcrumbs} className="mb-2" />
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary truncate">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// ── Section Container Helper for clean page sections ──
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({
  title,
  description,
  action,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn("space-y-4 mb-8", className)} {...props}>
      {(title || description || action) && (
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            {title && <h2 className="text-base sm:text-lg font-bold text-text-primary">{title}</h2>}
            {description && <p className="text-xs text-text-secondary">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
