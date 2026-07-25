"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MOCK_TRANSACTIONS = [
  { id: "tx_1", date: "2026-07-24", project: "DeFi Dashboard", amount: 1500, type: "PAYOUT", status: "COMPLETED" },
  { id: "tx_2", date: "2026-07-20", project: "Smart Contract Audit", amount: -4000, type: "ESCROW_FUND", status: "COMPLETED" },
  { id: "tx_3", date: "2026-07-15", project: "Wallet Integration", amount: 800, type: "PAYOUT", status: "PENDING" },
  { id: "tx_4", date: "2026-07-10", project: "UI Design", amount: -1200, type: "ESCROW_FUND", status: "FAILED" },
];

export default function BillingOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-2 p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-text-secondary">Available Balance</span>
          <span className="text-3xl font-bold text-text-primary mt-2">{formatCurrency(2300, "XLM")}</span>
          <div className="mt-4 flex items-center text-xs text-brand-500 font-medium bg-brand-500/10 w-fit px-2 py-1 rounded-md">
            <ArrowUpRight size={14} className="mr-1" /> +12% this month
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-text-secondary">Total Escrow Locked</span>
          <span className="text-3xl font-bold text-text-primary mt-2">{formatCurrency(4000, "XLM")}</span>
          <div className="mt-4 flex items-center text-xs text-text-tertiary font-medium bg-surface-3 w-fit px-2 py-1 rounded-md">
            <Clock size={14} className="mr-1" /> Pending completion
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-text-secondary">Total Lifetime Earned</span>
          <span className="text-3xl font-bold text-text-primary mt-2">{formatCurrency(12500, "XLM")}</span>
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
              {MOCK_TRANSACTIONS.map((tx) => (
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
        </div>
      </div>
    </div>
  );
}
