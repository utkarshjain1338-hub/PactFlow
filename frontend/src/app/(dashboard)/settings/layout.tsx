import React from "react";
import Link from "next/link";
import { User, Shield, Bell, Key, CreditCard } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-8 py-8 px-4">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-sm font-semibold text-text-primary mb-4 px-2">Settings</h2>
        <nav className="flex flex-col space-y-1">
          <Link
            href="/settings/profile"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <User size={16} />
            General Profile
          </Link>
          <Link
            href="/settings/security"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <Shield size={16} />
            Security & Access
          </Link>
          <Link
            href="/settings/notifications"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <Bell size={16} />
            Notifications
          </Link>
          <Link
            href="/settings/keys"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <Key size={16} />
            API Keys
          </Link>
          <Link
            href="/billing"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <CreditCard size={16} />
            Billing & Payouts
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
