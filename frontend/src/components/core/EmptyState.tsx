import { ReactNode, ReactElement, cloneElement, isValidElement } from "react";
import clsx from "clsx";

interface EmptyStateProps {
  icon?: ReactElement;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
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
}: EmptyStateProps) => {
  const renderIcon = () => {
    if (!icon || !isValidElement(icon)) return null;

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
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      {renderIcon()}
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-400 text-balance">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

