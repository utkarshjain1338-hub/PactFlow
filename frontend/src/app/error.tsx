"use client";

/**
 * PactFlow — Global Error Boundary (app/error.tsx)
 * Catches unhandled React errors in the route segment
 */
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-ground px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertTriangle size={28} className="text-red-400" aria-hidden />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-3">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="text-text-secondary text-sm leading-relaxed mb-2">
          An unexpected error occurred. Our team has been notified and is investigating.
        </p>

        {/* Error detail (development only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-left mb-4">
            <p className="text-xs font-mono text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[10px] text-text-disabled mt-1 font-mono">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand-500 text-primary-foreground text-sm font-medium hover:bg-brand-400 transition-colors"
          >
            <RefreshCw size={14} aria-hidden />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-2 border border-border-default text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-strong transition-all"
          >
            <ArrowLeft size={14} aria-hidden />
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
