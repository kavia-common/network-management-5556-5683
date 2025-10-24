import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** Provides toast context to the application with add/remove methods. */
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'success', message }) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, type, message }]);
    // auto dismiss
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToastContext() {
  /** Access toast context functions. */
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within a ToastProvider');
  return ctx;
}
