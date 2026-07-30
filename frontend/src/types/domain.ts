/**
 * PactFlow — Domain Type Definitions
 * Mirrors the Domain Model and API Specification exactly.
 * These types are the shared contract between frontend and backend.
 */

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export type AccountType = "COMPANY" | "FREELANCER" | "ADMIN";

export type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type MilestoneStatus =
  | "DRAFT"
  | "FUNDED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "PAID"
  | "REFUNDED";

export type EscrowStatus =
  | "PENDING_DEPLOYMENT"
  | "ACTIVE"
  | "RELEASED"
  | "REFUNDED"
  | "CANCELLED";

export type NotificationType =
  | "MILESTONE_FUNDED"
  | "MILESTONE_SUBMITTED"
  | "MILESTONE_PAID"
  | "MILESTONE_REFUNDED"
  | "PROJECT_CREATED"
  | "COMMENT_POSTED"
  | "WALLET_LINKED";

export type WalletProvider = "FREIGHTER" | "XBULL" | "RABET" | "LOBSTR";

export type TxType =
  | "ESCROW_FUND"
  | "PAYMENT_RELEASE"
  | "REFUND"
  | "CONTRACT_DEPLOY";

export type DeliveryType =
  | "URL"
  | "FIGMA"
  | "GITHUB_PR"
  | "GITHUB_REPO"
  | "GOOGLE_DRIVE"
  | "NOTION"
  | "OTHER";

// ─────────────────────────────────────────
// ENTITIES
// ─────────────────────────────────────────

export interface UserSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  accountType: AccountType;
}

export interface WalletConnection {
  id: string;
  stellarPublicKey: string;
  walletProvider: WalletProvider;
  isPrimary: boolean;
  verifiedAt: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  accountType: AccountType;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  bio: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  wallets: WalletConnection[];
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string | null;
  deliveryUrl: string;
  deliveryType: DeliveryType;
  submittedAt: string;
}

export interface EscrowContract {
  id: string;
  contractAddress: string;
  escrowStatus: EscrowStatus;
  lockedAmountXlm: string;
  assetCode: string;
  clientWalletAddress: string;
  freelancerWalletAddress: string;
  fundedAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  transactionReferences?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  amountXlm: string;
  assetCode: string;
  status: MilestoneStatus;
  sequenceOrder: number;
  dueDate: string | null;
  isStrictDeadline: boolean;
  escrow: EscrowContract | null;
  deliverables: Deliverable[];
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneSummary {
  id: string;
  title: string;
  status: MilestoneStatus;
  amountXlm: string;
  sequenceOrder: number;
  dueDate: string | null;
}

export interface Project {
  id: string;
  clientUserId: string;
  clientWalletId: string | null;
  freelancerUserId: string;
  freelancerWalletId: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  totalBudgetXlm: string;
  assetCode: string;
  deadline: string | null;
  isDeleted: boolean;
  isEscrowReady: boolean;
}

export interface Notification {
  id: string;
  notificationType: NotificationType;
  title: string;
  body: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  eventType: string;
  summary: string;
  actor: UserSummary;
  project: { id: string; title: string };
  milestone: { id: string; title: string } | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  txType: TxType;
  network: string;
  amountXlm: string;
  assetCode: string;
  networkFeeXlm: string;
  ledgerSequence: number;
  initiatedByWallet: string;
  milestone: { id: string; title: string };
  project: { id: string; title: string };
  confirmedAt: string;
  createdAt: string;
}

// ─────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────

export interface FreelancerAnalytics {
  userId: string;
  accountType: "FREELANCER";
  period: { from: string; to: string };
  summary: {
    totalEarnedXlm: string;
    milestonesCompleted: number;
    milestonesInProgress: number;
    activeProjects: number;
    avgCompletionDays: number;
  };
  earningsTrend: Array<{ date: string; amountXlm: string }>;
}

export interface CompanyAnalytics {
  userId: string;
  accountType: "COMPANY";
  period: { from: string; to: string };
  summary: {
    totalPaidXlm: string;
    totalLockedInEscrowXlm: string;
    milestonesCompleted: number;
    activeProjects: number;
    projectsCompleted: number;
  };
  spendingTrend: Array<{ date: string; amountXlm: string }>;
}

export type UserAnalytics = FreelancerAnalytics | CompanyAnalytics;

// ─────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  traceId: string;
  errors?: Array<{ field: string; code: string; message: string }>;
}
