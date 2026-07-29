/**
 * PactFlow — 404 Not Found Page (app/not-found.tsx)
 */
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-ground px-6">
      <div className="text-center max-w-md">
        {/* Large number */}
        <div className="relative mb-8 select-none">
          <p className="text-[8rem] font-black text-surface-2 leading-none tracking-tighter">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
                <circle cx="18" cy="18" r="14" stroke="hsl(240, 84%, 60%)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <circle cx="18" cy="8" r="2.5" fill="hsl(240, 84%, 60%)" opacity="0.8" />
                <circle cx="28" cy="22" r="2" fill="hsl(158, 64%, 52%)" opacity="0.8" />
                <circle cx="10" cy="22" r="2" fill="hsl(158, 64%, 52%)" opacity="0.8" />
                <circle cx="18" cy="18" r="2" fill="hsl(240, 84%, 60%)" opacity="0.5" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-text-primary tracking-tight mb-2">
          Page not found
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          The page you are looking for doesn&apos;t exist or has been moved to a different location.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-brand-500 text-primary-foreground text-sm font-medium hover:bg-brand-400 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
