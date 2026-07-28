import { useQuery, useQueries } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Project, Milestone } from "@/types/domain";

export function useDashboardData() {
  const { data: projects = [], isLoading: projectsLoading, isError: projectsError } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("/projects")
  });

  const activeProjects = projects.filter(p => !p.isDeleted);

  const milestoneQueries = useQueries({
    queries: activeProjects.map(p => ({
      queryKey: ["project-milestones", p.id],
      queryFn: () => apiClient.get(`/projects/${p.id}/milestones`),
      enabled: !!p.id,
    }))
  });

  const escrowQueries = useQueries({
    queries: activeProjects.map(p => ({
      queryKey: ["project-escrows", p.id],
      queryFn: () => apiClient.get(`/escrows?projectId=${p.id}`),
      enabled: !!p.id,
    }))
  });

  const milestonesLoading = milestoneQueries.some(q => q.isLoading);
  const escrowsLoading = escrowQueries.some(q => q.isLoading);
  
  const isError = projectsError || milestoneQueries.some(q => q.isError) || escrowQueries.some(q => q.isError);

  const allMilestones = milestoneQueries.flatMap(q => (q.data as Milestone[]) || []);
  const allEscrows = escrowQueries.flatMap(q => (q.data as any[]) || []);

  const totalPaidXlm = allEscrows.filter(e => e.status === "RELEASED").reduce((sum, e) => sum + (e.fundedAmount || 0), 0);
  const totalLockedInEscrowXlm = allEscrows.filter(e => e.status === "FUNDED" || e.status === "SUBMITTED" || e.status === "UNDER_REVIEW").reduce((sum, e) => sum + (e.fundedAmount || 0), 0);

  const milestonesCompleted = allMilestones.filter(m => m.status === "PAID").length;
  const projectsCompleted = projects.filter(p => p.status === "COMPLETED").length;
  
  // Pending milestones (in progress or need action)
  const pendingMilestones = allMilestones.filter(
    (m) => m.status === "SUBMITTED" || m.status === "FUNDED" || m.status === "IN_PROGRESS"
  );
  
  // Sort them so nearest deadline is first
  pendingMilestones.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return {
    projects,
    activeProjects,
    allMilestones,
    allEscrows,
    pendingMilestones,
    isLoading: projectsLoading || milestonesLoading || escrowsLoading,
    isError,
    stats: {
      totalPaidXlm,
      totalLockedInEscrowXlm,
      activeProjectsCount: activeProjects.length,
      projectsCompleted,
      milestonesCompleted,
      successRate: projects.length > 0 ? (projectsCompleted / projects.length) * 100 : 0
    }
  };
}
