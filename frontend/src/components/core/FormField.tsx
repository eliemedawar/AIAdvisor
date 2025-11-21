import { ReactNode } from "react";
import clsx from "clsx";

interface FormFieldWrapperProps {
  label?: string;
  helperText?: ReactNode;
  error?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}

/**
 * FormFieldWrapper - Shared layout for form inputs
 * Handles label, helper text, error state with 8pt spacing
 */
export const FormFieldWrapper = ({
  label,
  helperText,
  error,
  htmlFor,
  required,
  children,
}: FormFieldWrapperProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-slate-200"
        >
          {label}
          {required && <span className="ml-1 text-danger-400">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-danger-400 animate-in fade-in slide-in-from-top-1 duration-150">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export const baseInputClasses = clsx(
  "w-full rounded-lg border bg-surface-base px-4 py-2.5 text-sm text-slate-50",
  "placeholder:text-slate-500 shadow-elevation-low backdrop-blur-sm",
  "transition-all duration-quick ease-snappy",
  "focus-visible:outline-none",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-background"
);

export const errorInputClasses = clsx(
  "border-danger-500/60 hover:border-danger-500/80",
  "focus-visible:border-danger-500 focus-visible:shadow-[0_0_0_2px_#ef4444,0_0_0_7px_rgba(239,68,68,0.2)]"
);

export const defaultInputClasses = clsx(
  "border-slate-700/60 hover:border-slate-600/80",
  "focus-visible:border-primary-500/50 focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]"
);

