import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { OrderStatus } from "../lib/types";

export function Spinner() {
  return <div className="p-8 text-center text-navy">…</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="mb-4 text-2xl font-semibold text-navy">{children}</h1>;
}

const STATUS_CLS: Record<OrderStatus, string> = {
  created: "bg-status-created/10 text-status-created",
  assigned: "bg-status-assigned/10 text-status-assigned",
  picked_up: "bg-status-pickedup/10 text-status-pickedup",
  in_transit: "bg-status-transit/10 text-status-transit",
  delivered: "bg-status-delivered/10 text-status-delivered",
  failed: "bg-status-failed/10 text-status-failed",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`rounded-sm px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[status]}`}>
      {t(`ostatus.${status}`)}
    </span>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="card p-8 text-center text-slate-400">{text}</div>;
}
