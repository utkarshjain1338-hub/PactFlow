"use client";

/**
 * PactFlow — Application Layout Components
 * Mobile Navigation Bar (`MobileNav` & Slide-out Drawer)
 *
 * Sticky bottom bar for screens below `md` breakpoint (`md:hidden`),
 * offering instant access to core routes + a slide-out menu drawer.
 */
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Milestone,
  Wallet,
  Menu,
  Bell,
  BarChart3,
  Settings,
  ShieldAlert,
  Clock,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { ResponsiveDrawer } from "./responsive-drawer";
import { Badge } from "@/components/ui/badge";

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { activeRole, currentUser } = useAppStore();

  const coreMobileItems = [
    { id: "dashboard", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", href: "/projects", icon: FolderKanban },
    { id: "escrows", label: "Escrows", href: "/escrows", icon: Milestone },
    { id: "wallet", label: "Wallet", href: "/wallet", icon: Wallet },
  ];

  const allDrawerGroups = [
    {
      groupName: "Core Platform",
      items: [
        { label: "Overview / Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Projects", href: "/projects", icon: FolderKanban, badge: "3 Active" },
        { label: "Escrows & Vaults", href: "/escrows", icon: Milestone },
        { label: "Transactions", href: "/transactions", icon: Clock },
      ],
    },
    {
      groupName: "Financials & XLM",
      items: [
        { label: "Soroban Wallet", href: "/wallet", icon: Wallet, badge: "Connected" },
        { label: "Analytics Dashboard", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      groupName: "Account & System",
      items: [
        { label: "Notifications", href: "/notifications", icon: Bell, badge: "2 New" },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Sticky bottom navigation bar for mobile devices */}
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-sticky h-16",
          "bg-surface-1/95 backdrop-blur-lg border-t border-border-default",
          "flex items-center justify-around px-2 pb-safe select-none shadow-2xl"
        )}
      >
        {coreMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] py-1.5 rounded-xl transition-all",
                isActive
                  ? "text-brand-400 font-semibold"
                  : "text-text-tertiary hover:text-text-secondary active:scale-95"
              )}
            >
              <div className={cn("relative p-1 rounded-lg transition-colors", isActive && "bg-brand-500/15")}>
                <Icon size={18} />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu Trigger Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[64px] py-1.5 rounded-xl transition-all",
            drawerOpen ? "text-brand-400 font-semibold" : "text-text-tertiary hover:text-text-secondary active:scale-95"
          )}
          aria-label="Open full mobile navigation drawer"
        >
          <div className="p-1 rounded-lg">
            <Menu size={18} />
          </div>
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>
      </nav>

      {/* Slide-out Mobile Drawer */}
      <ResponsiveDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        side="left"
        title="PactFlow Navigation"
        description={`${activeRole} Mode • ${currentUser?.displayName ?? "Stellar Ventures"}`}
        className="w-[280px] sm:w-[320px]"
      >
        <div className="flex flex-col h-full justify-between p-4 divide-y divide-border-subtle">
          {/* Navigation Links */}
          <div className="space-y-6 pb-4">
            {allDrawerGroups.map((group) => (
              <div key={group.groupName} className="space-y-1">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
                  {group.groupName}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors",
                        isActive
                          ? "bg-brand-500/15 text-brand-300 font-semibold"
                          : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                      )}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon size={16} className={cn(isActive ? "text-brand-400" : "text-text-tertiary")} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <Badge variant={isActive ? "brand" : "secondary"} size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom System Info & Network pill */}
          <div className="pt-4 space-y-3">
            <div className="p-3 rounded-xl bg-surface-0 border border-border-subtle text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                  Stellar Testnet
                </span>
                <span className="text-[10px] font-mono text-status-success">Online</span>
              </div>
              <p className="text-[11px] text-text-tertiary">
                Soroban Escrow Protocol v2.1 • 1.2s avg block time
              </p>
            </div>

            <p className="text-[10px] text-center text-text-disabled">
              PactFlow SaaS © 2026 • Constellation Design System
            </p>
          </div>
        </div>
      </ResponsiveDrawer>
    </>
  );
}
