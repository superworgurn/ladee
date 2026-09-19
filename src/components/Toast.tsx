import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-emerald-200/80 bg-white/95 text-emerald-950 shadow-emerald-500/5',
  error: 'border-rose-200/80 bg-white/95 text-rose-950 shadow-rose-500/5',
  warning: 'border-amber-200/80 bg-white/95 text-amber-950 shadow-amber-500/5',
  info: 'border-sky-200/80 bg-white/95 text-sky-950 shadow-sky-500/5',
};

const TOAST_ICON_SVGS: Record<ToastType, ReactNode> = {
  success: (
    <div className="rounded-full bg-emerald-100 p-1 text-emerald-600">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  error: (
    <div className="rounded-full bg-rose-100 p-1 text-rose-600">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  warning: (
    <div className="rounded-full bg-amber-100 p-1 text-amber-600">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
  info: (
    <div className="rounded-full bg-sky-100 p-1 text-sky-600">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2.5 px-4 sm:inset-x-auto sm:right-6 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border p-3.5 text-sm font-medium shadow-xl backdrop-blur-md transition-all ${TOAST_STYLES[toast.type]}`}
            style={{ animation: 'toast-in 240ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="flex-shrink-0">{TOAST_ICON_SVGS[toast.type]}</div>
            <span className="flex-1 font-medium leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-in {
          from { 
            opacity: 0; 
            transform: translateY(-12px) scale(0.96); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast ต้องถูกใช้ภายใน <ToastProvider> เท่านั้น');
  }
  return ctx;
}