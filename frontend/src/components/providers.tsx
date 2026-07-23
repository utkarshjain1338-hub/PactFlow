"use client";

/**
 * PactFlow — Application Providers
 * Wraps the app with all required context providers:
 * - ThemeProvider (next-themes)
 * - QueryClientProvider (TanStack Query)
 * - Toast (Sonner)
 */
import React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toast";
import { WalletKitProvider } from "@/contexts/wallet-kit-context";

// ── QueryClient configuration ──
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus in development
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
        // Stale time: 30 seconds
        staleTime: 30 * 1000,
        // Cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests up to 2 times
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      },
      mutations: {
        // Don't retry mutations
        retry: 0,
      },
    },
  });
}

// Singleton on client, new instance per request on server
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: create once
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// ── Providers ──
interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <WalletKitProvider>
          {children}
        </WalletKitProvider>

        {/* Toast notification system */}
        <Toaster />

        {/* TanStack Query Devtools (development only) */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
