"use client";

/**
 * PactFlow — Transactions Page
 * On-chain Soroban & Stellar transaction ledger with Explorer links and status filtering.
 */
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Cpu, ExternalLink, Filter, ShieldCheck } from "lucide-react";
import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import { TransactionCard } from "@/components/pactflow";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { type TxType } from "@/types/domain";

type TxFilter = "ALL" | "ESCROW_FUND" | "PAYMENT_RELEASE" | "REFUND" | "CONTRACT_DEPLOY";

export default function TransactionsPage() {
  const [filter, setFilter] = useState<TxFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchesFilter = filter === "ALL" || tx.txType === filter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        tx.txHash.toLowerCase().includes(query) ||
        String(tx.ledgerSequence).includes(query) ||
        (tx.project && tx.project.title.toLowerCase().includes(query)) ||
        (tx.milestone && tx.milestone.title.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const tabs: { id: TxFilter; label: string; count: number }[] = [
    { id: "ALL", label: "All Transactions", count: MOCK_TRANSACTIONS.length },
    {
      id: "ESCROW_FUND",
      label: "Funding",
      count: MOCK_TRANSACTIONS.filter((t) => t.txType === "ESCROW_FUND").length,
    },
    {
      id: "PAYMENT_RELEASE",
      label: "Releases",
      count: MOCK_TRANSACTIONS.filter((t) => t.txType === "PAYMENT_RELEASE").length,
    },
    {
      id: "REFUND",
      label: "Refunds",
      count: MOCK_TRANSACTIONS.filter((t) => t.txType === "REFUND").length,
    },
  ];

  return (
    <DashboardShell title="Transactions" breadcrumbs={[{ label: "Transactions" }]}>
      <PageHeader
        title="On-Chain Soroban Transaction Ledger"
        description="Verifiable cryptographic proof of all escrow operations, hardware timelocks, and milestone payouts."
        actions={
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-xl border border-brand-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Cpu size={14} className="text-brand-400" />
            <span>Stellar Testnet Explorer</span>
            <ExternalLink size={12} />
          </a>
        }
      />

      <div className="space-y-6">
        {/* Top Ledger Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-1/90 border border-border-subtle">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Total Volume Processed
            </span>
            <p className="text-lg font-bold font-mono text-text-primary">
              1,325.00 XLM
            </p>
            <span className="text-[11px] text-status-success flex items-center gap-1">
              <ShieldCheck size={12} />
              100% Finalized on-chain
            </span>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Avg Network Finality
            </span>
            <p className="text-lg font-bold font-mono text-status-success">
              1.2 Seconds
            </p>
            <span className="text-[11px] text-text-tertiary">Stellar Consensus Protocol</span>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Average Tx Fee
            </span>
            <p className="text-lg font-bold font-mono text-brand-300">
              0.00001 XLM
            </p>
            <span className="text-[11px] text-text-tertiary">≈ $0.0000015 USD</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-1/90 border border-border-subtle">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  filter === tab.id
                    ? "bg-brand-500 text-white shadow-brand-xs"
                    : "bg-surface-2/60 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    filter === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-surface-0 text-text-tertiary"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Filter by hash, ledger block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-surface-0 border border-border-default focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 text-text-primary placeholder:text-text-disabled transition-all"
            />
          </div>
        </div>

        {/* Transactions List */}
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <TransactionCard key={tx.id} transaction={tx} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <EmptyState
                title="No transactions found"
                description={
                  searchQuery
                    ? `No transaction matched "${searchQuery}".`
                    : "There are no transactions in this operation category yet."
                }
                action={
                  <Button size="sm" variant="outline" onClick={() => { setFilter("ALL"); setSearchQuery(""); }}>
                    Reset Filters
                  </Button>
                }
                illustration="search"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
