"use client";

/**
 * PactFlow — Landing Footer Component
 * Full-width starry night footer with constellation branding and testnet status indicator.
 */
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShieldCheck, ExternalLink, Code2, Share2, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-border-subtle pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 text-text-secondary">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/pactflow-logo-horizontal.svg"
                alt="PactFlow Logo"
                width={175}
                height={46}
                className="h-11 w-auto group-hover:scale-[1.01] transition-transform"
              />
            </Link>

            <p className="text-xs sm:text-sm text-text-secondary max-w-sm leading-relaxed">
              The future of secure freelance payments. Hardware-enforced Level 4 timelocks and zero third-party custody powered by Soroban on the Stellar consensus network.
            </p>

            <div className="pt-2 flex items-center gap-3 text-text-tertiary">
              <a href="https://github.com/stellar/soroban-examples" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-surface-1 border border-border-subtle hover:text-text-primary hover:border-border-default transition-all">
                <Code2 size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-surface-1 border border-border-subtle hover:text-text-primary hover:border-border-default transition-all">
                <Share2 size={18} />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-surface-1 border border-border-subtle hover:text-text-primary hover:border-border-default transition-all">
                <MessageSquare size={18} />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-text-primary transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-text-primary transition-colors">Features Grid</a></li>
              <li><a href="#security" className="hover:text-text-primary transition-colors">Security Shield</a></li>
              <li><Link href="/dashboard" className="hover:text-text-primary transition-colors">Dashboard App</Link></li>
              <li><Link href="/escrows" className="hover:text-text-primary transition-colors">Escrow Vaults</Link></li>
            </ul>
          </div>

          {/* Developers Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              Developers
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#architecture" className="hover:text-text-primary transition-colors">System Architecture</a></li>
              <li><a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors flex items-center gap-1">Soroban Wasm Docs <ExternalLink size={11} /></a></li>
              <li><a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors flex items-center gap-1">Stellar Explorer <ExternalLink size={11} /></a></li>
              <li><Link href="/transactions" className="hover:text-text-primary transition-colors">On-Chain Ledger</Link></li>
              <li><a href="https://github.com/stellar/soroban-examples" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">GitHub Repository</a></li>
            </ul>
          </div>

          {/* Security & Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              Security & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#faq" className="hover:text-text-primary transition-colors">FAQ & Arbitration</a></li>
              <li><span className="text-status-success font-semibold flex items-center gap-1"><ShieldCheck size={13} /> Level 4 Audited</span></li>
              <li><span className="text-brand-300 font-semibold">Zero Custody Guarantee</span></li>
              <li><span className="hover:text-text-primary cursor-pointer transition-colors">Terms of Service</span></li>
              <li><span className="hover:text-text-primary cursor-pointer transition-colors">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-tertiary">
          <div>
            &copy; {new Date().getFullYear()} PactFlow Protocol — Built on Soroban & Stellar. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-1 border border-border-subtle text-[11px]">
              <span className="w-2 h-2 rounded-full bg-status-success animate-ping" />
              <span className="text-text-secondary">Stellar Testnet:</span>
              <span className="text-status-success font-bold tabular-nums">1.2s Finality</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
