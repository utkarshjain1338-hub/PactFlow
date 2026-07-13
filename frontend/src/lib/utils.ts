/**
 * PactFlow — Shared Utility Functions
 * Mirrors shadcn/ui cn() pattern + additional helpers
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format XLM amounts with 7 decimal precision */
export function formatXlm(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0.0000000 XLM";
  return `${num.toFixed(7)} XLM`;
}

/** Format XLM amounts compactly (e.g. 1.5K XLM) */
export function formatXlmCompact(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 XLM";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M XLM`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K XLM`;
  return `${num.toFixed(2)} XLM`;
}

/** Format numbers with optional currency/unit code (e.g. "12,500 XLM" or "$1,200") */
export function formatCurrency(amount: string | number, currency = "XLM"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `0 ${currency}`;
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(num);
  return currency === "$" ? `$${formatted}` : `${formatted} ${currency}`;
}

/** Truncate a Stellar public key for display */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length < start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/** Format date to relative string */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Format ISO date to readable */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Format ISO date to short */
export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Convert SNAKE_CASE to Title Case */
export function statusToLabel(status: string): string {
  return status
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

/** Generate initials from display name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Get progress percentage */
export function getProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/** Sleep utility for testing */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
