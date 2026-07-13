/**
 * PactFlow — Mock Data (Development Only)
 * Realistic data for UI development without a backend.
 */
import type {
  Project,
  Milestone,
  Notification,
  ActivityEvent,
  BlockchainTransaction,
  UserProfile,
  UserAnalytics,
} from "@/types/domain";

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────

export const MOCK_COMPANY_USER: UserProfile = {
  id: "01923abc-1234-7000-8000-000000000001",
  email: "alex@stellarventures.io",
  accountType: "COMPANY",
  displayName: "Stellar Ventures",
  avatarUrl: null,
  timezone: "America/New_York",
  bio: "Building the future of decentralised finance on Stellar.",
  isEmailVerified: true,
  isActive: true,
  wallets: [
    {
      id: "01923abc-1234-7000-8000-000000000010",
      stellarPublicKey: "GCLIENT7EXAMPLE4STELLAR6ADDRESS2HERE1ABCDE",
      walletProvider: "FREIGHTER",
      isPrimary: true,
      verifiedAt: "2026-07-01T10:00:00Z",
      createdAt: "2026-07-01T10:00:00Z",
    },
  ],
  createdAt: "2026-07-01T09:00:00Z",
  updatedAt: "2026-07-12T06:00:00Z",
};

export const MOCK_FREELANCER_USER: UserProfile = {
  id: "01923abc-1234-7000-8000-000000000002",
  email: "alice@chen.dev",
  accountType: "FREELANCER",
  displayName: "Alice Chen",
  avatarUrl: null,
  timezone: "Asia/Kolkata",
  bio: "Full-stack blockchain developer. 6 years of experience building on Stellar and Ethereum.",
  isEmailVerified: true,
  isActive: true,
  wallets: [
    {
      id: "01923abc-1234-7000-8000-000000000011",
      stellarPublicKey: "GFREE7ALICECHEN4STELLAR6ADDRESS2HERE1ABCD",
      walletProvider: "FREIGHTER",
      isPrimary: true,
      verifiedAt: "2026-07-02T08:00:00Z",
      createdAt: "2026-07-02T08:00:00Z",
    },
  ],
  createdAt: "2026-07-02T07:00:00Z",
  updatedAt: "2026-07-12T05:00:00Z",
};

export interface MockFreelancerSummary {
  id: string;
  displayName: string;
  title: string;
  reputationScore: string;
  completedProjectsCount: number;
  skills: string[];
}

export interface MockCompanySummary {
  id: string;
  name: string;
  industry: string;
  projectsCount: number;
  verified: boolean;
}

export const MOCK_FREELANCERS: MockFreelancerSummary[] = [
  {
    id: "01923abc-1234-7000-8000-000000000002",
    displayName: "Alice Chen",
    title: "Senior Soroban Smart Contract Engineer",
    reputationScore: "4.98",
    completedProjectsCount: 24,
    skills: ["Rust", "Soroban", "Next.js", "TypeScript", "Stellar SDK"],
  },
  {
    id: "01923abc-1234-7000-8000-000000000003",
    displayName: "Marcus Vance",
    title: "DeFi Systems Architect & Security Auditor",
    reputationScore: "4.95",
    completedProjectsCount: 18,
    skills: ["Rust", "Security Audit", "Solidity", "Soroban", "Cryptography"],
  },
  {
    id: "01923abc-1234-7000-8000-000000000004",
    displayName: "Elena Rostova",
    title: "Full-Stack Web3 UI/UX Specialist",
    reputationScore: "4.92",
    completedProjectsCount: 31,
    skills: ["React", "Tailwind CSS", "Framer Motion", "Stellar Wallet Connect", "Figma"],
  },
];

export const MOCK_COMPANIES: MockCompanySummary[] = [
  {
    id: "01923abc-1234-7000-8000-000000000001",
    name: "Stellar Ventures",
    industry: "DeFi Infrastructure",
    projectsCount: 12,
    verified: true,
  },
  {
    id: "01923abc-1234-7000-8000-000000000005",
    name: "Soroban Labs",
    industry: "Smart Contract Tooling",
    projectsCount: 8,
    verified: true,
  },
  {
    id: "01923abc-1234-7000-8000-000000000006",
    name: "Nova Pay",
    industry: "Cross-Border Payments",
    projectsCount: 5,
    verified: true,
  },
];

