import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Order, OrderStatus } from "../lib/types";
import { Icon } from "./ui";

const STATUSES: OrderStatus[] = [
  "created", "assigned", "picked_up", "in_transit", "delivered", "failed",
];

export function useOrderFilter() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");

  const apply = (orders: Order[]) =>
    orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `#${o.id} ${o.delivery_method} ${o.customer_name ?? ""} ${o.driver_name ?? ""} ${o.package_description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

  return { query, setQuery, status, setStatus, apply };
}

export function OrderToolbar({ filter }: { filter: ReturnType<typeof useOrderFilter> }) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400">
          <Icon name="package" className="h-4 w-4" />
        </span>
        <input
          value={filter.query}
          onChange={(e) => filter.setQuery(e.target.value)}
          placeholder={t("ui.search")}
          className="w-full rounded-md border border-slate-200 ps-9 pe-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15"
        />
      </div>
      <select
        value={filter.status}
        onChange={(e) => filter.setStatus(e.target.value as OrderStatus | "")}
        className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy"
      >
        <option value="">{t("ui.filterStatus")}</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{t(`ostatus.${s}`)}</option>
        ))}
      </select>
    </div>
  );
}
