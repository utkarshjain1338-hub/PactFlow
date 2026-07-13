/**
 * PactFlow — Projects Page (Stub)
 */
import type { Metadata } from "next";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <DashboardShell
      title="Projects"
      breadcrumbs={[{ label: "Projects" }]}
    >
      <PageHeader
        title="Projects"
        description="Manage all your client projects and milestone-based contracts."
        actions={
          <Button size="sm" leftIcon={<Plus size={14} />}>
            New Project
          </Button>
        }
      />

      <EmptyState
        title="Projects will appear here"
        description="This view is ready for implementation. Business logic and backend integration will be added in the next milestone."
        illustration="default"
      />
    </DashboardShell>
  );
}
