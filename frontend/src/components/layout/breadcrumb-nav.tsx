"use client";

/**
 * PactFlow — Application Layout Components
 * Dynamic Breadcrumb Navigation (`BreadcrumbNav`)
 *
 * Automatically resolves route pathnames into user-friendly breadcrumb trails
 * with fallback to mock data names when inspecting dynamic project IDs (`/projects/p-101`).
 */
import React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export interface BreadcrumbNavProps {
  /** Optional explicit breadcrumb override */
  items?: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  const pathname = usePathname();

  // If explicit items passed, render directly
  if (items && items.length > 0) {
    return <Breadcrumb items={items} className={className} />;
  }

  // Auto-generate trail from pathname
  if (!pathname || pathname === "/" || pathname === "/dashboard") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const resolvedItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard" },
  ];

  let currentPath = "";
  segments.forEach((segment, idx) => {
    currentPath += `/${segment}`;
    const isLast = idx === segments.length - 1;

    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    // Resolve dynamic IDs (e.g. "p-101" -> Project Title or "pactflow-escrow" -> Escrow Name)
    if (segment.startsWith("p-") || segment.startsWith("pr-") || /^\d+$/.test(segment)) {
      const foundProject = MOCK_PROJECTS.find((p) => p.id === segment);
      if (foundProject) {
        label = foundProject.title;
      } else {
        label = `Project #${segment.replace(/^p-/, "")}`;
      }
    } else if (segment === "projects") {
      label = "Projects";
    } else if (segment === "milestones") {
      label = "Milestones & Escrow";
    } else if (segment === "wallet") {
      label = "Stellar Wallet";
    } else if (segment === "analytics") {
      label = "Analytics Dashboard";
    } else if (segment === "notifications") {
      label = "Notifications";
    } else if (segment === "settings") {
      label = "Settings";
    }

    resolvedItems.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return <Breadcrumb items={resolvedItems} showHome={false} className={className} />;
}
