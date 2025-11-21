import { ReactNode } from "react";
import clsx from "clsx";

interface PageShellProps {
  children: ReactNode;
  /** Apply tighter max-width for focused content (e.g. forms) */
  narrow?: boolean;
  /** Custom className for the container */
  className?: string;
}

/**
 * PageShell - Consistent page layout wrapper
 * 
 * Enforces:
 * - 8pt spacing rhythm (px-4/sm:px-6/lg:px-8, py-6/lg:py-8)
 * - Max content width (7xl standard, 3xl narrow)
 * - Vertical rhythm via space-y-6/lg:space-y-8
 * 
 * Usage:
 * ```tsx
 * <PageShell>
 *   <PageSection>...</PageSection>
 * </PageShell>
 * ```
 */
export const PageShell = ({ children, narrow, className }: PageShellProps) => {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-4 py-6",
        "sm:px-5 sm:py-6",
        "md:px-6 md:py-7",
        "lg:px-8 lg:py-8",
        "xl:px-12 xl:py-10",
        "2xl:px-16 2xl:py-12",
        narrow
          ? "max-w-3xl md:max-w-4xl xl:max-w-5xl"
          : "max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[88rem]",
        className
      )}
    >
      {children}
    </div>
  );
};

interface PageSectionProps {
  children: ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * PageSection - Vertical rhythm container
 * 
 * Wraps page content with consistent vertical spacing (8pt grid)
 */
export const PageSection = ({ children, className }: PageSectionProps) => {
  return (
    <div
      className={clsx(
        "space-y-6 md:space-y-7 lg:space-y-8 xl:space-y-10 2xl:space-y-12",
        className
      )}
    >
      {children}
    </div>
  );
};

