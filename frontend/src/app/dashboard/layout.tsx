/**
 * PactFlow — Dashboard Layout
 * Wraps all /dashboard/* routes with DashboardShell
 */
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
