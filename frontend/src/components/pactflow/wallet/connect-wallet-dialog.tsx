"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { AddWalletRequest } from "@/types/wallet";

interface ConnectWalletDialogProps {
  children?: React.ReactNode;
}

export function ConnectWalletDialog({ children }: ConnectWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async (stellarPublicKey: string) => {
      const payload: AddWalletRequest = {
        stellarPublicKey,
        provider: "STELLAR",
      };
      return apiClient.post("/users/me/wallets", payload);
    },
    onSuccess: () => {
      toast.success("Wallet connected successfully");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      setOpen(false);
      setAddress("");
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.apiError?.title || "Failed to connect wallet", {
          description: error.apiError?.detail || error.message,
        });
      } else {
        toast.error("Failed to connect wallet", {
          description: (error as Error).message,
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    connectMutation.mutate(address.trim());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent size="sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Connect Stellar Wallet</DialogTitle>
            <DialogDescription>
              Enter your Stellar public key to connect your wallet to PactFlow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="G..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={connectMutation.isPending}
              autoFocus
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={connectMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!address.trim() || connectMutation.isPending}
            >
              {connectMutation.isPending ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
