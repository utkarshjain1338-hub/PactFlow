"use client";

import React, { useState } from "react";
import { Shield, Key, Smartphone, Laptop, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleModal } from "@/components/ui/modal";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Removed MOCK_SESSIONS as no backend endpoint is available for active sessions
const activeSessions: any[] = [];

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    ),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecuritySettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.post("/auth/update-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password updated successfully");
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error("Failed to update password", {
        description: error.response?.data?.message || error.message || "Unknown error",
      });
    },
  });

  const onSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };

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
          <SimpleModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            title="Update Password"
            description="Enter your current password and a new secure password."
            trigger={<Button variant="outline">Update Password</Button>}
          >
            <form id="password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="text-[10px] text-red-500">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-[10px] text-red-500">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={updatePasswordMutation.isPending}>
                  {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </SimpleModal>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Active Sessions</h2>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" disabled>Revoke All</Button>
        </div>
        
        <div className="bg-surface-1 border border-border-subtle rounded-2xl p-8 flex flex-col items-center justify-center text-center">
           <Shield className="text-border-default mb-3" size={32} />
           <h3 className="text-sm font-medium text-text-primary">Session management unavailable</h3>
           <p className="text-xs text-text-secondary mt-1">Active session tracking is coming in a future update.</p>
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
