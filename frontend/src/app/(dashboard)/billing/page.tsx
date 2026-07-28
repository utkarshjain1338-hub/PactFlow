"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { EmptyState } from "@/components/ui/empty-state";

export default function BillingOverviewPage() {
  const { stats, allEscrows, isLoading } = useDashboardData();

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500 w-8 h-8" /></div>;
  }

  // Derive transactions from escrows
  const derivedTransactions = allEscrows.flatMap(e => {
    const txs = [];
    if (e.fundedAt) {
      txs.push({
        id: `${e.id}-funded`,
        date: new Date(e.fundedAt).toISOString().split('T')[0],
        project: "Escrow Contract",
        amount: -(e.fundedAmount || 0),
        type: "ESCROW_FUND",
        status: "COMPLETED",
        timestamp: new Date(e.fundedAt).getTime()
      });
    }
    if (e.releasedAt) {
      txs.push({
        id: `${e.id}-released`,
        date: new Date(e.releasedAt).toISOString().split('T')[0],
        project: "Escrow Contract",
        amount: e.fundedAmount || 0,
        type: "PAYOUT",
        status: "COMPLETED",
        timestamp: new Date(e.releasedAt).getTime()
      });
    }
    return txs;
  }).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-2 p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-text-secondary">Available Balance</span>
          <span className="text-3xl font-bold text-text-primary mt-2">{formatCurrency(stats.totalPaidXlm, "XLM")}</span>
          <div className="mt-4 flex items-center text-xs text-brand-500 font-medium bg-brand-500/10 w-fit px-2 py-1 rounded-md">
            <ArrowUpRight size={14} className="mr-1" /> Dynamic Data
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-text-secondary">Total Escrow Locked</span>
          <span className="text-3xl font-bold text-text-primary mt-2">{formatCurrency(stats.totalLockedInEscrowXlm, "XLM")}</span>
          <div className="mt-4 flex items-center text-xs text-text-tertiary font-medium bg-surface-3 w-fit px-2 py-1 rounded-md">
            <Clock size={14} className="mr-1" /> Pending completion
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-text-secondary">Total Lifetime Paid</span>
          <span className="text-3xl font-bold text-text-primary mt-2">{formatCurrency(stats.totalPaidXlm, "XLM")}</span>
          <div className="mt-4 flex items-center text-xs text-brand-500 font-medium bg-brand-500/10 w-fit px-2 py-1 rounded-md">
            <CheckCircle2 size={14} className="mr-1" /> View details
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-2">
          <h2 className="text-sm font-semibold text-text-primary">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          {derivedTransactions.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No transactions yet" description="Your transaction history will appear here once escrows are funded." size="sm" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-xs font-semibold text-text-secondary bg-surface-2/50">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {derivedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-primary whitespace-nowrap">{tx.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">{tx.project}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center text-xs font-medium text-text-secondary">
                        {tx.type === "PAYOUT" ? <ArrowDownRight size={14} className="mr-1 text-green-500" /> : <ArrowUpRight size={14} className="mr-1 text-red-500" />}
                        {tx.type === "PAYOUT" ? "Payout" : "Funded"}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${tx.amount > 0 ? "text-green-500" : "text-text-primary"}`}>
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount, "XLM")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={tx.status === "COMPLETED" ? "brand" : tx.status === "PENDING" ? "secondary" : "destructive"}>
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
