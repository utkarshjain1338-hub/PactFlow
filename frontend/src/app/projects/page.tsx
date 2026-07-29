"use client";

/**
 * PactFlow — Projects Page
 * Interactive project directory with status tabs, keyword filtering, and Level 4 verification badges.
 */
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FolderKanban, Filter, CheckCircle2, Clock } from "lucide-react";
import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import { ProjectCard } from "@/components/pactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { type Project } from "@/types/domain";

type TabType = "ALL" | "IN_PROGRESS" | "DRAFT" | "COMPLETED";

export default function ProjectsPage() {
 const [activeTab, setActiveTab] = useState<TabType>("ALL");
 const [searchQuery, setSearchQuery] = useState("");
 const router = useRouter();

 const { data: projects = [], isLoading } = useQuery<Project[]>({
  queryKey: ["projects"],
  queryFn: () => apiClient.get("/projects"),
 });

 const filteredProjects = useMemo(() => {
  return projects.filter((p) => {
   const matchesTab =
    activeTab === "ALL" ||
    (activeTab === "IN_PROGRESS" && p.status === "ACTIVE") ||
    (activeTab === "DRAFT" && p.status === "DRAFT") ||
    (activeTab === "COMPLETED" && p.status === "COMPLETED");

   const query = searchQuery.toLowerCase().trim();
   const matchesSearch =
    !query ||
    p.title.toLowerCase().includes(query) ||
    (p.description && p.description.toLowerCase().includes(query));
   // Removing assignee and client name filter for simplicity unless present on DTO
   return matchesTab && matchesSearch;
  });
 }, [activeTab, searchQuery, projects]);

 const tabs: { id: TabType; label: string; count: number }[] = [
  { id: "ALL", label: "All Projects", count: projects.length },
  {
   id: "IN_PROGRESS",
   label: "In Progress",
   count: projects.filter((p) => p.status === "ACTIVE").length,
  },
  {
   id: "DRAFT",
   label: "Drafts",
   count: projects.filter((p) => p.status === "DRAFT").length,
  },
  {
   id: "COMPLETED",
   label: "Completed",
   count: projects.filter((p) => p.status === "COMPLETED").length,
  },
 ];

 return (
  <DashboardShell title="Projects" breadcrumbs={[{ label: "Projects" }]}>
   <PageHeader
    title="Projects & Escrow Marketplace"
    description="Manage active milestone contracts, monitor Level 4 hardware timelocks, and track deliverables."
    actions={
     <Button
      size="sm"
      variant="primary"
      leftIcon={<Plus size={14} />}
      onClick={() => router.push("/projects/new")}
     >
      Create Project
     </Button>
    }
   />

   <div className="space-y-6">
    {/* Filter & Search Bar */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-1 border border-border-subtle ">
     {/* Category Tabs */}
     <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
      {tabs.map((tab) => (
       <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
         activeTab === tab.id
          ? "bg-brand-500 text-primary-foreground shadow-brand-xs"
          : "bg-surface-2 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
        }`}
       >
        <span>{tab.label}</span>
        <span
         className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
          activeTab === tab.id
           ? "bg-surface-0 text-primary-foreground"
           : "bg-surface-0 text-text-tertiary"
         }`}
        >
         {tab.count}
        </span>
       </button>
      ))}
     </div>

     {/* Keyword Search */}
     <div className="relative w-full sm:w-72">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
      <input
       type="text"
       placeholder="Search by title, client or assignee..."
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-surface-0 border border-border-default focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 text-text-primary placeholder:text-text-disabled transition-all"
      />
     </div>
    </div>

    {/* Projects Grid */}
    <AnimatePresence mode="popLayout">
     {filteredProjects.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
       {filteredProjects.map((project, idx) => (
        <ProjectCard
         key={project.id}
         project={project}
         href={`/projects/${project.id}`}
        />
       ))}
      </div>
     ) : (
      <motion.div
       initial={{ opacity: 0, scale: 0.98 }}
       animate={{ opacity: 1, scale: 1 }}
       exit={{ opacity: 0, scale: 0.98 }}
      >
       <EmptyState
        title="No projects match your filter"
        description={
         searchQuery
          ? `No results found for "${searchQuery}". Try a different keyword.`
          : "There are no projects in this status category right now."
        }
        action={
         <Button size="sm" variant="outline" onClick={() => { setActiveTab("ALL"); setSearchQuery(""); }}>
          Reset Filters
         </Button>
        }
        illustration="search"
       />
      </motion.div>
     )}
    </AnimatePresence>
   </div>
  </DashboardShell>
 );
}
