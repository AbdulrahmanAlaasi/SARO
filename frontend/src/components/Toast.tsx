import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Icon } from "./ui";

type ToastKind = "success" | "error" | "info";
interface Toast { id: number; kind: ToastKind; text: string; }

const ToastCtx = createContext<(text: string, kind?: ToastKind) => void>(() => {});

const KIND_CLS: Record<ToastKind, string> = {
  success: "border-status-delivered/30 text-status-delivered",
  error: "border-status-failed/30 text-status-failed",
  info: "border-navy/20 text-navy",
};
const KIND_ICON: Record<ToastKind, string> = {
  success: "check", error: "alert", info: "bell",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 end-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-md border bg-white px-4 py-3 text-sm font-medium shadow-hover animate-fade-up ${KIND_CLS[t.kind]}`}>
            <Icon name={KIND_ICON[t.kind]} className="h-4 w-4 shrink-0" />
            <span className="text-slate-800">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastCtx);
}
