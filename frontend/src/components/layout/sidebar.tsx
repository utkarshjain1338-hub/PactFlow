"use client";

/**
 * PactFlow — Sidebar Navigation
 * Collapsible sidebar with animated transitions and active state
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
  LogOut,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/typography";

// ── Navigation Structure ──
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "brand" | "error" | "warning" | "success";
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_ITEMS: NavGroup[] = [
  {
    group: "Core",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "projects", label: "Projects", href: "/projects", icon: FolderKanban, badge: 3 },
      { id: "milestones", label: "Milestones", href: "/milestones", icon: Milestone },
      { id: "transactions", label: "Transactions", href: "/transactions", icon: Clock },
    ],
  },
  {
    group: "Finance",
    items: [
      { id: "wallet", label: "Wallet", href: "/wallet", icon: Wallet },
      { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Account",
    items: [
      {
        id: "notifications",
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
        badge: 2,
        badgeVariant: "error",
      },
      { id: "settings", label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

// Mock current user
const MOCK_USER = {
  displayName: "Stellar Ventures",
  email: "alex@stellarventures.io",
  accountType: "COMPANY" as const,
  isEmailVerified: true,
};

// ── Sidebar Logo ──
function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0 shadow-brand">
        <Zap size={16} className="text-white" />
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <span className="font-bold text-base text-text-primary tracking-tight whitespace-nowrap">
              PactFlow
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nav Item ──
function SidebarItem({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "sidebar-item",
        active && "active",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon
        size={18}
        className={cn("shrink-0", active ? "text-brand-400" : "text-text-tertiary")}
        aria-hidden
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden whitespace-nowrap flex items-center justify-between"
          >
            {item.label}
            {item.badge !== undefined && (
              <Badge
                variant={item.badgeVariant ?? "brand"}
                className="ml-auto text-[10px] px-1.5 py-0"
              >
                {item.badge}
              </Badge>
            )}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Collapsed badge indicator */}
      {collapsed && item.badge !== undefined && (
        <span
          className={cn(
            "absolute top-1 right-1 w-2 h-2 rounded-full",
            item.badgeVariant === "error" ? "bg-red-500" : "bg-brand-500"
          )}
          aria-hidden
        />
      )}
    </Link>
  );
}

// ── User Footer ──
function SidebarUserFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "p-3 border-t border-border-subtle",
        "flex items-center gap-3",
        collapsed && "justify-center"
      )}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0 text-brand-300 text-xs font-semibold"
        aria-label={MOCK_USER.displayName}
      >
        {getInitials(MOCK_USER.displayName)}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden min-w-0"
          >
            <p className="text-xs font-medium text-text-primary truncate">
              {MOCK_USER.displayName}
            </p>
            <p className="text-[10px] text-text-tertiary truncate">
              {MOCK_USER.accountType}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!collapsed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-1.5 rounded-md text-text-disabled hover:text-text-secondary hover:bg-surface-2 transition-all"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sidebar ──
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "h-screen sticky top-0",
        "flex flex-col",
        "bg-surface-0 border-r border-border-subtle",
        "overflow-hidden",
        "z-sticky",
        "shrink-0"
      )}
      aria-label="Primary navigation"
    >
      {/* Logo */}
      <SidebarLogo collapsed={collapsed} />

      {/* Divider */}
      <div className="h-px bg-border-subtle mx-4" />

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-2 space-y-6">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1.5 text-[10px] font-semibold text-text-disabled uppercase tracking-widest"
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-0.5 relative">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  active={pathname === item.href || pathname.startsWith(item.href + "/")}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-2 space-y-0.5">
        <Link
          href="/help"
          className={cn("sidebar-item", collapsed && "justify-center px-2")}
          aria-label={collapsed ? "Help & Support" : undefined}
        >
          <HelpCircle size={18} className="text-text-tertiary shrink-0" aria-hidden />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Help & Support
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* User Footer */}
      <SidebarUserFooter collapsed={collapsed} />

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          "absolute top-[72px] -right-3",
          "w-6 h-6 rounded-full",
          "bg-surface-2 border border-border-default",
          "flex items-center justify-center",
          "text-text-tertiary hover:text-text-primary",
          "hover:border-border-strong",
          "transition-all duration-200",
          "shadow-md z-10"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