// ─────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: "01923ghi-0001-7000-8000-000000000001",
    title: "DeFi Dashboard Redesign",
    description:
      "Complete redesign of our Stellar DeFi dashboard with glassmorphism UI and real-time wallet tracking.",
    status: "IN_PROGRESS",
    totalBudgetXlm: "500.0000000",
    assetCode: "XLM",
    deadline: "2026-09-01",
    milestonesCount: 4,
    milestonesCompleted: 1,
    client: {
      id: "01923abc-1234-7000-8000-000000000001",
      displayName: "Stellar Ventures",
      avatarUrl: null,
      accountType: "COMPANY",
    },
    assignee: {
      id: "01923abc-1234-7000-8000-000000000002",
      displayName: "Alice Chen",
      avatarUrl: null,
      accountType: "FREELANCER",
    },
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-10T15:30:00Z",
  },
  {
    id: "01923ghi-0002-7000-8000-000000000002",
    title: "Soroban SDK Integration Library",
    description:
      "Build a TypeScript SDK for interacting with PactFlow's Soroban contracts from any frontend.",
    status: "DRAFT",
    totalBudgetXlm: "250.0000000",
    assetCode: "XLM",
    deadline: "2026-10-15",
    milestonesCount: 3,
    milestonesCompleted: 0,
    client: {
      id: "01923abc-1234-7000-8000-000000000001",
      displayName: "Stellar Ventures",
      avatarUrl: null,
      accountType: "COMPANY",
    },
    assignee: {
      id: "01923abc-1234-7000-8000-000000000002",
      displayName: "Alice Chen",
      avatarUrl: null,
      accountType: "FREELANCER",
    },
    createdAt: "2026-07-08T11:00:00Z",
    updatedAt: "2026-07-08T11:00:00Z",
  },
  {
    id: "01923ghi-0003-7000-8000-000000000003",
    title: "Mobile App UI Design",
    description:
      "Design a complete mobile-first UI system for the PactFlow native app.",
    status: "COMPLETED",
    totalBudgetXlm: "180.0000000",
    assetCode: "XLM",
    deadline: "2026-06-30",
    milestonesCount: 3,
    milestonesCompleted: 3,
    client: {
      id: "01923abc-1234-7000-8000-000000000001",
      displayName: "Stellar Ventures",
      avatarUrl: null,
      accountType: "COMPANY",
    },
    assignee: {
      id: "01923abc-1234-7000-8000-000000000002",
      displayName: "Alice Chen",
      avatarUrl: null,
      accountType: "FREELANCER",
    },
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-06-30T18:00:00Z",
  },
];

