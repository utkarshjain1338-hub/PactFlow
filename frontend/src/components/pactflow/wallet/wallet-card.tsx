"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { truncateAddress, formatDate } from "@/lib/utils";
import type { Wallet, ChallengeResponse, VerifyWalletRequest } from "@/types/wallet";
import { useWalletKit } from "@/contexts/wallet-kit-context";

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const queryClient = useQueryClient();
  const { refreshWallet, signMessage } = useWalletKit();
  const [copied, setCopied] = useState(false);

  // ── Set Primary ──────────────────────────────────────────────────────────
  const primaryMutation = useMutation({
    mutationFn: async () => {
      return apiClient.patch(`/users/me/wallets/${wallet.id}/primary`);
    },
    onSuccess: () => {
      toast.success("Primary wallet updated");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.apiError?.title || "Failed to set primary", {
          description: error.apiError?.detail || error.message,
        });
      }
    },
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/users/me/wallets/${wallet.id}`);
    },
    onSuccess: () => {
      toast.success("Wallet deleted");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      refreshWallet();
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.apiError?.title || "Failed to delete wallet", {
          description: error.apiError?.detail || error.message,
        });
      }
    },
  });

  // ── Verify (3-step challenge-response) ──────────────────────────────────
  const verifyMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Request a nonce challenge from the backend
      const challenge = await apiClient.post<ChallengeResponse>(
        "/users/me/wallets/challenge",
        { walletId: wallet.id }
      );

      // Step 2: Ask the wallet to sign the nonce as a message
      // Uses context's signMessage → StellarWalletsKit.signMessage → base64 signature
      const signedMessage = await signMessage(challenge.nonce);

      // Step 3: Submit the base64 signature to the backend for verification
      const payload: VerifyWalletRequest = {
        walletId: wallet.id,
        signature: signedMessage,
      };
      await apiClient.post("/users/me/wallets/verify", payload);
    },
    onSuccess: () => {
      toast.success("Wallet verified successfully!", {
        description: "Your wallet is now trusted for escrow operations.",
      });
      // Refresh the wallets list and WalletContext verified flag
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      refreshWallet();
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.apiError?.title || "Verification failed", {
          description: error.apiError?.detail || error.message,
        });
      } else {
        toast.error("Verification cancelled or failed", {
          description: "Please try again. Make sure your wallet extension is unlocked.",
        });
      }
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.stellarPublicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBusy =
    verifyMutation.isPending ||
    primaryMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Card variant="default" className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="font-semibold text-text-primary uppercase tracking-wider text-sm">
          {wallet.provider}
        </div>
        <div className="flex items-center gap-2">
          {wallet.isPrimary && (
            <Badge variant="brand" size="sm">
              Primary
            </Badge>
          )}
          <Badge variant={wallet.isVerified ? "success" : "warning"} size="sm">
            {wallet.isVerified ? "Verified" : "Pending"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-lg font-medium text-text-primary">
            {truncateAddress(wallet.stellarPublicKey, 4, 4)}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors"
            title="Copy address"
          >
            {copied ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
          </button>
        </div>
        <div className="text-xs text-text-secondary">
          Created {formatDate(wallet.createdAt)}
        </div>
        {wallet.verifiedAt && (
          <div className="text-xs text-status-success mt-1">
            Verified {formatDate(wallet.verifiedAt)}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t border-border-subtle mt-auto flex justify-between gap-2 flex-wrap">
        {/* Verify button — only shown for unverified wallets */}
        {!wallet.isVerified && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => verifyMutation.mutate()}
            disabled={isBusy}
            className="flex items-center gap-1.5"
          >
            <ShieldCheck size={14} />
            {verifyMutation.isPending ? "Verifying..." : "Verify Wallet"}
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => primaryMutation.mutate()}
            disabled={wallet.isPrimary || !wallet.isVerified || isBusy}
          >
            {primaryMutation.isPending ? "Setting..." : "Set Primary"}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={isBusy}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
