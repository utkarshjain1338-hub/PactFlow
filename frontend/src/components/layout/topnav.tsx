"use client";

/**
 * PactFlow — Top Navigation Bar
 * Global header: breadcrumb, search, notifications, user menu
 */
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  X,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn, timeAgo, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/typography";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";

// ── Search Bar ──
function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex items-center gap-2.5",
            "h-9 px-3 rounded-lg",
            "bg-surface-1 border border-border-subtle",
            "text-text-tertiary text-sm",
            "hover:border-border-default hover:text-text-secondary",
            "transition-all duration-150",
            "w-64"
          )}
          aria-label="Open search"
        >
          <Search size={14} aria-hidden />
          <span>Search projects, milestones…</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 bg-surface-2 rounded border border-border-default text-text-disabled font-mono">
            ⌘K
          </kbd>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 h-9 px-3 rounded-lg bg-surface-1 border border-brand-500/40 w-64"
        >
          <Search size={14} className="text-text-tertiary shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
            aria-label="Search"
            onBlur={() => { setOpen(false); setQuery(""); }}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X size={12} className="text-text-tertiary hover:text-text-secondary" />
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ── Notification Panel ──
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            "relative w-9 h-9 rounded-lg",
            "flex items-center justify-center",
            "bg-surface-1 border border-border-subtle",
            "text-text-tertiary",
            "hover:text-text-primary hover:border-border-default",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          )}
          aria-label={`Notifications (${unread} unread)`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <Bell size={16} aria-hidden />
          {unread > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
              aria-label={`${unread} unread notifications`}
            >
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-dropdown w-80 max-h-[480px] overflow-hidden",
            "bg-surface-1 border border-border-default rounded-xl",
            "shadow-xl",
            "animate-scale-in"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
              {unread > 0 && (
                <Badge variant="error" className="text-[10px]">{unread}</Badge>
              )}
            </div>
            <button
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
              aria-label="Mark all as read"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto max-h-80 scrollbar-hide divide-y divide-border-subtle">
            {MOCK_NOTIFICATIONS.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">
                No notifications yet
              </div>
            ) : (
              MOCK_NOTIFICATIONS.map((n) => (
                <Link
                  key={n.id}
                  href={n.actionUrl}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3",
                    "hover:bg-surface-2 transition-colors",
                    !n.isRead && "bg-brand-500/5"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {!n.isRead && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-500 shrink-0" aria-label="Unread" />
                  )}
                  {n.isRead && <span className="mt-1.5 w-2 h-2 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5 leading-snug line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-text-disabled mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border-subtle">
            <Link
              href="/notifications"
              className={cn(
                "flex items-center justify-center gap-1.5",
                "py-2.5 text-xs text-brand-400 hover:text-brand-300",
                "hover:bg-surface-2 transition-colors"
              )}
              onClick={() => setOpen(false)}
            >
              View all notifications
              <ExternalLink size={11} />
            </Link>
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

// ── User Menu ──
function UserMenu() {
  const [open, setOpen] = useState(false);
  const user = { displayName: "Stellar Ventures", email: "alex@stellarventures.io", accountType: "COMPANY" };

  const menuItems = [
    { label: "Profile", href: "/settings/profile" },
    { label: "Wallet Settings", href: "/wallet" },
    { label: "Billing", href: "/settings/billing" },
  ];

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            "flex items-center gap-2.5 pl-2 pr-3 h-9 rounded-lg",
            "bg-surface-1 border border-border-subtle",
            "hover:border-border-default",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          )}
          aria-label="User menu"
          aria-expanded={open}
        >
          <div className="w-6 h-6 rounded-md bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 text-[10px] font-bold">
            {getInitials(user.displayName)}
          </div>
          <span className="text-sm font-medium text-text-primary max-w-[120px] truncate hidden md:block">
            {user.displayName}
          </span>
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-dropdown w-56",
            "bg-surface-1 border border-border-default rounded-xl",
            "shadow-xl p-1",
            "animate-scale-in"
          )}
        >
          {/* User info */}
          <div className="px-3 py-2.5 mb-1 border-b border-border-subtle">
            <p className="text-xs font-semibold text-text-primary truncate">{user.displayName}</p>
            <p className="text-[11px] text-text-tertiary truncate">{user.email}</p>
          </div>

          {menuItems.map((item) => (
            <DropdownMenuPrimitive.Item key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg",
                  "text-sm text-text-secondary",
                  "hover:text-text-primary hover:bg-surface-2",
                  "transition-colors cursor-pointer",
                  "focus:outline-none"
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </DropdownMenuPrimitive.Item>
          ))}

          <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border-subtle" />

          <DropdownMenuPrimitive.Item
            className={cn(
              "flex items-center px-3 py-2 rounded-lg",
              "text-sm text-red-400",
              "hover:bg-red-500/10",
              "transition-colors cursor-pointer",
              "focus:outline-none"
            )}
          >
            Sign out
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

// ── TopNav ──
interface TopNavProps {
  title?: string;
  children?: React.ReactNode;
}

export function TopNav({ title, children }: TopNavProps) {
  return (
    <header
      className={cn(
        "h-16 px-6",
        "flex items-center justify-between gap-4",
        "bg-surface-0/80 backdrop-blur-md",
        "border-b border-border-subtle",
        "sticky top-0 z-sticky",
      )}
      role="banner"
    >
      {/* Left: Page context */}
      <div className="flex items-center gap-3 min-w-0">
        {title && (
          <h1 className="text-sm font-semibold text-text-primary truncate">{title}</h1>
        )}
        {children}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <GlobalSearch />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
