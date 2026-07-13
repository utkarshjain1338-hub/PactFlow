/**
 * PactFlow — Global UI Store (Zustand)
 * Manages client-side UI state: sidebar, modals, theme, etc.
 * Does NOT store business/domain data (that lives in TanStack Query)
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ──
interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Mobile sidebar
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Active modal
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Theme (controlled by next-themes, this is just a mirror)
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

// ── Auth/Session State ──
interface SessionState {
  // Mocked for now — will be replaced by JWT auth
  userId: string | null;
  accountType: "COMPANY" | "FREELANCER" | "ADMIN" | null;
  activeRole: "COMPANY" | "FREELANCER" | "ADMIN" | null;
  currentUser: { displayName: string; email: string; avatarUrl?: string | null } | null;
  isAuthenticated: boolean;
  setSession: (userId: string, accountType: SessionState["accountType"]) => void;
  setRole: (role: SessionState["activeRole"]) => void;
  clearSession: () => void;
}

// ── Wallet State ──
interface WalletState {
  // Connected wallet (never stores private key — only public key)
  connectedPublicKey: string | null;
  walletProvider: string | null;
  isWalletConnected: boolean;
  setWallet: (publicKey: string, provider: string) => void;
  disconnectWallet: () => void;
}

// ── Combined Store ──
type StoreState = UIState & SessionState & WalletState;

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ── UI ──
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      activeModal: null,
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      theme: "dark",
      setTheme: (theme) => set({ theme }),

      // ── Session (placeholder — real auth in Milestone 2) ──
      userId: "01923abc-1234-7000-8000-000000000001",
      accountType: "COMPANY",
      activeRole: "COMPANY",
      currentUser: {
        displayName: "Stellar Ventures",
        email: "alex@stellarventures.io",
        avatarUrl: null,
      },
      isAuthenticated: true, // Mocked as true for UI dev
      setSession: (userId, accountType) =>
        set({ userId, accountType, activeRole: accountType, isAuthenticated: true }),
      setRole: (role) =>
        set({
          activeRole: role,
          accountType: role,
          currentUser:
            role === "FREELANCER"
              ? { displayName: "Alice Chen", email: "alice@chen.dev", avatarUrl: null }
              : { displayName: "Stellar Ventures", email: "alex@stellarventures.io", avatarUrl: null },
        }),
      clearSession: () =>
        set({ userId: null, accountType: null, activeRole: null, currentUser: null, isAuthenticated: false }),

      // ── Wallet (placeholder — real connection in Milestone 3) ──
      connectedPublicKey: null,
      walletProvider: null,
      isWalletConnected: false,
      setWallet: (publicKey, provider) =>
        set({
          connectedPublicKey: publicKey,
          walletProvider: provider,
          isWalletConnected: true,
        }),
      disconnectWallet: () =>
        set({
          connectedPublicKey: null,
          walletProvider: null,
          isWalletConnected: false,
        }),
    }),
    {
      name: "pactflow-ui-store",
      // Only persist non-sensitive UI preferences
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

// ── Selector hooks (avoid re-renders) ──
export const useSidebarCollapsed = () =>
  useAppStore((s) => s.sidebarCollapsed);

export const useToggleSidebar = () =>
  useAppStore((s) => s.toggleSidebar);

export const useActiveModal = () =>
  useAppStore((s) => ({ activeModal: s.activeModal, openModal: s.openModal, closeModal: s.closeModal }));

export const useSession = () =>
  useAppStore((s) => ({
    userId: s.userId,
    accountType: s.accountType,
    isAuthenticated: s.isAuthenticated,
  }));

export const useWallet = () =>
  useAppStore((s) => ({
    connectedPublicKey: s.connectedPublicKey,
    walletProvider: s.walletProvider,
    isWalletConnected: s.isWalletConnected,
    setWallet: s.setWallet,
    disconnectWallet: s.disconnectWallet,
  }));
