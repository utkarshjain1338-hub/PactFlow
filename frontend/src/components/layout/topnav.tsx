"use client";

/**
 * PactFlow — Application Layout Components
 * Top Navigation Bar (`TopNav`)
 *
 * Global sticky header composing BreadcrumbNav, SearchBar, NotificationBell, and UserMenu.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { SearchBar } from "./search-bar";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export interface TopNavProps {
  /** Optional page header title */
  title?: string;
  /** Custom children (e.g., custom action buttons or breadcrumb override) */
  children?: React.ReactNode;
  className?: string;
}

export function TopNav({ title, children, className }: TopNavProps) {
  return (
    <header
      className={cn(
        "h-16 px-4 sm:px-6",
        "flex items-center justify-between gap-4",
        "glass border-b-0",
        "sticky top-0 z-sticky select-none",
        className
      )}
      role="banner"
    >
      {/* Left: Breadcrumb trail or Page Title context */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {title && (
          <h1 className="text-sm font-bold text-text-primary truncate">{title}</h1>
        )}
        {children ? children : <BreadcrumbNav />}
      </div>

      {/* Right: Global actions & profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <SearchBar />
        <div className="h-4 w-px bg-border-subtle hidden sm:block" />
        <NotificationBell />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
