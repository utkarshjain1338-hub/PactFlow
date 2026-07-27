"use client";

/**
 * PactFlow — Main Dashboard Page
 * Displays KPI stats, active projects, recent activity, quick actions
 */
import React from "react";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Milestone,
  TrendingUp,
  Wallet,
  ArrowRight,
  Clock,
  CheckCircle2,
  CircleDot,
  Zap,
  Plus,
} from "lucide-react";
import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MilestoneStatusBadge, ProjectStatusBadge } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivityTimeline } from "@/components/pactflow";
import {
  MOCK_PROJECTS,
  MOCK_MILESTONES,
  MOCK_ACTIVITY,
  MOCK_COMPANY_ANALYTICS,
} from "@/lib/mock-data";
import {
  cn,
  formatXlmCompact,
  timeAgo,
  getInitials,
  getProgress,
} from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CompanyAnalytics } from "@/types/domain";

// ── KPI Stats ──
function KPIGrid() {
  const analytics = MOCK_COMPANY_ANALYTICS as CompanyAnalytics;

  const stats = [
    {
      label: "Total Paid",
      value: formatXlmCompact(analytics.summary.totalPaidXlm),
      subValue: "lifetime payments",
      icon: <TrendingUp size={20} />,
      trend: { value: "+12% this month", direction: "up" as const },
    },
    {
      label: "In Escrow",
      value: formatXlmCompact(analytics.summary.totalLockedInEscrowXlm),
      subValue: "funds locked",
      icon: <Wallet size={20} />,
      trend: { value: "2 active contracts", direction: "neutral" as const },
    },
    {
      label: "Active Projects",
      value: String(analytics.summary.activeProjects),
      subValue: `${analytics.summary.projectsCompleted} completed`,
      icon: <FolderKanban size={20} />,
      trend: { value: "+1 this week", direction: "up" as const },
    },
    {
      label: "Milestones Done",
      value: String(analytics.summary.milestonesCompleted),
      subValue: "total completed",
      icon: <Milestone size={20} />,
      trend: { value: "On track", direction: "up" as const },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} animate animateDelay={i * 0.05} />
      ))}
    </div>
  );
}

