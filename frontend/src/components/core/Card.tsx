import { forwardRef, HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type CardVariant = "default" | "elevated" | "inset" | "interactive" | "glass";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: clsx(
    "bg-surface-base border border-slate-800/60 ring-1 ring-inset ring-slate-950/40",
    "rounded-2xl shadow-elevation-low backdrop-blur-xl",
    "transition-all duration-base ease-smooth"
  ),
  elevated: clsx(
    "bg-surface-elevated border border-slate-700/70 ring-1 ring-inset ring-slate-950/30",
    "rounded-2xl shadow-elevation-mid backdrop-blur-xl",
    "transition-all duration-base ease-smooth"
  ),
  inset: clsx(
    "bg-surface-background border border-slate-800/40 ring-1 ring-inset ring-slate-950/40",
    "rounded-2xl shadow-inner",
    "transition-all duration-base ease-smooth"
  ),
  interactive: clsx(
    "bg-surface-base border border-slate-800/60 ring-1 ring-inset ring-slate-950/40",
    "rounded-2xl shadow-elevation-low backdrop-blur-xl cursor-pointer",
    "transition-all duration-quick ease-snappy",
    "hover:bg-surface-elevated hover:border-slate-700/80",
    "hover:shadow-elevation-mid hover:-translate-y-1",
    "active:translate-y-0 active:shadow-elevation-low",
    "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#a855f7,0_0_0_7px_rgba(168,85,247,0.25)]"
  ),
  glass: clsx(
    "bg-slate-900/30 border border-slate-800/50 ring-1 ring-inset ring-slate-950/40",
    "rounded-2xl backdrop-blur-xl",
    "transition-all duration-base ease-smooth"
  ),
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/**
 * Card - Container component with multiple variants
 * 
 * Uses 8pt padding scale (4px, 6px, 8px) and design system styling
 * 
 * Usage:
 * ```tsx
 * <Card variant="elevated" padding="md">
 *   Content
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

