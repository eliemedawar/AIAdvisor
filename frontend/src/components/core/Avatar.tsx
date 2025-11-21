import { ReactNode } from "react";
import clsx from "clsx";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  /** Display text (initials, single letter) */
  text?: string;
  /** Image URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Size variant */
  size?: AvatarSize;
  /** Custom icon/content */
  children?: ReactNode;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

/**
 * Avatar - User profile image or initial display
 * 
 * Usage:
 * ```tsx
 * <Avatar text="JD" size="md" />
 * <Avatar src="/profile.jpg" alt="John Doe" />
 * ```
 */
export const Avatar = ({
  text,
  src,
  alt = "",
  size = "md",
  children,
  className,
}: AvatarProps) => {
  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-primary-500 to-accent-500",
        "font-semibold text-white shadow-elevation-low",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
      ) : children ? (
        children
      ) : text ? (
        <span>{text}</span>
      ) : null}
    </div>
  );
};

