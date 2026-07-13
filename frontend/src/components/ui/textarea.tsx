/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable TextArea Component
 *
 * Requirements: Reusable, Accessible (WCAG 2.1 AA), Responsive, Dark Mode first.
 * Features: Character counter option, Error states, Helper text, Auto-grow / resizable.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  [
    "flex w-full rounded-lg bg-surface-1 text-text-primary text-sm p-3",
    "border border-border-default transition-all duration-200 ease-out",
    "placeholder:text-text-disabled",
    "focus-visible:outline-none focus-visible:border-border-brand focus-visible:ring-2 focus-visible:ring-brand-500/20",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-0",
  ],
  {
    variants: {
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
      status: {
        default: "border-border-default",
        error: "border-status-error focus-visible:border-status-error focus-visible:ring-status-error/20",
        success: "border-status-success focus-visible:border-status-success focus-visible:ring-status-success/20",
      },
    },
    defaultVariants: {
      resize: "vertical",
      status: "default",
    },
  }
);

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /** Helper text displayed below the textarea */
  helperText?: string;
  /** Error text displayed below the textarea (sets status="error") */
  errorText?: string;
  /** Maximum character limit displayed as a counter badge */
  maxLength?: number;
  /** Show character count indicator */
  showCount?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      resize,
      status,
      helperText,
      errorText,
      maxLength,
      showCount,
      value,
      defaultValue,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState<number>(() => {
      if (value !== undefined) return String(value).length;
      if (defaultValue !== undefined) return String(defaultValue).length;
      return 0;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) onChange(e);
    };

    const computedStatus = errorText ? "error" : status;
    const isOverLimit = maxLength !== undefined && charCount > maxLength;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <textarea
          className={cn(
            textareaVariants({ resize, status: isOverLimit ? "error" : computedStatus }),
            className
          )}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={computedStatus === "error" || isOverLimit}
          {...props}
        />

        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex-1">
            {errorText && (
              <p className="font-medium text-status-error animate-fade-in" role="alert">
                {errorText}
              </p>
            )}
            {!errorText && helperText && (
              <p className="text-text-tertiary">{helperText}</p>
            )}
          </div>

          {(showCount || maxLength !== undefined) && (
            <span
              className={cn(
                "font-mono flex-shrink-0 transition-colors",
                isOverLimit ? "text-status-error font-semibold" : "text-text-tertiary"
              )}
            >
              {charCount}{maxLength !== undefined ? ` / ${maxLength}` : ""}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export { TextArea, textareaVariants };
