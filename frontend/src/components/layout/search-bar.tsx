"use client";

/**
 * PactFlow — Application Layout Components
 * Global Search Bar (`SearchBar` & Command Palette Modal)
 *
 * Requirements: Global Ctrl+K / Cmd+K shortcut, instant search input,
 * category filter tabs, live search over mock projects, freelancers, and companies.
 */
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
 Search,
 X,
 FolderKanban,
 User,
 Building2,
 ArrowRight,
 ShieldCheck,
 CornerDownLeft,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { MOCK_PROJECTS, MOCK_FREELANCERS, MOCK_COMPANIES } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

type SearchCategory = "all" | "projects" | "freelancers" | "companies";

export function SearchBar() {
 const router = useRouter();
 const [open, setOpen] = useState(false);
 const [query, setQuery] = useState("");
 const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
 const [selectedIndex, setSelectedIndex] = useState(0);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setMounted(true);
 }, []);

 // Keyboard shortcut Ctrl+K / Cmd+K
 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    setOpen((prev) => !prev);
   } else if (e.key === "Escape" && open) {
    setOpen(false);
   }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
 }, [open]);

 // Filter results across mock datasets based on query and active category
 const results = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const projectMatches =
   activeCategory === "all" || activeCategory === "projects"
    ? MOCK_PROJECTS.filter(
      (p) =>
       p.title.toLowerCase().includes(q) ||
       (p.description?.toLowerCase().includes(q) ?? false)
     ).map((p) => ({
      id: p.id,
      type: "project" as const,
      title: p.title,
      subtitle: `${formatCurrency(p.totalBudgetXlm, "XLM")} • ${p.status}`,
      badge: p.status,
      href: `/projects/${p.id}`,
      icon: FolderKanban,
     }))
    : [];

  const freelancerMatches =
   activeCategory === "all" || activeCategory === "freelancers"
    ? MOCK_FREELANCERS.filter(
      (f) =>
       f.displayName.toLowerCase().includes(q) ||
       f.title.toLowerCase().includes(q) ||
       f.skills.some((s) => s.toLowerCase().includes(q))
     ).map((f) => ({
      id: f.id,
      type: "freelancer" as const,
      title: f.displayName,
      subtitle: `${f.title} • ⭐ ${f.reputationScore}`,
      badge: `${f.completedProjectsCount} projects`,
      href: `/freelancers/${f.id}`,
      icon: User,
     }))
    : [];

  const companyMatches =
   activeCategory === "all" || activeCategory === "companies"
    ? MOCK_COMPANIES.filter(
      (c) =>
       c.name.toLowerCase().includes(q) ||
       c.industry.toLowerCase().includes(q)
     ).map((c) => ({
      id: c.id,
      type: "company" as const,
      title: c.name,
      subtitle: `${c.industry} • ${c.projectsCount} projects`,
      badge: c.verified ? "Verified" : "Unverified",
      href: `/companies/${c.id}`,
      icon: Building2,
     }))
    : [];

  return [...projectMatches, ...freelancerMatches, ...companyMatches];
 }, [query, activeCategory]);

 // Handle up/down/enter inside search modal
 const handleModalKeyDown = (e: React.KeyboardEvent) => {
  if (results.length === 0) return;
  if (e.key === "ArrowDown") {
   e.preventDefault();
   setSelectedIndex((prev) => (prev + 1) % results.length);
  } else if (e.key === "ArrowUp") {
   e.preventDefault();
   setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
  } else if (e.key === "Enter") {
   e.preventDefault();
   const selected = results[selectedIndex];
   if (selected) {
    setOpen(false);
    setQuery("");
    router.push(selected.href);
   }
  }
 };

 return (
  <>
   {/* Trigger button in TopNav */}
   <button
    onClick={() => setOpen(true)}
    className={cn(
     "flex items-center gap-2.5",
     "h-9 px-3.5 rounded-lg",
     "bg-surface-1 border border-border-subtle",
     "text-text-tertiary text-sm",
     "hover:border-border-default hover:text-text-secondary hover:bg-surface-2",
     "transition-all duration-150 select-none w-64 lg:w-72"
    )}
    aria-label="Open search command palette"
   >
    <Search size={15} className="text-text-tertiary shrink-0" />
    <span className="truncate flex-1 text-left">Search projects, escrow…</span>
    <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 bg-surface-2 rounded border border-border-default text-text-disabled shrink-0">
     ⌘K
    </kbd>
   </button>

   {/* Command Palette Modal */}
   {mounted && createPortal(
    <AnimatePresence>
     {open && (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       onClick={() => { setOpen(false); setQuery(""); }}
       className="fixed inset-0 bg-surface-ground/80 "
       aria-hidden="true"
      />

      {/* Modal Box */}
      <motion.div
       initial={{ opacity: 0, scale: 0.96, y: -16 }}
       animate={{ opacity: 1, scale: 1, y: 0 }}
       exit={{ opacity: 0, scale: 0.96, y: -16 }}
       transition={{ duration: 0.18, ease: "easeOut" }}
       onKeyDown={handleModalKeyDown}
       className={cn(
        "relative z-raised w-full max-w-xl overflow-hidden rounded-2xl",
        "glass shadow-2xl flex flex-col"
       )}
      >
       {/* Search input header */}
       <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle bg-surface-1">
        <Search size={18} className="text-brand-400 shrink-0" />
        <input
         autoFocus
         value={query}
         onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
         placeholder="Search across projects, milestones, freelancers, or escrow ID…"
         className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
        />
        {query && (
         <button
          onClick={() => setQuery("")}
          className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors"
         >
          <X size={14} />
         </button>
        )}
       </div>

       {/* Category tabs */}
       <div className="flex items-center gap-1 px-4 py-2 border-b border-border-subtle bg-surface-1 text-xs">
        {(["all", "projects", "freelancers", "companies"] as SearchCategory[]).map((cat) => (
         <button
          key={cat}
          onClick={() => { setActiveCategory(cat); setSelectedIndex(0); }}
          className={cn(
           "px-2.5 py-1 rounded-md font-medium transition-colors capitalize",
           activeCategory === cat
            ? "bg-brand-500 text-primary-foreground shadow-xs"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
          )}
         >
          {cat}
         </button>
        ))}
       </div>

       {/* Results list */}
       <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border-subtle/50">
        {!query.trim() ? (
         <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-text-tertiary">
          <ShieldCheck size={28} className="text-brand-500/40" />
          <p className="text-xs">Type a keyword to search PactFlow&apos;s Soroban escrow network</p>
         </div>
        ) : results.length === 0 ? (
         <div className="py-10 text-center text-xs text-text-tertiary">
          No matching {activeCategory !== "all" ? activeCategory : "records"} found for &quot;<span className="text-text-primary font-medium">{query}</span>&quot;
         </div>
        ) : (
         results.map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === selectedIndex;
          return (
           <Link
            key={`${item.type}-${item.id}`}
            href={item.href}
            onClick={() => { setOpen(false); setQuery(""); }}
            onMouseEnter={() => setSelectedIndex(index)}
            className={cn(
             "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all",
             isSelected ? "bg-brand-500/15 text-brand-300" : "hover:bg-surface-3 text-text-primary"
            )}
           >
            <div className="flex items-center gap-3 min-w-0">
             <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
              isSelected ? "bg-brand-500/30 text-brand-300" : "bg-surface-3 text-text-secondary"
             )}>
              <Icon size={16} />
             </div>
             <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{item.title}</p>
              <p className="text-[11px] text-text-tertiary truncate">{item.subtitle}</p>
             </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
             <Badge
              variant={isSelected ? "brand" : "secondary"}
              size="sm"
             >
              {item.badge}
             </Badge>
             <ArrowRight size={14} className={cn("transition-transform", isSelected ? "translate-x-0.5 text-brand-400" : "opacity-40")} />
            </div>
           </Link>
          );
         })
        )}
       </div>

       {/* Footer navigation hint */}
       <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle bg-surface-1 text-[11px] text-text-tertiary">
        <div className="flex items-center gap-3">
         <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-surface-2 rounded border border-border-default font-mono">↑</kbd>
          <kbd className="px-1 py-0.5 bg-surface-2 rounded border border-border-default font-mono">↓</kbd>
          <span>Navigate</span>
         </span>
         <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-surface-2 rounded border border-border-default font-mono flex items-center gap-0.5">
           <CornerDownLeft size={10} /> Enter
          </kbd>
          <span>Select</span>
         </span>
        </div>
        <span>ESC to close</span>
       </div>
      </motion.div>
     </div>
    )}
    </AnimatePresence>,
    document.body
   )}
  </>
 );
}
