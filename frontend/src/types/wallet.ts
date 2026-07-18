export type WalletProvider = "STELLAR" | "FREELANCER" | "COMPANY";

export interface Wallet {
  id: string;
  stellarPublicKey: string;
  provider: WalletProvider;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export interface AddWalletRequest {
  stellarPublicKey: string;
  provider: WalletProvider;
}

export interface ChallengeRequest {
  walletId: string;
}

export interface ChallengeResponse {
  nonce: string;
  expiresAtEpochSeconds: number;
}

export interface VerifyWalletRequest {
  walletId: string;
  signature: string;
}
