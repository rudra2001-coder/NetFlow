'use client';

import React, { createContext, useContext, useState, useCallback, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts);
    });

    // Auto dismiss
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAllToasts }}>
      {children}
      <div
        className={cn(
          'fixed z-50 flex flex-col gap-2 pointer-events-none',
          positionClasses[position]
        )}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Toast Item Component
interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem = forwardRef<HTMLDivElement, ToastItemProps>(
  ({ toast, onDismiss }, ref) => {
    const icons: Record<ToastType, React.ReactNode> = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
      default: <Bell className="w-5 h-5" />,
    };

    const typeStyles: Record<ToastType, string> = {
      success: `
        bg-success-50 border-success-200 dark:bg-success-950/50 dark:border-success-800
        text-success-800 dark:text-success-200
      `,
      error: `
        bg-error-50 border-error-200 dark:bg-error-950/50 dark:border-error-800
        text-error-800 dark:text-error-200
      `,
      warning: `
        bg-warning-50 border-warning-200 dark:bg-warning-950/50 dark:border-warning-800
        text-warning-800 dark:text-warning-200
      `,
      info: `
        bg-info-50 border-info-200 dark:bg-info-950/50 dark:border-info-800
        text-info-800 dark:text-info-200
      `,
      default: `
        bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700
        text-neutral-800 dark:text-neutral-200
      `,
    };

    const iconStyles: Record<ToastType, string> = {
      success: 'text-success-600 dark:text-success-400',
      error: 'text-error-600 dark:text-error-400',
      warning: 'text-warning-600 dark:text-warning-400',
      info: 'text-info-600 dark:text-info-400',
      default: 'text-neutral-600 dark:text-neutral-400',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-auto w-80 sm:w-96 rounded-xl border shadow-lg',
          'p-4 animate-slideInRight',
          'backdrop-blur-sm',
          typeStyles[toast.type]
        )}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className={cn('flex-shrink-0 mt-0.5', iconStyles[toast.type])}>
            {icons[toast.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium underline hover:no-underline opacity-90 hover:opacity-100 transition-opacity"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          {toast.dismissible !== false && (
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

ToastItem.displayName = 'ToastItem';

// Toast Trigger Component - For showing toast on click
interface ToastTriggerProps {
  children: React.ReactNode;
  toast: Omit<Toast, 'id'>;
  className?: string;
}

export const ToastTrigger: React.FC<ToastTriggerProps> = ({
  children,
  toast,
  className,
}) => {
  const { addToast } = useToast();

  const handleClick = () => {
    addToast(toast);
  };

  return (
    <span onClick={handleClick} className={className}>
      {children}
    </span>
  );
};

// Utility functions for common toast types
export const toast = {
  success: (title: string, message?: string) => {
    // This will be used with useToast hook
    return { type: 'success' as const, title, message };
  },
  error: (title: string, message?: string) => {
    return { type: 'error' as const, title, message };
  },
  warning: (title: string, message?: string) => {
    return { type: 'warning' as const, title, message };
  },
  info: (title: string, message?: string) => {
    return { type: 'info' as const, title, message };
  },
};

export { ToastItem };
