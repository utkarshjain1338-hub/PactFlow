"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/", "/auth"];

/**
 * Guards all dashboard routes.
 * Unauthenticated users are redirected to /auth.
 * Authenticated users hitting /auth are redirected to /dashboard.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (!isAuthenticated && !isPublic) {
      router.replace("/auth");
    } else if (isAuthenticated && pathname === "/auth") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show nothing while session is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-text-tertiary">Restoring session…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
