import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton - Loading placeholder components
 * 
 * Usage:
 * ```tsx
 * <Skeleton className="h-4 w-32" />
 * <SkeletonCard />
 * ```
 */
export const Skeleton = ({ className }: SkeletonProps) => {
  return <div className={clsx("skeleton", className)} />;
};

export const SkeletonText = ({ className }: SkeletonProps) => {
  return <div className={clsx("skeleton h-4 w-full", className)} />;
};

export const SkeletonCard = ({ className }: SkeletonProps) => {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4",
        className
      )}
    >
      <div className="skeleton h-5 w-1/3" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-4/6" />
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 3, className }: SkeletonProps & { count?: number }) => {
  return (
    <div className={clsx("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4"
        >
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonAvatar = ({ className }: SkeletonProps) => {
  return <div className={clsx("skeleton h-10 w-10 rounded-full", className)} />;
};

/**
 * SkeletonChatMessage - Loading placeholder for chat messages
 */
export const SkeletonChatMessage = ({ isUser = false }: { isUser?: boolean }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] items-end gap-2.5 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="skeleton h-8 w-8 rounded-lg flex-shrink-0" />
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser ? "bg-primary-600/20" : "bg-slate-800/40"
          }`}
        >
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-4 w-32 mt-2" />
        </div>
      </div>
    </div>
  );
};

/**
 * SkeletonStatCard - Loading placeholder for stat cards
 */
export const SkeletonStatCard = ({ className }: SkeletonProps) => {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3 rounded-2xl border border-slate-800/60",
        "bg-slate-900/40 p-4 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-20" />
    </div>
  );
};

