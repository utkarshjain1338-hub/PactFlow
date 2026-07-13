"use client";

/**
 * PactFlow — Application Layout Components
 * Sidebar Navigation (`Sidebar`)
 *
 * Collapsible sidebar with role-aware dynamic item grouping (`COMPANY` vs `FREELANCER`),
 * tooltip badges, active states, and live Stellar Testnet block monitoring card.
 */
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Milestone,
  Wallet,
  Bell,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap,
  HelpCircle,
  Clock,
  UserCheck,
  Award,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useAppStore } from "@/store/app-store";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "brand" | "destructive" | "warning" | "success" | "info" | "secondary";
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { activeRole, currentUser } = useAppStore();

  // Role-aware nav configuration
  const navGroups: NavGroup[] = [
    {
      group: "Core Platform",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        {
          id: "projects",
          label: activeRole === "COMPANY" ? "Our Projects" : "Job Marketplace",
          href: "/projects",
          icon: FolderKanban,
          badge: activeRole === "COMPANY" ? "3 Active" : "New",
          badgeVariant: "brand",
        },
        {
          id: "escrows",
          label: "Escrows & Vaults",
          href: "/escrows",
          icon: Milestone,
        },
        { id: "transactions", label: "Transactions", href: "/transactions", icon: Clock },
      ],
    },
    {
      group: "Financial Trust",
      items: [
        { id: "wallet", label: "Stellar Wallet", href: "/wallet", icon: Wallet },
        { id: "analytics", label: "Analytics & ROI", href: "/analytics", icon: BarChart3 },
        ...(activeRole === "FREELANCER"
          ? [
              {
                id: "reputation",
                label: "On-Chain Reputation",
                href: "/freelancers/me",
                icon: Award,
                badge: "⭐ 4.98",
                badgeVariant: "success" as const,
              },
            ]
          : []),
      ],
    },
    {
      group: "System & Governance",
      items: [
        {
          id: "notifications",
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          badge: 2,
          badgeVariant: "destructive",
        },
        { id: "settings", label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex flex-col h-screen shrink-0 relative select-none",
        "bg-surface-1 border-r border-border-subtle",
        "z-fixed overflow-visible"
      )}
      aria-label="Sidebar navigation"
    >
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border-subtle shrink-0 h-16">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0 shadow-brand text-white font-bold">
          <Shield size={16} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden flex items-center justify-between flex-1 gap-2 whitespace-nowrap min-w-0"
            >
              <span className="font-bold text-sm text-text-primary tracking-tight">
                PactFlow
              </span>
              <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30">
                Level 4
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-6 min-h-0 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2 truncate"
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                const linkContent = (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 h-9 px-3 rounded-lg text-xs font-medium transition-all group relative",
                      isActive
                        ? "bg-brand-500/15 text-brand-300 font-semibold shadow-xs"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-2",
                      collapsed && "justify-center px-0 w-9 mx-auto"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-brand-500 rounded-r" />
                    )}
                    <Icon
                      size={16}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-brand-400" : "text-text-tertiary group-hover:text-text-primary"
                      )}
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 overflow-hidden whitespace-nowrap flex items-center justify-between gap-2 min-w-0"
                        >
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <Badge
                              variant={item.badgeVariant ?? "secondary"}
                              size="sm"
                              className="shrink-0 font-sans"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );

                if (collapsed) {
                  return (
                    <SimpleTooltip key={item.id} content={`${item.label}${item.badge ? ` (${item.badge})` : ""}`} side="right">
                      {linkContent}
                    </SimpleTooltip>
                  );
                }

                return linkContent;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Stellar Network Status Box */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-xl bg-surface-0 border border-border-subtle space-y-1.5 shrink-0"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                Stellar Testnet
              </span>
              <span className="font-mono text-status-success">#52.4M</span>
            </div>
            <p className="text-[10px] text-text-tertiary leading-tight">
              Soroban Protocol v2.1 • Avg Finality 1.2s
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Mini Footer */}
      <div className="p-3 border-t border-border-subtle flex items-center justify-between gap-3 bg-surface-1 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-surface-3 border border-border-strong flex items-center justify-center text-xs font-bold text-brand-300 shrink-0">
            {getInitials(currentUser?.displayName ?? "Stellar Ventures")}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col overflow-hidden min-w-0"
              >
                <span className="text-xs font-semibold text-text-primary truncate">
                  {currentUser?.displayName ?? "Stellar Ventures"}
                </span>
                <span className="text-[10px] text-brand-400 font-medium truncate">
                  {activeRole === "COMPANY" ? "Company / Client" : "Freelancer"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!collapsed && (
          <Link
            href="/settings"
            aria-label="Account Settings"
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors shrink-0"
          >
            <Settings size={15} />
          </Link>
        )}
      </div>

      {/* Collapse Toggle Pill Button */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className={cn(
          "absolute top-5 -right-3 w-6 h-6 rounded-full",
          "bg-surface-2 border border-border-strong text-text-secondary hover:text-text-primary",
          "flex items-center justify-center shadow-lg transition-all z-20",
          "focus:outline-none focus:ring-2 focus:ring-brand-400"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </motion.aside>
  );
}
