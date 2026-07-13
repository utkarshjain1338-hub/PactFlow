import EscrowsPage from "@/app/escrows/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Milestones & Escrow | PactFlow",
  description: "Manage Soroban smart contract milestones and hardware timelocks.",
};

export default function MilestonesPage() {
  return <EscrowsPage />;
}