// ─────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "01923mno-0001-7000-8000-000000000001",
    projectId: "01923ghi-0001-7000-8000-000000000001",
    title: "Wireframes & Design System",
    description: "Deliver high-fidelity Figma wireframes with full design token system.",
    amountXlm: "100.0000000",
    assetCode: "XLM",
    status: "PAID",
    sequenceOrder: 1,
    dueDate: "2026-07-20",
    isStrictDeadline: false,
    escrow: {
      id: "01923pqr-0001-7000-8000-000000000001",
      contractAddress: "CABC1SOROBAN2CONTRACT3ADDRESS4HERE5ABCDE",
      escrowStatus: "RELEASED",
      lockedAmountXlm: "100.0000000",
      assetCode: "XLM",
      clientWalletAddress: "GCLIENT7EXAMPLE4STELLAR6ADDRESS2HERE1ABCDE",
      freelancerWalletAddress: "GFREE7ALICECHEN4STELLAR6ADDRESS2HERE1ABCD",
      fundedAt: "2026-07-10T10:00:00Z",
      releasedAt: "2026-07-22T14:30:00Z",
      refundedAt: null,
      createdAt: "2026-07-10T09:00:00Z",
      updatedAt: "2026-07-22T14:30:00Z",
    },
    deliverables: [
      {
        id: "01923del-0001",
        title: "Figma Design File",
        description: "Full wireframes + design system",
        deliveryUrl: "https://figma.com/file/example123",
        deliveryType: "FIGMA",
        submittedAt: "2026-07-21T10:00:00Z",
      },
    ],
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-22T14:30:00Z",
  },
  {
    id: "01923mno-0002-7000-8000-000000000002",
    projectId: "01923ghi-0001-7000-8000-000000000001",
    title: "Frontend Implementation",
    description: "Build the Next.js frontend based on approved wireframes.",
    amountXlm: "200.0000000",
    assetCode: "XLM",
    status: "SUBMITTED",
    sequenceOrder: 2,
    dueDate: "2026-08-10",
    isStrictDeadline: true,
    escrow: {
      id: "01923pqr-0002-7000-8000-000000000002",
      contractAddress: "CABC2SOROBAN2CONTRACT3ADDRESS4HERE5ABCDE",
      escrowStatus: "ACTIVE",
      lockedAmountXlm: "200.0000000",
      assetCode: "XLM",
      clientWalletAddress: "GCLIENT7EXAMPLE4STELLAR6ADDRESS2HERE1ABCDE",
      freelancerWalletAddress: "GFREE7ALICECHEN4STELLAR6ADDRESS2HERE1ABCD",
      fundedAt: "2026-07-23T09:00:00Z",
      releasedAt: null,
      refundedAt: null,
      createdAt: "2026-07-23T08:00:00Z",
      updatedAt: "2026-07-23T09:00:00Z",
    },
    deliverables: [
      {
        id: "01923del-0002",
        title: "GitHub PR #42",
        description: "Frontend implementation PR",
        deliveryUrl: "https://github.com/stellar-ventures/defi-dashboard/pull/42",
        deliveryType: "GITHUB_PR",
        submittedAt: "2026-08-08T16:00:00Z",
      },
    ],
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-08-08T16:00:00Z",
  },
  {
    id: "01923mno-0003-7000-8000-000000000003",
    projectId: "01923ghi-0001-7000-8000-000000000001",
    title: "Smart Contract Integration",
    description: "Integrate Soroban contract calls into the frontend.",
    amountXlm: "150.0000000",
    assetCode: "XLM",
    status: "FUNDED",
    sequenceOrder: 3,
    dueDate: "2026-08-25",
    isStrictDeadline: false,
    escrow: null,
    deliverables: [],
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "01923mno-0004-7000-8000-000000000004",
    projectId: "01923ghi-0001-7000-8000-000000000001",
    title: "Testing & QA",
    description: "End-to-end testing across all user flows.",
    amountXlm: "50.0000000",
    assetCode: "XLM",
    status: "DRAFT",
    sequenceOrder: 4,
    dueDate: "2026-09-01",
    isStrictDeadline: false,
    escrow: null,
    deliverables: [],
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
  },
];

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "01923notif-0001",
    notificationType: "MILESTONE_SUBMITTED",
    title: "Milestone submitted for review",
    body: 'Alice Chen submitted deliverables for "Frontend Implementation". Review and approve to release payment.',
    actionUrl: "/projects/01923ghi-0001/milestones/01923mno-0002",
    isRead: false,
    createdAt: "2026-08-08T16:05:00Z",
  },
  {
    id: "01923notif-0002",
    notificationType: "MILESTONE_FUNDED",
    title: "Escrow funded",
    body: 'Escrow of 150 XLM funded for "Smart Contract Integration".',
    actionUrl: "/projects/01923ghi-0001/milestones/01923mno-0003",
    isRead: false,
    createdAt: "2026-07-23T09:05:00Z",
  },
  {
    id: "01923notif-0003",
    notificationType: "MILESTONE_PAID",
    title: "Payment released",
    body: '100 XLM released to Alice Chen for "Wireframes & Design System".',
    actionUrl: "/projects/01923ghi-0001/milestones/01923mno-0001",
    isRead: true,
    createdAt: "2026-07-22T14:35:00Z",
  },
];

