import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast } from "../components/core/Toast";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastData {
  id: string;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, description?: string, duration?: number) => void;
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, description?: string) => void;
  showWarning: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * ToastProvider - Manages toast notifications globally
 * 
 * Usage:
 * ```tsx
 * // In App.tsx or root component
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * 
 * // In any component
 * const { showSuccess, showError } = useToast();
 * showSuccess("Profile updated successfully!");
 * showError("Failed to save changes");
 * ```
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "info",
      description?: string,
      duration: number = 5000
    ) => {
      const id = Math.random().toString(36).substring(7);
      setToast({ id, message, description, variant, duration });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, description?: string) => {
      showToast(message, "success", description, 4000);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, description?: string) => {
      showToast(message, "error", description, 6000);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, description?: string) => {
      showToast(message, "warning", description, 5000);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, description?: string) => {
      showToast(message, "info", description, 5000);
    },
    [showToast]
  );

  const handleClose = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {toast && (
        <Toast
          isOpen={true}
          onClose={handleClose}
          message={toast.message}
          description={toast.description}
          variant={toast.variant}
          duration={toast.duration}
        />
      )}
    </ToastContext.Provider>
  );
};

/**
 * useToast - Hook to access toast notifications
 * 
 * @throws Error if used outside ToastProvider
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

