import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { Calendar, BookOpen, Target, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: ReactNode;
}

const quickActions: QuickAction[] = [
  {
    id: "plan-week",
    label: "Plan week",
    prompt: "Help me plan my week based on my upcoming assignments, exams, and project milestones.",
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  {
    id: "review-schedule",
    label: "Today focus",
    prompt: "Review my schedule and tell me what I should focus on today.",
    icon: <Target className="h-3.5 w-3.5" />,
  },
  {
    id: "study-help",
    label: "Exam prep",
    prompt: "What's the best way to prepare for my upcoming exam? Outline a focused plan.",
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
  {
    id: "explain-concept",
    label: "Explain concept",
    prompt: "I need help understanding a concept from my course. Can you explain it in simple terms?",
    icon: <Lightbulb className="h-3.5 w-3.5" />,
  },
];

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * QuickActions - Quick action chips for common AI assistant flows
 * 
 * Features:
 * - Horizontal scrollable row on mobile
 * - Predefined prompts for common tasks
 * - Populates input textarea on click
 * - Brand styling with hover effects
 * 
 * Usage:
 * ```tsx
 * <QuickActions 
 *   onSelectAction={(prompt) => setInput(prompt)}
 *   disabled={loading}
 * />
 * ```
 */
export const QuickActions = ({
  onSelectAction,
  disabled = false,
  className,
}: QuickActionsProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={clsx(
        "flex flex-wrap gap-2 md:justify-end",
        className
      )}
    >
      {quickActions.map((action, index) => (
        <motion.button
          type="button"
          key={action.id}
          onClick={() => !disabled && onSelectAction(action.prompt)}
          disabled={disabled}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
          whileHover={
            disabled || prefersReducedMotion
              ? undefined
              : { y: -1, scale: 1.01 }
          }
          whileTap={
            disabled || prefersReducedMotion
              ? undefined
              : { scale: 0.97 }
          }
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-200/80 shadow-[0_8px_22px_rgba(2,6,23,0.35)] transition-all duration-quick ease-snappy hover:border-primary-400/40 hover:bg-primary-500/10 hover:text-white hover:shadow-[0_15px_35px_rgba(2,6,23,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={action.label}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-primary-200 transition-colors duration-quick ease-snappy group-hover:bg-primary-500/15 group-hover:text-white">
            {action.icon}
          </span>
          <span className="whitespace-nowrap">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

