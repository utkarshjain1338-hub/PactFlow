"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { truncateAddress, formatDate } from "@/lib/utils";
import type { Wallet } from "@/types/wallet";

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/users/me/wallets/${wallet.id}`);
    },
    onSuccess: () => {
      toast.success("Wallet deleted");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.apiError?.title || "Failed to delete wallet", {
          description: error.apiError?.detail || error.message,
        });
      }
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.stellarPublicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      </CardContent>

      <CardFooter className="pt-4 border-t border-border-subtle mt-auto flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => primaryMutation.mutate()}
          disabled={wallet.isPrimary || !wallet.isVerified || primaryMutation.isPending || deleteMutation.isPending}
        >
          {primaryMutation.isPending ? "Setting..." : "Set Primary"}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending || primaryMutation.isPending}
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
