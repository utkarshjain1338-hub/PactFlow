"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useWalletKit } from "@/contexts/wallet-kit-context";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { type Project, type Milestone } from "@/types/domain";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { wallet, signTransaction } = useWalletKit();
  const queryClient = useQueryClient();

  // Queries
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: () => apiClient.get(`/projects/${id}`),
  });

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["project-milestones", id],
    queryFn: () => apiClient.get(`/projects/${id}/milestones`),
  });

  const { data: escrows = [], isLoading: escrowsLoading } = useQuery<any[]>({
    queryKey: ["project-escrows", id],
    queryFn: () => apiClient.get(`/escrows?projectId=${id}`),
  });

  const { data: profile } = useQuery<any>({
    queryKey: ["auth-me"],
    queryFn: () => apiClient.get("/auth/me"),
  });

  // SSE setup
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let sseTimeout: NodeJS.Timeout | undefined;

    const connectSSE = async () => {
      try {
        const res = await apiClient.post("/events/ticket");
        const ticket = (res as any).ticket;
        eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/events/subscribe?ticket=${ticket}`);
        
        eventSource.onmessage = (e) => {
          const data = JSON.parse(e.data);
          if (data.entityId === id || data.type.startsWith("escrow")) {
            // Re-fetch everything
            queryClient.invalidateQueries({ queryKey: ["project", id] });
            queryClient.invalidateQueries({ queryKey: ["project-milestones", id] });
            queryClient.invalidateQueries({ queryKey: ["project-escrows", id] });
          }
        };
      } catch (err) {
        console.error("SSE connection failed", err);
      }
    };

    connectSSE();
    return () => {
      if (eventSource) eventSource.close();
      clearTimeout(sseTimeout);
    };
  }, [id, queryClient]);

  // Mutations
  const createEscrowMutation = useMutation({
    mutationFn: (milestoneId: string) => apiClient.post(`/escrows?projectId=${id}&milestoneId=${milestoneId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-escrows", id] });
    },
  });

  const fundMilestoneMutation = useMutation({
    mutationFn: async (escrowId: string) => {
      // 1. Get unsigned transaction
      const unsignedTx = await apiClient.post(`/escrows/${escrowId}/funding-transaction`);
      
      // 2. Sign it using Wallet Kit
      const signedXdr = await signTransaction((unsignedTx as any).transactionXdr);

      // 3. Submit back to backend
      await apiClient.post("/transactions", {
        escrowId,
        signedXdr,
        transactionHash: "simulate-" + Math.random().toString(36).substring(7),
        operation: "FUND"
      });
    },
    onSuccess: () => {
      toast.success("Funding transaction submitted! Waiting for network confirmation...");
    },
    onError: (error: any) => {
      toast.error("Funding failed", { description: error.message || "Unknown error" });
    }
  });

  if (projectLoading || milestonesLoading || escrowsLoading) {
    return (
      <DashboardShell title="Project" breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Detail" }]}>
        <div className="p-8 text-center text-text-tertiary">Loading project data...</div>
      </DashboardShell>
    );
  }

  if (!project) {
    return (
      <DashboardShell title="Project" breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Detail" }]}>
        <EmptyState title="Project Not Found" description="The project you requested does not exist." />
      </DashboardShell>
    );
  }

  const isClientUser = profile?.id === project.clientUserId;

  return (
    <DashboardShell
      title="Project"
      breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.title }]}
    >
      <PageHeader title={project.title} description={project.description || undefined} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface-1 border border-border-subtle shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.length === 0 ? (
                <div className="text-text-tertiary text-sm">No milestones found.</div>
              ) : (
                milestones.map((milestone) => {
                  const escrow = escrows.find(e => e.milestoneId === milestone.id);
                  const isEscrowCreated = !!escrow;
                  const isFunded = escrow?.status === "FUNDED" || escrow?.status === "RELEASED";
                  
                  return (
                    <div key={milestone.id} className="p-4 bg-surface-2 rounded-xl border border-border-default flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-text-primary text-sm">{milestone.title}</h4>
                        <div className="text-text-secondary text-xs mt-1">{milestone.description}</div>
                        <div className="mt-2 text-xs font-mono text-text-tertiary">{milestone.amountXlm} XLM</div>
                      </div>
                      <div>
                        {!isEscrowCreated ? (
                          isClientUser && project.isEscrowReady ? (
                            <Button 
                              size="sm" 
                              onClick={() => createEscrowMutation.mutate(milestone.id)}
                              disabled={createEscrowMutation.isPending}
                            >
                              Initialize Escrow
                            </Button>
                          ) : (
                            <Badge variant="secondary">Pending Escrow</Badge>
                          )
                        ) : isFunded ? (
                          <Badge variant="success">Funded</Badge>
                        ) : (
                          isClientUser ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => fundMilestoneMutation.mutate(escrow.id)}
                              disabled={fundMilestoneMutation.isPending || !wallet.address}
                            >
                              {fundMilestoneMutation.isPending ? "Processing..." : "Fund Milestone"}
                            </Button>
                          ) : (
                            <Badge variant="warning">Awaiting Funds</Badge>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-surface-1 border border-border-subtle shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-text-secondary">Status</span>
                <Badge variant={project.status === "ACTIVE" ? "success" : "default"}>{project.status}</Badge>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-text-secondary">Total Budget</span>
                <span className="font-mono">{project.totalBudgetXlm} XLM</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-text-secondary">Escrow Ready</span>
                <Badge variant={project.isEscrowReady ? "success" : "warning"}>{project.isEscrowReady ? "Yes" : "No"}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border border-border-subtle shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-text-secondary mb-1">Client Wallet ID</div>
                <div className="font-mono truncate">{project.clientWalletId || "Not linked"}</div>
              </div>
              <div>
                <div className="text-text-secondary mb-1">Freelancer Wallet ID</div>
                <div className="font-mono truncate">{project.freelancerWalletId || "Not linked"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
