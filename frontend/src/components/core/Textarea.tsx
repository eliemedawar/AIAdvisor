import { forwardRef, TextareaHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { FormFieldWrapper, baseInputClasses, errorInputClasses, defaultInputClasses } from "./FormField";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: ReactNode;
  error?: string;
}

/**
 * Textarea - Multi-line text input
 * 
 * Usage:
 * ```tsx
 * <Textarea 
 *   label="Notes" 
 *   rows={4}
 *   placeholder="Enter your notes..."
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className, id, required, rows = 4, ...props }, ref) => {
    const textareaId = id ?? props.name ?? undefined;

    return (
      <FormFieldWrapper
        label={label}
        helperText={helperText}
        error={error}
        htmlFor={textareaId}
        required={required}
      >
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={clsx(
            baseInputClasses,
            error ? errorInputClasses : defaultInputClasses,
            "resize-y min-h-[5rem]",
            className
          )}
          {...props}
        />
      </FormFieldWrapper>
    );
  }
);

Textarea.displayName = "Textarea";

