"use client";

/**
 * PactFlow — Notifications Center Page
 * Manage system alerts, milestone submission reviews, and payment release confirmations.
 */
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, ShieldAlert, Send, Unlock, CheckCircle2, ArrowRight, Clock, Loader2 } from "lucide-react";
import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { timeAgo } from "@/lib/utils";
import { type Notification, type NotificationType } from "@/types/domain";
import { useDashboardData } from "@/hooks/use-dashboard-data";

type NotifTab = "ALL" | "UNREAD" | "MILESTONE" | "SYSTEM";

export default function NotificationsPage() {
  const { allEscrows, allMilestones, isLoading } = useDashboardData();
  const [activeTab, setActiveTab] = useState<NotifTab>("ALL");
  const [clearedIds, setClearedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Derive notifications from escrows and milestones
  const notifications = useMemo(() => {
    if (isLoading) return [];
    
    const derivedNotifs: Notification[] = [];
    
    allEscrows.forEach(e => {
      if (e.fundedAt) {
        derivedNotifs.push({
          id: `${e.id}-funded`,
          notificationType: "MILESTONE_FUNDED",
          title: "Escrow Funded",
          body: `Escrow for milestone was successfully funded with ${e.fundedAmount} XLM.`,
          actionUrl: `/projects/${e.projectId}`,
          isRead: false,
          createdAt: e.fundedAt,
        } as Notification);
      }
      if (e.releasedAt) {
        derivedNotifs.push({
          id: `${e.id}-released`,
          notificationType: "MILESTONE_PAID",
          title: "Payment Released",
          body: `Payment of ${e.fundedAmount} XLM has been released from escrow.`,
          actionUrl: `/projects/${e.projectId}`,
          isRead: false,
          createdAt: e.releasedAt,
        } as Notification);
      }
    });

    allMilestones.forEach(m => {
      if (m.status === "SUBMITTED") {
        derivedNotifs.push({
          id: `${m.id}-submitted`,
          notificationType: "MILESTONE_SUBMITTED",
          title: "Milestone Submitted",
          body: `Milestone "${m.title}" has been submitted for review.`,
          actionUrl: `/projects/${m.projectId}`,
          isRead: false,
          createdAt: m.updatedAt || m.createdAt,
        } as Notification);
      }
    });

    // Sort descending by date
    return derivedNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allEscrows, allMilestones, isLoading]);

  if (isLoading) {
    return (
      <DashboardShell title="Notifications" breadcrumbs={[{ label: "Notifications" }]}>
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500 w-8 h-8" /></div>
      </DashboardShell>
    );
  }

  // Filter out cleared ones and update read status
  const currentNotifs = notifications
    .filter(n => !clearedIds.has(n.id))
    .map(n => ({ ...n, isRead: n.isRead || readIds.has(n.id) }));

  const unreadCount = currentNotifs.filter((n) => !n.isRead).length;

  const filteredNotifications = currentNotifs.filter((n) => {
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "MILESTONE") return n.notificationType.startsWith("MILESTONE");
    if (activeTab === "SYSTEM") return !n.notificationType.startsWith("MILESTONE");
    return true;
  });

  const markAllRead = () => {
    setReadIds(new Set([...readIds, ...currentNotifs.map(n => n.id)]));
  };

  const toggleRead = (id: string) => {
    const next = new Set(readIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setReadIds(next);
  };

  const clearHistory = () => {
    setClearedIds(new Set([...clearedIds, ...currentNotifs.map(n => n.id)]));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "MILESTONE_SUBMITTED":
        return <Send size={16} className="text-brand-400" />;
      case "MILESTONE_PAID":
        return <Unlock size={16} className="text-status-success" />;
      case "MILESTONE_FUNDED":
        return <CheckCircle2 size={16} className="text-brand-300" />;
      case "MILESTONE_REFUNDED":
        return <ShieldAlert size={16} className="text-status-warning" />;
      default:
        return <Bell size={16} className="text-purple-400" />;
    }
  };

  const tabs: { id: NotifTab; label: string; count: number }[] = [
    { id: "ALL", label: "All Notifications", count: currentNotifs.length },
    { id: "UNREAD", label: "Unread", count: unreadCount },
    {
      id: "MILESTONE",
      label: "Milestone Updates",
      count: currentNotifs.filter((n) => n.notificationType.startsWith("MILESTONE")).length,
    },
    {
      id: "SYSTEM",
      label: "System & Security",
      count: currentNotifs.filter((n) => !n.notificationType.startsWith("MILESTONE")).length,
    },
  ];

  return (
    <DashboardShell title="Notifications" breadcrumbs={[{ label: "Notifications" }]}>
      <PageHeader
        title="Notifications Center"
        description="Stay updated on smart contract state changes, milestone deliverable submissions, and timelock alerts."
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={markAllRead} className="text-xs">
                <CheckCheck size={14} className="mr-1.5" />
                Mark all read
              </Button>
            )}
            {currentNotifs.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clearHistory} className="text-xs text-text-tertiary hover:text-status-error">
                <Trash2 size={14} className="mr-1.5" />
                Clear all
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 border-b border-border-subtle">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-brand-500 text-white shadow-brand-xs"
                  : "bg-surface-1 text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-surface-2 text-text-tertiary"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => toggleRead(notif.id)}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer select-none ${
                    !notif.isRead
                      ? "bg-surface-1/95 border-brand-500/40 shadow-xs"
                      : "bg-surface-1/60 border-border-subtle opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                          !notif.isRead
                            ? "bg-brand-500/15 border-brand-500/30 shadow-xs"
                            : "bg-surface-0 border-border-subtle"
                        }`}
                      >
                        {getIcon(notif.notificationType)}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-text-primary">{notif.title}</h4>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                          )}
                          <Badge variant="secondary" size="sm" className="font-sans text-[10px]">
                            {notif.notificationType.replace("_", " ")}
                          </Badge>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed">{notif.body}</p>

                        <div className="flex items-center justify-between gap-3 pt-2 text-[11px]">
                          <span className="text-text-tertiary flex items-center gap-1 font-mono">
                            <Clock size={11} />
                            {timeAgo(notif.createdAt)}
                          </span>

                          {notif.actionUrl && (
                            <Link
                              href={notif.actionUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors group"
                            >
                              <span>Take Action</span>
                              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <EmptyState
                title="No notifications here"
                description="You are all caught up on smart contract notifications in this category!"
                action={
                  activeTab !== "ALL" ? (
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("ALL")}>
                      View All Notifications
                    </Button>
                  ) : undefined
                }
                illustration="default"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
