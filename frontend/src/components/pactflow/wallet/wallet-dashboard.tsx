/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Wallet as WalletType, AddWalletRequest, WalletProvider } from "@/types/wallet";
import { WalletCard } from "./wallet-card";
import { useWalletKit } from "@/contexts/wallet-kit-context";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { truncateAddress } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function WalletDashboard() {
  const { wallet, isConnecting, connect, disconnect } = useWalletKit();
  const queryClient = useQueryClient();
  const syncAttemptedFor = useRef<string | null>(null);

  const { data: wallets, isLoading } = useQuery<WalletType[]>({
    queryKey: ["wallets"],
    queryFn: () => apiClient.get("/users/me/wallets"),
  });

  const connectMutation = useMutation({
    mutationFn: async (payload: AddWalletRequest) => {
      return apiClient.post("/users/me/wallets", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Wallet synchronized with your account");
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.status === 409) {
          toast.error("Wallet already in use", {
            description: "This Stellar wallet is already connected to another PactFlow account.",
          });
        } else {
          toast.error(error.apiError?.title || "Failed to sync wallet", {
            description: error.apiError?.detail || error.message,
          });
        }
      } else {
        toast.error("Failed to sync wallet", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  });

  useEffect(() => {
    // When a wallet connects successfully via the kit, sync it to backend
    if (wallet.address && wallet.providerId && wallets) {
      const alreadySaved = wallets.some((w) => w.stellarPublicKey === wallet.address);
      if (!alreadySaved && syncAttemptedFor.current !== wallet.address) {
        syncAttemptedFor.current = wallet.address;
        let mappedProvider: WalletProvider = "OTHER";
        const pid = wallet.providerId.toUpperCase();
        if (pid.includes("FREIGHTER")) mappedProvider = "FREIGHTER";
        else if (pid.includes("XBULL")) mappedProvider = "XBULL";
        else if (pid.includes("LOBSTR")) mappedProvider = "LOBSTR";
        else if (pid.includes("RABET")) mappedProvider = "RABET";

        connectMutation.mutate({
          stellarPublicKey: wallet.address,
          provider: mappedProvider,
        });
      }
    }
  }, [wallet.address, wallet.providerId, wallets]);

  if (isLoading) {
    return <div className="text-text-tertiary">Loading wallets...</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold tracking-tight text-text-primary mb-4">Current Connection</h2>
        {!wallet.address ? (
          <EmptyState
            icon={<Wallet size={22} />}
            title="No wallet connected"
            description="Connect your Stellar wallet to fund escrows and receive payments."
            action={
              <Button size="sm" onClick={connect} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            }
            size="lg"
          />
        ) : (
          <Card variant="default" className="flex flex-col bg-surface-2 border-primary/20">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div className="font-semibold text-text-primary uppercase tracking-wider text-sm">
                {wallet.providerId}
              </div>
              <Badge variant={wallet.verified ? "success" : "warning"} size="sm">
                {wallet.verified ? "Verified" : "Connected (Unverified)"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-medium text-text-primary">
                  {truncateAddress(wallet.address, 8, 8)}
                </span>
              </div>
              <div className="text-xs text-text-secondary mt-2">
                This session is active.
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border-subtle mt-auto flex justify-end">
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect Wallet
              </Button>
            </CardFooter>
          </Card>
        )}
      </section>

      {wallets && wallets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">Saved Wallets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
