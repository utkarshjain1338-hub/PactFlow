"use client";

import { DashboardShell, PageHeader, Section } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { Project } from "@/types/domain";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    FileText,
    FolderKanban,
    Loader2,
    Plus,
    Trash2,
    Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// ── Validation Schemas ──
const milestoneSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(3000).optional(),
  amountXlm: z.preprocess((val) => Number(val), z.number().min(0.0000001, "Amount must be positive")),
  dueDate: z.string().min(1, "Due date is required"),
});

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().max(5000).optional(),
  totalBudgetXlm: z.preprocess((val) => Number(val), z.number().min(0.0000001, "Budget must be positive")),
  deadline: z.string().min(1, "Deadline is required"),
  assigneeEmail: z.string().email("Must be a valid email").optional().or(z.literal('')),
  milestones: z.array(milestoneSchema).min(1, "At least one milestone is required"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      totalBudgetXlm: 0,
      deadline: "",
      assigneeEmail: "",
      milestones: [
        {
          title: "Initial Milestone",
          description: "",
          amountXlm: 0,
          dueDate: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      
      // 1. Create the project
      const projectPayload = {
        title: data.title,
        description: data.description,
        totalBudgetXlm: data.totalBudgetXlm,
        deadline: data.deadline,
        ...(data.assigneeEmail && { assigneeEmail: data.assigneeEmail }),
      };

      const project = await apiClient.post<Project>("/projects", projectPayload);
      
      // 2. Create milestones sequentially
      for (let i = 0; i < data.milestones.length; i++) {
        const ms = data.milestones[i];
        const milestonePayload = {
          title: ms.title,
          description: ms.description,
          amountXlm: ms.amountXlm,
          sequenceOrder: i + 1,
          dueDate: ms.dueDate,
          strictDeadline: false,
        };
        await apiClient.post(`/projects/${project.id}/milestones`, milestonePayload);
      }

      toast.success("Project created successfully!", {
        description: "Your escrow contract is being staged.",
      });
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof ApiClientError) {
        toast.error("Failed to create project", {
          description: error.message,
        });
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="New Project"
      breadcrumbs={[
        { label: "Projects", href: "/projects" },
        { label: "New Project" },
      ]}
    >
      <PageHeader
        title="Create New Project"
        description="Configure a new milestone-based project. Once created, a Soroban smart contract will be staged for funding."
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft size={14} />}>
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl pb-10">
        <Section title="Project Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Project Title <span className="text-status-error">*</span>
              </label>
              <Input
                {...register("title")}
                placeholder="e.g. Next.js & Soroban DeFi Dashboard"
                errorText={errors.title?.message}
                leftIcon={<FolderKanban size={16} />}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <TextArea
                {...register("description")}
                placeholder="Describe the project scope, deliverables, and requirements..."
                errorText={errors.description?.message}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Total Budget (XLM) <span className="text-status-error">*</span>
              </label>
              <Input
                type="number"
                step="0.0000001"
                {...register("totalBudgetXlm")}
                placeholder="0.00"
                errorText={errors.totalBudgetXlm?.message}
                leftIcon={<Wallet size={16} />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Project Deadline <span className="text-status-error">*</span>
              </label>
              <Input
                type="date"
                {...register("deadline")}
                errorText={errors.deadline?.message}
                leftIcon={<Calendar size={16} />}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Assign Freelancer (Optional)
              </label>
              <Input
                {...register("assigneeEmail")}
                placeholder="freelancer@example.com"
                errorText={errors.assigneeEmail?.message}
              />
              <p className="text-xs text-text-tertiary mt-1.5">
                Leave blank to create a draft project that you can assign later.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Milestones">
          <p className="text-sm text-text-secondary mb-6">
            Break your project down into fundable milestones. Payments are held in Level 4 hardware enforced escrow until each milestone is approved.
          </p>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 rounded-2xl bg-surface-1/90 border border-border-subtle backdrop-blur-md relative group"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-status-error hover:bg-status-error/10 hover:text-status-error"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500/10 text-brand-400 text-xs font-mono">
                      {index + 1}
                    </span>
                    Milestone Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Title <span className="text-status-error">*</span>
                      </label>
                      <Input
                        {...register(`milestones.${index}.title` as const)}
                        placeholder="e.g. Backend API Setup"
                        errorText={errors.milestones?.[index]?.title?.message}
                        leftIcon={<FileText size={14} />}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Acceptance Criteria
                      </label>
                      <TextArea
                        {...register(`milestones.${index}.description` as const)}
                        placeholder="What needs to be delivered for this milestone to be approved?"
                        errorText={errors.milestones?.[index]?.description?.message}
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Amount (XLM) <span className="text-status-error">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.0000001"
                        {...register(`milestones.${index}.amountXlm` as const)}
                        placeholder="0.00"
                        errorText={errors.milestones?.[index]?.amountXlm?.message}
                        leftIcon={<Wallet size={14} />}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Due Date <span className="text-status-error">*</span>
                      </label>
                      <Input
                        type="date"
                        {...register(`milestones.${index}.dueDate` as const)}
                        errorText={errors.milestones?.[index]?.dueDate?.message}
                        leftIcon={<Calendar size={14} />}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 border-dashed py-6"
            onClick={() => append({ title: "", description: "", amountXlm: 0, dueDate: "" })}
            leftIcon={<Plus size={16} />}
          >
            Add Milestone
          </Button>

          {errors.milestones?.root && (
            <p className="mt-2 text-sm text-status-error">{errors.milestones.root.message}</p>
          )}
        </Section>

        <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Staging Project...
              </span>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
