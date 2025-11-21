import { ReactNode } from "react";
import clsx from "clsx";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "accent" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Render as pill (fully rounded) */
  pill?: boolean;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-800/40 text-slate-300 border-slate-700/60",
  primary: "bg-primary-500/15 text-primary-300 border-primary-500/30",
  success: "bg-secondary-500/15 text-secondary-300 border-secondary-500/30",
  warning: "bg-warning-500/15 text-warning-300 border-warning-500/30",
  danger: "bg-danger-500/15 text-danger-300 border-danger-500/30",
  accent: "bg-accent-500/15 text-accent-300 border-accent-500/30",
  info: "bg-primary-500/15 text-primary-300 border-primary-500/30",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] leading-tight",
  md: "px-2.5 py-1 text-xs leading-snug",
};

/**
 * Badge - Status indicator and label
 * 
 * Usage:
 * ```tsx
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="warning" pill>Pending</Badge>
 * ```
 */
export const Badge = ({
  variant = "default",
  size = "sm",
  pill,
  children,
  className,
}: BadgeProps) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center border font-medium uppercase tracking-wide",
        pill ? "rounded-full" : "rounded-lg",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

interface ChipProps {
  onRemove?: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Chip - Removable tag/filter component
 * 
 * Usage:
 * ```tsx
 * <Chip onRemove={() => removeTag('react')}>React</Chip>
 * ```
 */
export const Chip = ({ onRemove, children, className }: ChipProps) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-slate-700/60",
        "bg-surface-elevated px-3 py-1.5 text-xs font-medium text-slate-200",
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-slate-700/60 transition-colors duration-quick ease-snappy focus-visible:outline-none"
          aria-label={`Remove ${children}`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

