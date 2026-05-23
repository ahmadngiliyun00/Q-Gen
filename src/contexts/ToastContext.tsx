import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (title: string, message: string, type: ToastType, action?: Toast['action']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: ToastType, action?: Toast['action']) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title, message, type, action }]);

    // Auto remove after 5 seconds if no action, or keep it longer if it has action so user can click? 
    // Let's keep the timeout but maybe make it 10 seconds if there's an action.
    setTimeout(() => {
      removeToast(id);
    }, action ? 10000 : 5000);
  };


  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div
                className={cn(
                  "bg-white rounded-xl shadow-2xl border-l-4 border-y border-r border-gray-100 p-4 flex items-start gap-4",
                  toast.type === 'error' && "border-l-red-500",
                  toast.type === 'success' && "border-l-green-500",
                  toast.type === 'info' && "border-l-blue-500"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    toast.type === 'error' && "bg-red-50 text-red-500",
                    toast.type === 'success' && "bg-green-50 text-green-500",
                    toast.type === 'info' && "bg-blue-50 text-blue-500"
                  )}
                >
                  {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                  {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
                  {toast.type === 'info' && <Info className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{toast.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {toast.message}
                  </p>
                  {toast.action && (
                    <button
                      onClick={() => {
                        toast.action?.onClick();
                        removeToast(toast.id);
                      }}
                      className="mt-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
