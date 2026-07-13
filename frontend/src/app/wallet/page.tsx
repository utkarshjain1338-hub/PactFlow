/**
 * PactFlow — Wallet Page (Stub)
 */
import type { Metadata } from "next";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        title="Wallet"
        description="Connect your Stellar wallet to fund escrows and receive payments."
      />
      <EmptyState
        icon={<Wallet size={22} />}
        title="Connect a wallet"
        description="Wallet integration with Freighter and other Stellar wallet providers will be available in the next milestone."
        action={<Button size="sm" disabled>Connect Wallet (Coming Soon)</Button>}
        size="lg"
      />
    </DashboardShell>
  );
}
