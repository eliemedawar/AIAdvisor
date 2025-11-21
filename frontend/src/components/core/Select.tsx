import { forwardRef, SelectHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { FormFieldWrapper, baseInputClasses, errorInputClasses, defaultInputClasses } from "./FormField";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: ReactNode;
  error?: string;
}

/**
 * Select - Dropdown select component
 * 
 * Usage:
 * ```tsx
 * <Select label="Major" error={errors.major}>
 *   <option value="">Select...</option>
 *   <option value="cs">Computer Science</option>
 * </Select>
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, className, id, required, children, ...props }, ref) => {
    const selectId = id ?? props.name ?? undefined;

    return (
      <FormFieldWrapper
        label={label}
        helperText={helperText}
        error={error}
        htmlFor={selectId}
        required={required}
      >
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={clsx(
            baseInputClasses,
            error ? errorInputClasses : defaultInputClasses,
            className
          )}
          {...props}
        >
          {children}
        </select>
      </FormFieldWrapper>
    );
  }
);

Select.displayName = "Select";

