import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Footer actions */
  footer?: ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Disable close on backdrop click */
  disableBackdropClose?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Modal - Overlay dialog component
 * 
 * Usage:
 * ```tsx
 * <Modal 
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Profile"
 *   footer={<Button onClick={save}>Save</Button>}
 * >
 *   <form>...</form>
 * </Modal>
 * ```
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  disableBackdropClose,
  className,
}: ModalProps) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const modalId = title ? `modal-${title.replace(/\s+/g, '-').toLowerCase()}` : 'modal';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={title ? `${modalId}-title` : undefined}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.24 }}
            onClick={disableBackdropClose ? undefined : onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.01 : 0.16,
              ease: [0.4, 0, 0.2, 1]
            }}
            className={clsx(
              "relative z-10 w-full rounded-2xl border border-slate-800/80",
              "bg-surface-overlay shadow-elevation-overlay backdrop-blur-xl",
              sizeClasses[size],
              className
            )}
            role="document"
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b border-slate-800/60 px-6 py-4">
                <h2 id={`${modalId}-title`} className="text-lg font-semibold text-slate-50">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-quick ease-snappy hover:bg-surface-elevated hover:text-slate-200 focus-visible:outline-none"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-slate-800/60 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

