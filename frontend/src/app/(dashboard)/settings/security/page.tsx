"use client";

import React from "react";
import { Shield, Key, Smartphone, Laptop, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_SESSIONS = [
  { id: "1", device: "MacBook Pro M3", browser: "Chrome 122", location: "San Francisco, CA", ip: "192.168.1.1", current: true, time: "Active now" },
  { id: "2", device: "iPhone 15 Pro", browser: "Safari Mobile", location: "San Francisco, CA", ip: "192.168.1.5", current: false, time: "2 hours ago" },
  { id: "3", device: "Windows PC", browser: "Firefox 120", location: "London, UK", ip: "85.23.11.90", current: false, time: "3 days ago" },
];

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Security & Access</h1>
        <p className="text-sm text-text-tertiary mt-1">Manage your sessions, passwords, and two-factor authentication.</p>
      </div>

      {/* Password Section */}
      <div className="space-y-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-text-primary">Password</h2>
        <div className="bg-surface-1 p-6 rounded-2xl border border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Change Password</p>
            <p className="text-xs text-text-tertiary mt-1">Ensure your account is using a long, random password to stay secure.</p>
          </div>
          <Button variant="outline">Update Password</Button>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Active Sessions</h2>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">Revoke All</Button>
        </div>
        
        <div className="bg-surface-1 border border-border-subtle rounded-2xl divide-y divide-border-subtle">
          {MOCK_SESSIONS.map((session) => (
            <div key={session.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary">
                  {session.device.includes("iPhone") ? <Smartphone size={18} /> : <Laptop size={18} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                    {session.device}
                    {session.current && <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Current</span>}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {session.browser} • {session.ip} • {session.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-text-tertiary">{session.time}</span>
                {!session.current && (
                  <button className="text-xs font-medium text-red-500 hover:underline">Revoke</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MFA Section */}
      <div className="space-y-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-text-primary">Two-Factor Authentication</h2>
        <div className="bg-surface-1 p-6 rounded-2xl border border-border-subtle flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
            <Shield size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">Authenticator App</p>
            <p className="text-xs text-text-tertiary mt-1 mb-4 leading-relaxed">
              Use an app like 1Password or Google Authenticator to generate one-time codes when you log in.
            </p>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </div>
      </div>

    </div>
  );
}
