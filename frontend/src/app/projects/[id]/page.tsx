"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useWalletKit } from "@/contexts/wallet-kit-context";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { type Project, type Milestone } from "@/types/domain";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
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

  const { data: myWallets = [] } = useQuery<any[]>({
    queryKey: ["my-wallets"],
    queryFn: () => apiClient.get("/users/me/wallets"),
  });

  const [freelancerEmailInput, setFreelancerEmailInput] = useState("");
  const [submitFormOpenId, setSubmitFormOpenId] = useState<string | null>(null);
  const [deliverableData, setDeliverableData] = useState({
    title: "",
    description: "",
    repositoryUrl: "",
    commitHash: "",
    fileUrl: ""
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
  const assignFreelancerMutation = useMutation({
    mutationFn: (freelancerEmail: string) => 
      apiClient.patch(`/projects/${id}`, { freelancerEmail: freelancerEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Freelancer assigned successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to assign freelancer", { description: error.message || "Unknown error" });
    }
  });

  const linkClientWalletMutation = useMutation({
    mutationFn: (walletId: string) => 
      apiClient.patch(`/projects/${id}/client-wallet`, { walletId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Client wallet linked successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to link wallet", { description: error.message || "Unknown error" });
    }
  });

  const linkFreelancerWalletMutation = useMutation({
    mutationFn: (walletId: string) => 
      apiClient.patch(`/projects/${id}/freelancer-wallet`, { walletId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Freelancer wallet linked successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to link wallet", { description: error.message || "Unknown error" });
    }
  });

  const initializeEscrowMutation = useMutation({
    mutationFn: async ({ milestoneId, existingEscrowId }: { milestoneId: string, existingEscrowId?: string }) => {
      let escrowId = existingEscrowId;
      if (!escrowId) {
        // Step 1: Create the escrow record in the DB
        const escrow = await apiClient.post(`/escrows?projectId=${id}&milestoneId=${milestoneId}`) as any;
        escrowId = escrow.id;
      }

      // Step 2: Build the initialize() Soroban transaction XDR
      const unsignedTx = await apiClient.post(`/escrows/${escrowId}/initialization-transaction`) as any;

      // Step 3: Sign with Freighter wallet
      const signedXdr = await signTransaction(unsignedTx.transactionXdr);

      // Step 4: Broadcast to Stellar Testnet
      await apiClient.post("/transactions", {
        escrowId: escrowId,
        signedXdr,
        operation: "INITIALIZE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-escrows", id] });
      toast.success("Escrow initialized on Stellar Testnet!");
    },
    onError: (error: any) => {
      toast.error("Failed to initialize escrow", { description: error.message || "Unknown error" });
    }
  });

  const activateProjectMutation = useMutation({
    mutationFn: () => apiClient.patch(`/projects/${id}`, { status: "ACTIVE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Project activated successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to activate project", { description: error.message || "Unknown error" });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => apiClient.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      router.push("/projects");
    },
    onError: (error: any) => {
      toast.error("Failed to delete project", { description: error.message || "Unknown error" });
    }
  });

  const fundMilestoneMutation = useMutation({
    mutationFn: async (escrowId: string) => {
      // 1. Get unsigned transaction XDR from backend (with Soroban simulation footprint)
      const unsignedTx = await apiClient.post(`/escrows/${escrowId}/funding-transaction`);
      
      // 2. Sign it with the user's Freighter wallet
      const signedXdr = await signTransaction((unsignedTx as any).transactionXdr);

      // 3. Send signedXdr to backend — backend broadcasts to Stellar Testnet and records the real hash
      await apiClient.post("/transactions", {
        escrowId,
        signedXdr,
        operation: "FUND"
      });
    },
    onSuccess: () => {
      toast.success("Funding transaction submitted! Waiting for blockchain confirmation...");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to fund milestone");
    }
  });

  const submitDeliverableMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const response = await apiClient.post(`/projects/${id}/milestones/${milestoneId}/submit`, deliverableData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["project-milestones", id] });
      queryClient.invalidateQueries({ queryKey: ["project-escrows", id] });
      setSubmitFormOpenId(null);
      setDeliverableData({ title: "", description: "", repositoryUrl: "", commitHash: "", fileUrl: "" });
      toast.success("Deliverable submitted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to submit deliverable");
    },
  });

  const startReviewMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const response = await apiClient.post(`/projects/${id}/milestones/${milestoneId}/review`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["project-milestones", id] });
      queryClient.invalidateQueries({ queryKey: ["project-escrows", id] });
      toast.success("Review started");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to start review");
    },
  });

  const approveMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const response = await apiClient.post(`/projects/${id}/milestones/${milestoneId}/approve`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["project-milestones", id] });
      queryClient.invalidateQueries({ queryKey: ["project-escrows", id] });
      toast.success("Milestone approved");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to approve milestone");
    },
  });

  const releasePaymentMutation = useMutation({
    mutationFn: async (escrowId: string) => {
      const unsignedTx = await apiClient.post(`/escrows/${escrowId}/release`);
      const signedXdr = await signTransaction((unsignedTx as any).transactionXdr);
      
      await apiClient.post("/transactions", {
        escrowId,
        signedXdr,
        operation: "RELEASE"
      });
    },
    onSuccess: () => {
      toast.success("Release transaction submitted! Waiting for blockchain confirmation...");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to release payment");
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
  const isFreelancerUser = profile?.id === project.freelancerUserId;
  const primaryWallet = myWallets.find((w: any) => w.isPrimary);

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
                  const isPending = escrow?.status === "CREATED" || escrow?.status === "PENDING_FUNDING";
                  const isFunded = escrow?.status === "FUNDED";
                  const isPostFunded = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "DISPUTED", "RELEASED"].includes(escrow?.status);
                  
                  return (
                    <div key={milestone.id} className="bg-surface-2 rounded-xl border border-border-default overflow-hidden"><div className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-text-primary text-sm">{milestone.title}</h4>
                        <div className="text-text-secondary text-xs mt-1">{milestone.description}</div>
                        <div className="mt-2 text-xs font-mono text-text-tertiary">{milestone.amountXlm} XLM</div>
                      </div>
                      <div>
                        {!isEscrowCreated || escrow?.status === "CREATED" ? (
                          isClientUser && project.isEscrowReady ? (
                            <Button 
                              size="sm" 
                              onClick={() => initializeEscrowMutation.mutate({ milestoneId: milestone.id, existingEscrowId: escrow?.id })}
                              disabled={initializeEscrowMutation.isPending}
                            >
                              {initializeEscrowMutation.isPending && initializeEscrowMutation.variables?.milestoneId === milestone.id 
                                ? "Processing..." 
                                : escrow?.status === "CREATED" ? "Retry Initialize" : "Initialize Escrow"}
                            </Button>
                          ) : (
                            <Badge variant="secondary">Pending Escrow</Badge>
                          )
                        ) : isFunded ? (
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="success">Funded</Badge>
                            {isFreelancerUser && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSubmitFormOpenId(submitFormOpenId === milestone.id ? null : milestone.id)}
                              >
                                {submitFormOpenId === milestone.id ? "Cancel" : "Submit Deliverable"}
                              </Button>
                            )}
                          </div>
                        ) : isPostFunded ? (
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="uppercase">{escrow?.status.replace('_', ' ')}</Badge>
                            {isClientUser && escrow?.status === "SUBMITTED" && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => startReviewMutation.mutate(milestone.id)}
                                disabled={startReviewMutation.isPending}
                              >
                                {startReviewMutation.isPending ? "Starting..." : "Start Review"}
                              </Button>
                            )}
                            {isClientUser && escrow?.status === "UNDER_REVIEW" && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => approveMilestoneMutation.mutate(milestone.id)}
                                disabled={approveMilestoneMutation.isPending}
                              >
                                {approveMilestoneMutation.isPending ? "Approving..." : "Approve"}
                              </Button>
                            )}
                            {isClientUser && escrow?.status === "APPROVED" && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => releasePaymentMutation.mutate(escrow.id)}
                                disabled={releasePaymentMutation.isPending || !wallet.address}
                              >
                                {releasePaymentMutation.isPending ? "Releasing..." : "Release Payment"}
                              </Button>
                            )}
                          </div>
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
                    {submitFormOpenId === milestone.id && (
                      <div className="mt-4 pt-4 border-t border-border-default space-y-4">
                        <h5 className="font-semibold text-sm">Submit Deliverable</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input 
                            placeholder="Deliverable Title" 
                            value={deliverableData.title}
                            onChange={(e) => setDeliverableData({ ...deliverableData, title: e.target.value })}
                          />
                          <Input 
                            placeholder="Description" 
                            value={deliverableData.description}
                            onChange={(e) => setDeliverableData({ ...deliverableData, description: e.target.value })}
                          />
                          <Input 
                            placeholder="Repository URL" 
                            value={deliverableData.repositoryUrl}
                            onChange={(e) => setDeliverableData({ ...deliverableData, repositoryUrl: e.target.value })}
                          />
                          <Input 
                            placeholder="Commit Hash" 
                            value={deliverableData.commitHash}
                            onChange={(e) => setDeliverableData({ ...deliverableData, commitHash: e.target.value })}
                          />
                          <Input 
                            placeholder="File URL (Optional)" 
                            className="md:col-span-2"
                            value={deliverableData.fileUrl}
                            onChange={(e) => setDeliverableData({ ...deliverableData, fileUrl: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end pt-2">
                          <Button 
                            size="sm"
                            variant="primary"
                            onClick={() => submitDeliverableMutation.mutate(milestone.id)}
                            disabled={submitDeliverableMutation.isPending || !deliverableData.title || !deliverableData.description || !deliverableData.repositoryUrl || !deliverableData.commitHash}
                          >
                            {submitDeliverableMutation.isPending ? "Submitting..." : "Submit for Review"}
                          </Button>
                        </div>
                      </div>
                    )}
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
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === "ACTIVE" ? "success" : "default"}>{project.status}</Badge>
                  {isClientUser && project.status === "DRAFT" && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => activateProjectMutation.mutate()}
                        disabled={activateProjectMutation.isPending}
                      >
                        Activate Project
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this project?")) {
                            deleteProjectMutation.mutate();
                          }
                        }}
                        disabled={deleteProjectMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
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
                {project.clientWalletId ? (
                  <div className="font-mono truncate">{project.clientWalletId}</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="font-mono truncate text-text-tertiary">Not linked</div>
                    {isClientUser && primaryWallet && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={linkClientWalletMutation.isPending}
                        onClick={() => linkClientWalletMutation.mutate(primaryWallet.id)}
                      >
                        Link My Primary Wallet
                      </Button>
                    )}
                    {isClientUser && !primaryWallet && (
                      <div className="text-xs text-status-warning">You need to verify a wallet in your profile first.</div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="text-text-secondary mb-1">Freelancer</div>
                {project.freelancerUserId ? (
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-text-tertiary">User ID</div>
                      <div className="font-mono truncate text-brand-400">{project.freelancerUserId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary">Wallet ID</div>
                      {project.freelancerWalletId ? (
                        <div className="font-mono truncate">{project.freelancerWalletId}</div>
                      ) : (
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="font-mono truncate text-text-tertiary">Not linked</div>
                          {isFreelancerUser && primaryWallet && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={linkFreelancerWalletMutation.isPending}
                              onClick={() => linkFreelancerWalletMutation.mutate(primaryWallet.id)}
                            >
                              Link My Primary Wallet
                            </Button>
                          )}
                          {isFreelancerUser && !primaryWallet && (
                            <div className="text-xs text-status-warning">You need to verify a wallet in your profile first.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  isClientUser ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-text-tertiary">Not assigned yet. Assign now:</div>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Freelancer Email" 
                          value={freelancerEmailInput}
                          onChange={(e) => setFreelancerEmailInput(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Button 
                          size="sm" 
                          disabled={!freelancerEmailInput || assignFreelancerMutation.isPending}
                          onClick={() => assignFreelancerMutation.mutate(freelancerEmailInput)}
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono truncate text-text-tertiary">Not Assigned</div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
