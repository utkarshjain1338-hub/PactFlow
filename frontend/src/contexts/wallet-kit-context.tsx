/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";
import { RabetModule } from "@creit.tech/stellar-wallets-kit/modules/rabet";
import { apiClient } from "@/lib/api-client";

class CustomFreighterModule extends FreighterModule {
  async isAvailable(): Promise<boolean> {
    if (typeof window !== "undefined" && (window as any).stellar?.provider === "freighter" && (window as any).stellar?.platform === "mobile") {
      return false;
    }
    if (typeof window !== "undefined" && (window as any).freighter) {
      return true;
    }
    return super.isAvailable();
  }
}

export interface WalletState {
  address: string | null;
  providerId: string | null;
  network: string;
  verified: boolean;
}

export interface WalletKitContextValue {
  wallet: WalletState;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshWallet: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
  /** Signs an arbitrary message (nonce) for wallet verification. Returns base64 signature. */
  signMessage: (message: string) => Promise<string>;
}

const WalletKitContext = createContext<WalletKitContextValue | undefined>(undefined);

export function WalletKitProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    providerId: null,
    network: Networks.TESTNET,
    verified: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const checkVerifiedStatus = async (address: string | null) => {
    if (!address) return false;
    try {
      const token = localStorage.getItem("pactflow_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const data = await apiClient.get<any[]>("/users/me/wallets", { headers });
      const matched = data?.find((w: any) => w.stellarPublicKey === address);
      return !!(matched && matched.verifiedAt);
    } catch (e: any) {
      // Suppress network errors during concurrent startup to prevent terminal spam
      if (e instanceof TypeError && e.message === "Failed to fetch") return false;
      console.error("Failed to fetch wallets", e);
    }
    return false;
  };

  useEffect(() => {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: [
        new CustomFreighterModule(),
        new xBullModule(),
        new AlbedoModule(),
        new LobstrModule(),
        new RabetModule()
      ],
    });

    const restoredAddress = localStorage.getItem("pactflow_wallet_address");
    const restoredProvider = localStorage.getItem("pactflow_wallet_provider");
    
    if (restoredAddress && restoredProvider) {
      StellarWalletsKit.setWallet(restoredProvider);
      
      checkVerifiedStatus(restoredAddress).then(isVerified => {
        setWallet({
          address: restoredAddress,
          providerId: restoredProvider,
          network: Networks.TESTNET,
          verified: isVerified
        });
      });
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    const isVerified = await checkVerifiedStatus(wallet.address);
    setWallet(prev => ({ ...prev, verified: isVerified }));
  }, [wallet.address]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const result = await StellarWalletsKit.authModal();
      if (result && result.address) {
        const selectedId = StellarWalletsKit.selectedModule.productId;
        const isVerified = await checkVerifiedStatus(result.address);
        
        setWallet({
          address: result.address,
          providerId: selectedId,
          network: Networks.TESTNET,
          verified: isVerified
        });
        
        localStorage.setItem("pactflow_wallet_address", result.address);
        localStorage.setItem("pactflow_wallet_provider", selectedId);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setWallet({ address: null, providerId: null, network: Networks.TESTNET, verified: false });
    localStorage.removeItem("pactflow_wallet_address");
    localStorage.removeItem("pactflow_wallet_provider");
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.error("Disconnect error:", e);
    }
  }, []);

  const signTransaction = useCallback(async (xdr: string) => {
    const response = await StellarWalletsKit.signTransaction(xdr);
    return response.signedTxXdr;
  }, []);

  const signMessage = useCallback(async (message: string) => {
    const response = await StellarWalletsKit.signMessage(message);
    let sig = response.signedMessage;
    
    // Freighter / Kit might return a Buffer object, Uint8Array, or string
    if (typeof sig !== "string") {
      let bytes: Uint8Array;
      
      // Handle { type: "Buffer", data: [...] }
      if (sig && typeof sig === "object" && "type" in sig && (sig as any).type === "Buffer" && Array.isArray((sig as any).data)) {
        bytes = new Uint8Array((sig as any).data);
      } else {
        // Fallback for regular Uint8Array or standard object mapping
        bytes = new Uint8Array(Object.values(sig));
      }
      
      // Convert Uint8Array to base64 safely in the browser
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      sig = btoa(binString);
    }
    
    return sig as string;
  }, []);

  return (
    <WalletKitContext.Provider value={{ wallet, isConnecting, connect, disconnect, refreshWallet, signTransaction, signMessage }}>
      {children}
    </WalletKitContext.Provider>
  );
}

export function useWalletKit() {
  const context = useContext(WalletKitContext);
  if (context === undefined) {
    throw new Error("useWalletKit must be used within a WalletKitProvider");
  }
  return context;
}
