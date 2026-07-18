"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Wallet as WalletType } from "@/types/wallet";
import { ConnectWalletDialog } from "./connect-wallet-dialog";

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
    <div className="space-y-4">
      {/* Feature 4: Wallet List */}
      <pre className="text-sm text-gray-500">{JSON.stringify(wallets, null, 2)}</pre>
    </div>
  );
}
