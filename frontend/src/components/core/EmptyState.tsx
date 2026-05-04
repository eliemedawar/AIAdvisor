import { ReactNode, ReactElement, cloneElement, isValidElement } from "react";
import clsx from "clsx";

interface EmptyStateProps {
  icon?: ReactElement;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** Compact mode: smaller icon, less vertical padding. Use inside dashboard cards. */
  compact?: boolean;
}

/**
 * EmptyState - Display for empty data states
 * 
 * Normalized visual language for blank slates:
 * - Monochrome line-icons with rounded container
 * - Short copy + optional action
 */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) => {
  const renderIcon = () => {
    if (!icon || !isValidElement(icon)) return null;

    if (compact) {
      return (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/40 text-primary-200/40">
          {cloneElement(icon, {
            className: clsx("h-6 w-6 stroke-[1.8]", icon.props.className),
            strokeWidth: icon.props.strokeWidth ?? 1.8,
          })}
        </div>
      );
    }

    return (
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/40 text-primary-200/40">
        {cloneElement(icon, {
          className: clsx("h-12 w-12 stroke-[1.8]", icon.props.className),
          strokeWidth: icon.props.strokeWidth ?? 1.8,
        })}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center px-6 text-center",
        compact ? "py-5" : "py-12",
        className
      )}
    >
      {renderIcon()}
      <h3 className={clsx("font-semibold text-slate-100", compact ? "text-sm" : "text-lg")}>{title}</h3>
      {description && (
        <p className={clsx("mt-1.5 max-w-sm text-slate-400 text-balance", compact ? "text-xs" : "text-sm mt-2")}>
          {description}
        </p>
      )}
      {action && <div className={compact ? "mt-3" : "mt-6"}>{action}</div>}
    </div>
  );
};

