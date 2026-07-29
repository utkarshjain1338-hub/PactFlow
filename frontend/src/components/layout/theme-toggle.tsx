"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setOpen(false);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-surface-1 border border-border-subtle" />
    );
  }

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-full select-none text-text-secondary",
            "bg-surface-1 border border-border-subtle",
            "hover:border-border-default hover:bg-surface-2 hover:text-text-primary",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          )}
          aria-label="Toggle theme"
          aria-expanded={open}
        >
          {theme === "dark" ? (
            <Moon size={16} />
          ) : theme === "light" ? (
            <Sun size={16} />
          ) : (
            <Monitor size={16} />
          )}
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-dropdown w-36 p-1.5 overflow-hidden",
            "bg-surface-2 border border-border-strong rounded-xl shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <DropdownMenuPrimitive.Item
            onClick={() => handleThemeChange("light")}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer outline-none transition-colors",
              theme === "light"
                ? "bg-brand-500/15 text-brand-500 font-semibold"
                : "text-text-secondary hover:bg-surface-3 hover:text-text-primary"
            )}
          >
            <Sun size={14} className={theme === "light" ? "text-brand-500" : ""} />
            Light
          </DropdownMenuPrimitive.Item>
          
          <DropdownMenuPrimitive.Item
            onClick={() => handleThemeChange("dark")}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer outline-none transition-colors",
              theme === "dark"
                ? "bg-brand-500/15 text-brand-500 font-semibold"
                : "text-text-secondary hover:bg-surface-3 hover:text-text-primary"
            )}
          >
            <Moon size={14} className={theme === "dark" ? "text-brand-500" : ""} />
            Dark
          </DropdownMenuPrimitive.Item>
          
          <DropdownMenuPrimitive.Item
            onClick={() => handleThemeChange("system")}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer outline-none transition-colors",
              theme === "system"
                ? "bg-brand-500/15 text-brand-500 font-semibold"
                : "text-text-secondary hover:bg-surface-3 hover:text-text-primary"
            )}
          >
            <Monitor size={14} className={theme === "system" ? "text-brand-500" : ""} />
            System
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
