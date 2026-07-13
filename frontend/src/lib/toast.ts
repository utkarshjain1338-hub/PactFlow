/**
 * PactFlow — Toast Notification Utilities
 * Thin wrapper around Sonner for PactFlow-specific toast patterns
 */
import { toast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notify = {
  success: (title: string, options?: ToastOptions) =>
    toast.success(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    }),

  error: (title: string, options?: ToastOptions) =>
    toast.error(title, {
      description: options?.description,
      duration: options?.duration ?? 6000,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    }),

  warning: (title: string, options?: ToastOptions) =>
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration ?? 5000,
    }),

  info: (title: string, options?: ToastOptions) =>
    toast.info(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    }),

  loading: (title: string) => toast.loading(title),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),

  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

// Domain-specific notifications
export const notifyPaymentReleased = (amountXlm: string) =>
  notify.success(`${amountXlm} XLM released`, {
    description: "Payment has been released to the freelancer's wallet.",
    action: { label: "View TX", onClick: () => {} },
  });

export const notifyEscrowFunded = (amountXlm: string) =>
  notify.success(`${amountXlm} XLM secured in escrow`, {
    description: "Funds are now protected in the Soroban escrow contract.",
  });

export const notifyMilestoneSubmitted = () =>
  notify.info("Milestone submitted for review", {
    description: "The company will be notified to review your deliverables.",
  });
