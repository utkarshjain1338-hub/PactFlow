"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

interface ProfileFormData {
  displayName: string;
  timezone: string;
  bio: string;
  avatarUrl: string;
}

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: "",
      timezone: "UTC",
      bio: "",
      avatarUrl: "",
    }
  });

  useEffect(() => {
    if (user) {
      // Fetch full profile if needed, or use auth context
      apiClient.get<any>("/users/me").then(data => {
        reset({
          displayName: data.displayName || "",
          timezone: data.timezone || "UTC",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
        });
      }).catch(err => {
        // Fallback to minimal user info
        reset({
          displayName: user.displayName || "",
          timezone: "UTC",
          bio: "",
          avatarUrl: user.avatarUrl || "",
        });
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.patch("/users/me", data);
      toast.success("Profile updated successfully.");
      // Ideally we would mutate the user context here as well, 
      // but for MVP a reload or just success toast is sufficient if state is mostly server-driven
      reset(data); // reset isDirty
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountErasure = async () => {
    if (confirm("Are you sure you want to schedule your account for deletion? This action is irreversible.")) {
      try {
        await apiClient.delete("/users/me");
        toast.info("Account erasure requested. You will be logged out.");
        setTimeout(() => window.location.href = "/", 2000);
      } catch (err: any) {
        toast.error("Failed to request account erasure.");
      }
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">General Profile</h1>
        <p className="text-sm text-text-tertiary mt-1">Manage your personal information and preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="space-y-4 bg-surface-1 p-6 rounded-2xl border border-border-subtle">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Display Name</label>
            <input
              {...register("displayName", { required: "Display name is required", minLength: 2 })}
              className="bg-surface-2 border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
            />
            {errors.displayName && <span className="text-xs text-red-500">{errors.displayName.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Bio</label>
            <textarea
              {...register("bio", { maxLength: 1000 })}
              rows={4}
              className="bg-surface-2 border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Timezone</label>
            <input
              {...register("timezone")}
              className="bg-surface-2 border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
              placeholder="e.g. UTC, America/New_York"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Avatar URL</label>
            <input
              {...register("avatarUrl")}
              className="bg-surface-2 border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <div className="pt-10 border-t border-border-subtle max-w-2xl">
        <h2 className="text-lg font-semibold text-text-primary text-red-500">Danger Zone</h2>
        <p className="text-sm text-text-tertiary mt-1 mb-4">Irreversible and destructive actions.</p>
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-text-primary">Delete Account</h3>
            <p className="text-xs text-text-secondary mt-1">Permanently remove your personal data and projects.</p>
          </div>
          <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10" onClick={handleAccountErasure}>
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