// ── Active Projects List ──
function ProjectsList() {
  const router = useRouter();
  const activeProjects = MOCK_PROJECTS.filter(
    (p) => p.status === "ACTIVE" || p.status === "DRAFT"
  );

  if (activeProjects.length === 0) {
    return (
      <EmptyState
        title="No active projects"
        description="Create your first project to get started with milestone-based escrow payments."
        action={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => router.push("/projects/new")}>
            Create Project
          </Button>
        }
        size="sm"
      />
    );
  }

  return (
    <div className="space-y-3">
      {activeProjects.map((project, i) => {
        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-surface-1 border border-border-subtle rounded-xl p-4 hover:border-border-default transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ProjectStatusBadge status={project.status} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-300 transition-colors truncate">
                  {project.title}
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {formatXlmCompact(project.totalBudgetXlm)} budget
                </p>
              </div>
              <Link
                href={`/projects/${project.id}`}
                className="p-1.5 rounded-lg text-text-disabled hover:text-brand-400 hover:bg-brand-500/10 transition-all opacity-0 group-hover:opacity-100"
                aria-label={`Open ${project.title}`}
              >
                <ArrowRight size={14} />
              </Link>
            </div>
            {/* Progress omitted for brevity */}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Pending Milestones ──
function PendingMilestones() {
  const pending = MOCK_MILESTONES.filter(
    (m) => m.status === "SUBMITTED" || m.status === "FUNDED" || m.status === "IN_PROGRESS"
  );

  if (pending.length === 0) {
    return (
      <EmptyState
        title="No pending milestones"
        description="All milestones are up to date."
        size="sm"
        illustration="default"
      />
    );
  }

  return (
    <div className="space-y-2">
      {pending.map((milestone, i) => (
        <motion.div
          key={milestone.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-3 p-3 bg-surface-1 border border-border-subtle rounded-lg hover:border-border-default transition-all"
        >
          <div className="shrink-0 text-text-disabled">
            {milestone.status === "SUBMITTED" ? (
              <CheckCircle2 size={16} className="text-purple-400" />
            ) : milestone.status === "FUNDED" ? (
              <CircleDot size={16} className="text-blue-400" />
            ) : (
              <Clock size={16} className="text-yellow-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">
              {milestone.title}
            </p>
            <p className="text-[11px] text-text-tertiary">
              {formatXlmCompact(milestone.amountXlm)}
              {milestone.dueDate && ` · Due ${timeAgo(milestone.dueDate)}`}
            </p>
          </div>
          <MilestoneStatusBadge status={milestone.status} />
        </motion.div>
      ))}
    </div>
  );
}

// ── Activity Feed ──
function ActivityFeed() {
  if (MOCK_ACTIVITY.length === 0) {
    return (
      <EmptyState title="No recent activity" size="sm" illustration="default" />
    );
  }

  return <ActivityTimeline events={MOCK_ACTIVITY} />;
}

// ── Welcome Banner ──
function WelcomeBanner() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-brand-900/40 via-surface-1 to-surface-1",
        "border border-brand-500/20",
        "p-6"
      )}
    >
      {/* Decorative constellation */}
      <div className="absolute right-6 top-0 bottom-0 flex items-center pointer-events-none" aria-hidden>
        <svg width="120" height="100" viewBox="0 0 120 100" fill="none" opacity="0.15">
          <circle cx="60" cy="50" r="30" stroke="hsl(240, 84%, 60%)" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx="60" cy="20" r="3" fill="hsl(240, 84%, 60%)" />
          <circle cx="90" cy="50" r="2.5" fill="hsl(158, 64%, 52%)" />
          <circle cx="60" cy="80" r="3" fill="hsl(240, 84%, 60%)" />
          <circle cx="30" cy="50" r="2.5" fill="hsl(158, 64%, 52%)" />
          <circle cx="60" cy="50" r="6" fill="hsl(240, 84%, 60%)" opacity="0.3" />
          <line x1="60" y1="20" x2="90" y2="50" stroke="hsl(240, 84%, 60%)" strokeWidth="0.5" />
          <line x1="90" y1="50" x2="60" y2="80" stroke="hsl(240, 84%, 60%)" strokeWidth="0.5" />
          <line x1="60" y1="80" x2="30" y2="50" stroke="hsl(240, 84%, 60%)" strokeWidth="0.5" />
          <line x1="30" y1="50" x2="60" y2="20" stroke="hsl(240, 84%, 60%)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-brand-500/15 border border-brand-500/25 rounded-xl">
          <Zap size={20} className="text-brand-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary">
            {greeting}, Stellar Ventures 👋
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            You have{" "}
            <span className="text-yellow-400 font-medium">1 milestone awaiting your review</span>.{" "}
            Review and approve to release payment.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button size="sm" variant="primary">
          Review Submission
        </Button>
        <Button size="sm" variant="ghost">
          View All Milestones
        </Button>
      </div>
    </motion.div>
  );
}

// ── Dashboard Page ──
export default function DashboardPage() {
  const router = useRouter();
  
  return (
    <DashboardShell title="Dashboard">
      <PageHeader
        title="Overview"
        description="Track your projects, milestones, and escrow activity at a glance."
        actions={
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            variant="primary"
            onClick={() => router.push("/projects/new")}
          >
            New Project
          </Button>
        }
      />

      <div className="space-y-8">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* KPI Stats */}
        <Section title="Key Metrics">
          <KPIGrid />
        </Section>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active projects */}
          <div className="lg:col-span-2">
            <Section
              title="Active Projects"
              action={
                <Link
                  href="/projects"
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight size={11} />
                </Link>
              }
            >
              <ProjectsList />
            </Section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Section title="Pending Milestones">
              <PendingMilestones />
            </Section>

            <Section title="Recent Activity">
              <ActivityFeed />
            </Section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
