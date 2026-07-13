/**
 * PactFlow — Global Loading Page (app/loading.tsx)
 * Shown by React Suspense during route transitions
 */
import React from "react";
import { SkeletonDashboard } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return (
    <div
      className="px-6 py-6 lg:px-8 lg:py-8 max-w-[1280px] mx-auto"
      aria-busy="true"
      aria-label="Loading page content"
    >
      <SkeletonDashboard />
    </div>
  );
}