// ─────────────────────────────────────────
// ACTIVITY EVENTS
// ─────────────────────────────────────────

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "01923act-0001",
    eventType: "MILESTONE_SUBMITTED",
    summary: 'Alice Chen submitted deliverables for "Frontend Implementation".',
    actor: {
      id: "01923abc-1234-7000-8000-000000000002",
      displayName: "Alice Chen",
      avatarUrl: null,
      accountType: "FREELANCER",
    },
    project: { id: "01923ghi-0001", title: "DeFi Dashboard Redesign" },
    milestone: { id: "01923mno-0002", title: "Frontend Implementation" },
    metadata: {},
    occurredAt: "2026-08-08T16:00:00Z",
  },
  {
    id: "01923act-0002",
    eventType: "ESCROW_FUNDED",
    summary: "Stellar Ventures funded 150 XLM escrow for Smart Contract Integration.",
    actor: {
      id: "01923abc-1234-7000-8000-000000000001",
      displayName: "Stellar Ventures",
      avatarUrl: null,
      accountType: "COMPANY",
    },
    project: { id: "01923ghi-0001", title: "DeFi Dashboard Redesign" },
    milestone: { id: "01923mno-0003", title: "Smart Contract Integration" },
    metadata: { amountXlm: "150.0000000" },
    occurredAt: "2026-07-23T09:00:00Z",
  },
  {
    id: "01923act-0003",
    eventType: "PAYMENT_RELEASED",
    summary: "Stellar Ventures released 100 XLM to Alice Chen for Wireframes & Design System.",
    actor: {
      id: "01923abc-1234-7000-8000-000000000001",
      displayName: "Stellar Ventures",
      avatarUrl: null,
      accountType: "COMPANY",
    },
    project: { id: "01923ghi-0001", title: "DeFi Dashboard Redesign" },
    milestone: { id: "01923mno-0001", title: "Wireframes & Design System" },
    metadata: { amountXlm: "100.0000000", txHash: "a1b2c3d4e5f6" },
    occurredAt: "2026-07-22T14:30:00Z",
  },
];

// ─────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────

export const MOCK_TRANSACTIONS: BlockchainTransaction[] = [
  {
    id: "01923tx-0001",
    txHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678",
    txType: "PAYMENT_RELEASE",
    network: "TESTNET",
    amountXlm: "100.0000000",
    assetCode: "XLM",
    networkFeeXlm: "0.0000100",
    ledgerSequence: 12345678,
    initiatedByWallet: "GCLIENT7EXAMPLE4STELLAR6ADDRESS2HERE1ABCDE",
    milestone: { id: "01923mno-0001", title: "Wireframes & Design System" },
    project: { id: "01923ghi-0001", title: "DeFi Dashboard Redesign" },
    confirmedAt: "2026-07-22T14:30:00Z",
    createdAt: "2026-07-22T14:30:01Z",
  },
  {
    id: "01923tx-0002",
    txHash: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345679",
    txType: "ESCROW_FUND",
    network: "TESTNET",
    amountXlm: "150.0000000",
    assetCode: "XLM",
    networkFeeXlm: "0.0000100",
    ledgerSequence: 12345600,
    initiatedByWallet: "GCLIENT7EXAMPLE4STELLAR6ADDRESS2HERE1ABCDE",
    milestone: { id: "01923mno-0003", title: "Smart Contract Integration" },
    project: { id: "01923ghi-0001", title: "DeFi Dashboard Redesign" },
    confirmedAt: "2026-07-23T09:00:00Z",
    createdAt: "2026-07-23T09:00:01Z",
  },
];

// ─────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────

export const MOCK_COMPANY_ANALYTICS: UserAnalytics = {
  userId: "01923abc-1234-7000-8000-000000000001",
  accountType: "COMPANY",
  period: { from: "2026-06-12", to: "2026-07-12" },
  summary: {
    totalPaidXlm: "380.0000000",
    totalLockedInEscrowXlm: "350.0000000",
    milestonesCompleted: 4,
    activeProjects: 2,
    projectsCompleted: 1,
  },
  spendingTrend: [
    { date: "2026-06-15", amountXlm: "80.0000000" },
    { date: "2026-06-22", amountXlm: "100.0000000" },
    { date: "2026-07-01", amountXlm: "50.0000000" },
    { date: "2026-07-08", amountXlm: "150.0000000" },
  ],
};

export const MOCK_FREELANCER_ANALYTICS: UserAnalytics = {
  userId: "01923abc-1234-7000-8000-000000000002",
  accountType: "FREELANCER",
  period: { from: "2026-06-12", to: "2026-07-12" },
  summary: {
    totalEarnedXlm: "380.0000000",
    milestonesCompleted: 4,
    milestonesInProgress: 2,
    activeProjects: 3,
    avgCompletionDays: 9.2,
  },
  earningsTrend: [
    { date: "2026-06-15", amountXlm: "80.0000000" },
    { date: "2026-06-22", amountXlm: "100.0000000" },
    { date: "2026-07-01", amountXlm: "50.0000000" },
    { date: "2026-07-08", amountXlm: "150.0000000" },
  ],
};
