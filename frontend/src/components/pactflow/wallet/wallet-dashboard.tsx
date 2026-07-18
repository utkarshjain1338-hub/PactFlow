"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Wallet as WalletType } from "@/types/wallet";
import { ConnectWalletDialog } from "./connect-wallet-dialog";
import { WalletCard } from "./wallet-card";

export function WalletDashboard() {
  const { data: wallets } = useQuery<WalletType[]>({
    queryKey: ["wallets"],
    queryFn: () => apiClient.get("/users/me/wallets"),
  });

  if (!wallets) {
    return null; // Will be replaced by skeletons in Feature 7
  }

  if (wallets.length === 0) {
    return (
      <EmptyState
        icon={<Wallet size={22} />}
        title="No wallet connected"
        description="Connect your Stellar wallet to fund escrows and receive payments."
        action={
          <ConnectWalletDialog>
            <Button size="sm">Connect Wallet</Button>
          </ConnectWalletDialog>
        }
        size="lg"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">Your Wallets</h2>
        <ConnectWalletDialog>
          <Button size="sm">Add Wallet</Button>
        </ConnectWalletDialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}
