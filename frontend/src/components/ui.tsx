import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { OrderStatus } from "../lib/types";

/* ---------- Icons (Lucide-style, 24x24 stroke) ---------- */
const PATHS: Record<string, ReactNode> = {
  bell: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  alert: <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />,
  check: <path d="M20 6 9 17l-5-5" />,
  back: <path d="M19 12H5M12 19l-7-7 7-7" />,
  truck: <path d="M14 18V6a1 1 0 0 0-1-1H2v13M14 9h5l3 4v5h-2M2 18h2M9 18h6" />,
  box: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12l8.73-5.04M12 22V12" />,
  lock: <path d="M5 11h14a2 2 0 0 1 2 2v7H3v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4" />,
  wall: <path d="M4 21V8l8-5 8 5v13M4 12h16M9 21v-5h6v5" />,
  pin: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  package: <path d="M16.5 9.4 7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12l8.73-5.04M12 22V12" />,
  inbox: <path d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />,
};

export function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof PATHS | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name] ?? null}
    </svg>
  );
}

export const METHOD_ICON: Record<string, string> = {
  home: "truck", locker: "lock", home_box: "box", over_the_wall: "wall",
};

/* ---------- Feedback ---------- */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-8 text-navy">
      <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z" />
      </svg>
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
    </div>
  );
}

/* ---------- Layout primitives ---------- */
export function Card({ children, className = "", hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={`card p-5 ${hover ? "card-hover cursor-pointer" : ""} ${className}`}>{children}</div>;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="mb-4 text-2xl font-semibold tracking-tight text-navy animate-fade-up">{children}</h1>;
}

const STATUS_CLS: Record<OrderStatus, string> = {
  created: "bg-status-created/10 text-status-created",
  assigned: "bg-status-assigned/10 text-status-assigned",
  picked_up: "bg-status-pickedup/10 text-status-pickedup",
  in_transit: "bg-status-transit/10 text-status-transit",
  delivered: "bg-status-delivered/10 text-status-delivered",
  failed: "bg-status-failed/10 text-status-failed",
};
const STATUS_DOT: Record<OrderStatus, string> = {
  created: "bg-status-created", assigned: "bg-status-assigned", picked_up: "bg-status-pickedup",
  in_transit: "bg-status-transit", delivered: "bg-status-delivered", failed: "bg-status-failed",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {t(`ostatus.${status}`)}
    </span>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text, icon = "inbox" }: { text: string; icon?: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center text-slate-400 animate-fade-in">
      <Icon name={icon} className="h-10 w-10 opacity-50" />
      <p>{text}</p>
    </div>
  );
}
