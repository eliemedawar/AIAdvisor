import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import clsx from "clsx";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  /** Controls toast visibility */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Toast message */
  message: string;
  /** Toast description */
  description?: string;
  /** Visual variant */
  variant?: ToastVariant;
  /** Auto-dismiss duration (ms). Set to 0 to disable */
  duration?: number;
}

const variantConfig: Record<ToastVariant, { icon: ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    classes: "bg-success-500/10 border-success-500/30 text-success-300",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" />,
    classes: "bg-danger-500/10 border-danger-500/30 text-danger-300",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    classes: "bg-warning-500/10 border-warning-500/30 text-warning-300",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    classes: "bg-info-500/10 border-info-500/30 text-info-300",
  },
};

/**
 * Toast - Temporary notification component
 * 
 * Usage:
 * ```tsx
 * <Toast 
 *   isOpen={showToast}
 *   onClose={() => setShowToast(false)}
 *   message="Profile updated"
 *   variant="success"
 *   duration={5000}
 * />
 * ```
 */
export const Toast = ({
  isOpen,
  onClose,
  message,
  description,
  variant = "info",
  duration = 5000,
}: ToastProps) => {
  const config = variantConfig[variant];

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Auto-dismiss
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const toastContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-start sm:justify-end sm:p-6"
          role="status"
          aria-live={variant === "error" ? "assertive" : "polite"}
          aria-atomic="true"
        >
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.01 : 0.2,
              ease: [0.25, 1, 0.5, 1]
            }}
            className={clsx(
              "pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-lg backdrop-blur-xl",
              config.classes
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{config.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{message}</p>
                {description && (
                  <p className="mt-1 text-xs opacity-90">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-lg opacity-70 transition-all duration-150 hover:opacity-100 hover:bg-white/10 focus-visible:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(toastContent, document.body);
};

