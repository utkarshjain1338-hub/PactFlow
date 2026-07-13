/**
 * PactFlow — Project Detail Page (Stub)
 * Registers the /projects/[id] route for typed route checking.
 */
import type { Metadata } from "next";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Project Details",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <DashboardShell
      title="Project"
      breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Detail" }]}
    >
      <PageHeader
        title="Project Details"
        description={`Project ID: ${id}`}
      />
      <EmptyState
        title="Project detail view"
        description="Full project detail with milestones, escrow status, and activity timeline will be implemented in the next milestone."
        illustration="default"
      />
    </DashboardShell>
  );
}
