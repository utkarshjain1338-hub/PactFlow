"use client";

/**
 * PactFlow — Application Layout Components
 * Notification Bell (`NotificationBell`)
 *
 * Requirements: Unread count badge, interactive popover,
 * All/Unread filter tabs, Mark all as read handler, and rich Soroban escrow event entries.
 */
import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  ShieldAlert,
  Milestone,
  Wallet,
  Zap,
} from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";

type NotificationTab = "all" | "unread";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) =>
    activeTab === "all" ? true : !n.isRead
  );

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MILESTONE_FUNDED":
      case "MILESTONE_PAID":
        return <ShieldAlert size={15} className="text-status-success" />;
      case "MILESTONE_SUBMITTED":
      case "PROJECT_CREATED":
        return <Milestone size={15} className="text-brand-400" />;
      case "WALLET_LINKED":
      case "MILESTONE_REFUNDED":
        return <Wallet size={15} className="text-status-warning" />;
      default:
        return <Zap size={15} className="text-purple-400" />;
    }
  };

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            "relative h-9 w-9 rounded-lg flex items-center justify-center",
            "bg-surface-1 border border-border-subtle text-text-tertiary",
            "hover:text-text-primary hover:border-border-default hover:bg-surface-2",
            "transition-all duration-150 select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          )}
          aria-label={`Notifications (${unreadCount} unread)`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <Bell size={16} aria-hidden />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-status-error text-white text-[9px] font-bold flex items-center justify-center animate-pulse"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-dropdown w-84 sm:w-96 max-h-[520px] overflow-hidden",
            "bg-surface-2 border border-border-strong rounded-2xl shadow-2xl flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" size="sm">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-surface-1/50 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all",
                activeTab === "all"
                  ? "bg-surface-3 text-text-primary shadow-xs"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all",
                activeTab === "unread"
                  ? "bg-surface-3 text-text-primary shadow-xs"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80 divide-y divide-border-subtle/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-text-tertiary">
                <Bell size={24} className="opacity-40" />
                <p className="text-xs">
                  {activeTab === "unread"
                    ? "You're all caught up! No unread notifications."
                    : "No notifications recorded yet."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.actionUrl}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
                    );
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3.5 transition-colors group",
                    n.isRead ? "hover:bg-surface-3/40" : "bg-brand-500/5 hover:bg-brand-500/10"
                  )}
                >
                  <div className="h-8 w-8 rounded-lg bg-surface-1 border border-border-subtle flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    {getNotificationIcon(n.notificationType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs leading-snug truncate", n.isRead ? "font-medium text-text-primary" : "font-semibold text-text-primary")}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-text-tertiary shrink-0">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 leading-snug line-clamp-2">
                      {n.body}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-2" aria-label="Unread indicator" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border-subtle bg-surface-1">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              View all notification history
              <ExternalLink size={12} />
            </Link>
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
