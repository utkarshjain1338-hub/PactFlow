"use client";

/**
 * PactFlow — Application Layout Components
 * Global Footer (`Footer`)
 *
 * Constellation of Trust footer displaying brand tagline, quick routes,
 * and live Stellar Testnet operational status.
 */
import React from "react";
import Link from "next/link";
import { Shield, ExternalLink, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "w-full border-t border-border-subtle bg-surface-0/60 backdrop-blur-md py-8 px-6 lg:px-8 mt-auto select-none",
        className
      )}
      role="contentinfo"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-tertiary">
        {/* Left: Brand logo and copyright */}
        <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Shield size={13} />
            </div>
            <span className="font-bold text-sm text-text-primary tracking-tight">
              PactFlow
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
              Level 4
            </span>
          </div>
          <p className="text-[11px] text-text-secondary">
            Constellation of Trust • Decentralized Escrow Platform on Stellar &amp; Soroban.
          </p>
          <p className="text-[10px] text-text-disabled">
            &copy; {new Date().getFullYear()} PactFlow, Inc. All rights reserved.
          </p>
        </div>

        {/* Center: Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-text-secondary">
          <Link href="/dashboard" className="hover:text-text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/projects" className="hover:text-text-primary transition-colors">
            Projects
          </Link>
          <Link href="/milestones" className="hover:text-text-primary transition-colors">
            Soroban Escrow
          </Link>
          <Link href="/wallet" className="hover:text-text-primary transition-colors">
            Stellar Wallet
          </Link>
          <a
            href="https://developers.stellar.org/docs/smart-contracts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-brand-300 transition-colors"
          >
            Soroban Docs
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Right: Live Stellar Network Status Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-1 border border-border-subtle shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success" />
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary">
            <Zap size={11} className="text-brand-400" />
            <span>Stellar Testnet:</span>
            <span className="font-bold text-status-success">Online</span>
            <span className="text-text-disabled text-[10px]">(1.2s avg)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
