/**
 * PactFlow — Wallet Page (Stub)
 */
import type { Metadata } from "next";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { WalletDashboard } from "@/components/pactflow/wallet/wallet-dashboard";

export const metadata: Metadata = {
  title: "Wallet",
};

export default function WalletPage() {
  return (
    <DashboardShell
      title="Wallet"
      breadcrumbs={[{ label: "Wallet" }]}
    >
      <PageHeader
        title="Connected Wallets"
        description="Manage your Stellar wallets to fund escrows and receive payments."
      />
      <WalletDashboard />
    </DashboardShell>
  );
}
