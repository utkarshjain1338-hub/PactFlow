"use client";

/**
 * PactFlow — Application Layout Components
 * User Menu (`UserMenu`)
 *
 * Consumes `useAppStore` to display current user details, active role,
 * fast role switching (Company ↔ Freelancer), theme toggle, and profile navigation.
 */
import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Wallet,
  CreditCard,
  Shield,
  LogOut,
  Building2,
  Check,
} from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/contexts/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { activeRole, setRole } = useAppStore();
  const { user, logout, switchRole } = useAuth();

  const handleRoleToggle = async (newRole: "COMPANY" | "FREELANCER") => {
    try {
      if (!user?.allowedRoles?.includes(newRole)) {
        toast.error(`You do not have a ${newRole === "COMPANY" ? "Company" : "Freelancer"} profile setup.`);
        return;
      }
      await switchRole(newRole);
      setRole(newRole);
      toast.success(`Active role switched to ${newRole === "COMPANY" ? "Company / Client" : "Freelancer"}`);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to switch role.");
    }
  };

  const handleSignOut = async () => {
    await logout();
    toast.info("Signed out of PactFlow session");
    setOpen(false);
  };

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            "flex items-center gap-2.5 pl-1.5 pr-3 h-9 rounded-lg select-none",
            "bg-surface-1 border border-border-subtle",
            "hover:border-border-default hover:bg-surface-2",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          )}
          aria-label="Open user menu"
          aria-expanded={open}
        >
          <Avatar
            size="sm"
            fallback={user ? user.displayName : "PF"}
            src={user?.avatarUrl ?? undefined}
            status="online"
          />
          <div className="flex flex-col items-start leading-none max-w-[110px] truncate hidden md:flex">
            <span className="text-xs font-semibold text-text-primary truncate w-full">
              {user ? user.displayName : "Stellar Ventures"}
            </span>
            <span className="text-[10px] text-brand-400 font-medium mt-0.5">
              {activeRole === "COMPANY" ? "Company" : "Freelancer"}
            </span>
          </div>
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-dropdown w-64 p-1.5 overflow-hidden",
            "bg-surface-2 border border-border-strong rounded-2xl shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {/* User Profile Summary */}
          <div className="px-3 py-3 mb-1 bg-surface-1 rounded-xl border border-border-subtle flex items-center gap-3">
            <Avatar
              size="md"
              fallback={user ? user.displayName : "PF"}
              src={user?.avatarUrl ?? undefined}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text-primary truncate">
                {user ? user.displayName : "Stellar Ventures"}
              </p>
              <p className="text-[11px] text-text-tertiary truncate">
                {user ? user.email : "alex@stellarventures.io"}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge variant="brand" size="sm">
                  {activeRole}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Role Switcher (Crucial for testing both UX workflows) */}
          <DropdownMenuPrimitive.Label className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Switch Active Role View
          </DropdownMenuPrimitive.Label>

          <DropdownMenuPrimitive.Item
            onClick={() => handleRoleToggle("COMPANY")}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer outline-none transition-colors",
              activeRole === "COMPANY"
                ? "bg-brand-500/15 text-brand-300 font-semibold"
                : "text-text-secondary hover:bg-surface-3 hover:text-text-primary"
            )}
          >
            <span className="flex items-center gap-2">
              <Building2 size={14} className="text-brand-400" />
              Company / Client
            </span>
            {activeRole === "COMPANY" && <Check size={14} className="text-brand-400" />}
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item
            onClick={() => handleRoleToggle("FREELANCER")}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer outline-none transition-colors",
              activeRole === "FREELANCER"
                ? "bg-accent-500/15 text-accent-400 font-semibold"
                : "text-text-secondary hover:bg-surface-3 hover:text-text-primary"
            )}
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-accent-400" />
              Freelancer / Builder
            </span>
            {activeRole === "FREELANCER" && <Check size={14} className="text-accent-400" />}
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Separator className="my-1.5 h-px bg-border-subtle" />

          {/* Navigation links */}
          <DropdownMenuPrimitive.Item asChild>
            <Link
              href="/settings/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors outline-none cursor-pointer"
            >
              <User size={14} className="text-text-tertiary" />
              Account Profile
            </Link>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item asChild>
            <Link
              href="/wallet"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors outline-none cursor-pointer"
            >
              <Wallet size={14} className="text-text-tertiary" />
              Soroban Escrow Wallet
            </Link>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item asChild>
            <Link
              href="/settings/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors outline-none cursor-pointer"
            >
              <CreditCard size={14} className="text-text-tertiary" />
              Billing &amp; Payouts
            </Link>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item asChild>
            <Link
              href="/settings/security"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors outline-none cursor-pointer"
            >
              <Shield size={14} className="text-text-tertiary" />
              Security &amp; MFA
            </Link>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Separator className="my-1.5 h-px bg-border-subtle" />



          {/* Sign out */}
          <DropdownMenuPrimitive.Item
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-status-error hover:bg-status-error-bg transition-colors outline-none cursor-pointer"
          >
            <LogOut size={14} />
            Sign Out of PactFlow
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
