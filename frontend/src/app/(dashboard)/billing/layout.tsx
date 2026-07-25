import React from "react";
import Link from "next/link";
import { CreditCard, History, Download, ArrowUpRight } from "lucide-react";

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto w-full py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Billing & Payouts</h1>
        <p className="text-sm text-text-tertiary mt-1">Manage your financial activity on the PactFlow network.</p>
      </div>
      
      <div className="flex items-center gap-6 border-b border-border-subtle">
        <Link href="/billing" className="pb-3 text-sm font-medium border-b-2 border-brand-500 text-text-primary">
          Overview
        </Link>
        <Link href="/billing" className="pb-3 text-sm font-medium border-b-2 border-transparent text-text-secondary hover:text-text-primary">
          Transactions
        </Link>
      </div>

      <main>{children}</main>
    </div>
  );
}
