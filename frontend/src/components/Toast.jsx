import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, tone = 'ok') => {
    const id = Date.now();
    setToast({ id, message, tone });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4" style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}>
        {toast && (
          <div className="stop-in pointer-events-auto flex items-center gap-2 rounded-full bg-tinta px-5 py-3 text-sm font-medium text-white shadow-lg">
            {toast.tone === 'ok' ? <CheckCircle2 size={18} className="text-success-50" /> : <AlertCircle size={18} className="text-red-300" />}
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
