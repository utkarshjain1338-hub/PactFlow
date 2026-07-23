/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { apiClient, setAccessToken } from "@/lib/api-client";

// ── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  accountType: "COMPANY" | "FREELANCER" | "ADMIN";
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, accountType: string) => Promise<void>;
  logout: () => Promise<void>;
}

const REFRESH_TOKEN_KEY = "pactflow_refresh";
const USER_KEY = "pactflow_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session from stored refresh token on mount
  useEffect(() => {
    const restore = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!refreshToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Exchange refresh token for a new access token
        const data = await apiClient.post<any>(
          "/auth/refresh",
          { refreshToken },
          { skipAuth: true }
        );
        setAccessToken(data.accessToken);
        setUser(JSON.parse(storedUser));
        // Persist the rotated refresh token
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      } catch {
        // Refresh failed — clear stale session
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient.post<any>(
      "/auth/login",
      { email, password },
      { skipAuth: true }
    );
    setAccessToken(data.accessToken);
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      accountType: data.user.accountType,
      avatarUrl: data.user.avatarUrl ?? null,
    };
    setUser(authUser);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string, accountType: string) => {
      const data = await apiClient.post<any>(
        "/auth/register",
        { email, password, displayName, accountType },
        { skipAuth: true }
      );
      setAccessToken(data.accessToken);
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName,
        accountType: data.user.accountType,
        avatarUrl: data.user.avatarUrl ?? null,
      };
      setUser(authUser);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Best-effort
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
