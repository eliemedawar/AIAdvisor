import { ReactNode } from "react";
import clsx from "clsx";
import { Heading } from "./Typography";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** Use smaller heading (h3 vs h2) */
  small?: boolean;
  className?: string;
}

/**
 * SectionHeader - Consistent section heading with optional action
 * 
 * Uses 8pt spacing and responsive typography
 * 
 * Usage:
 * ```tsx
 * <SectionHeader 
 *   title="Upcoming Deadlines"
 *   subtitle="Next 7 days"
 *   action={<Button size="sm">View All</Button>}
 * />
 * ```
 */
export const SectionHeader = ({
  title,
  subtitle,
  action,
  small,
  className,
}: SectionHeaderProps) => {
  return (
    <div
      className={clsx(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div>
        <Heading level={small ? "h3" : "h2"} className="text-slate-100">
          {title}
        </Heading>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 lg:text-sm">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

