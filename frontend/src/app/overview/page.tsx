import DashboardPage from "@/app/dashboard/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview | PactFlow",
  description: "Constellation of Trust dashboard overview and financial velocity.",
};

export default function OverviewPage() {
  return <DashboardPage />;
}
