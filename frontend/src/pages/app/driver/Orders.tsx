import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import type { Order } from "../../../lib/types";
import { EmptyState, Icon, PageTitle, SkeletonList, StatusBadge } from "../../../components/ui";
import { OrderToolbar, useOrderFilter } from "../../../components/OrderToolbar";

export default function DriverOrders({ overview = false }: { overview?: boolean }) {
  const { t } = useTranslation();
  const filter = useOrderFilter();
  const { data = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders/")).data,
  });
  const base = overview
    ? data.filter((o) => !["delivered", "failed"].includes(o.status))
    : data;
  const list = overview ? base : filter.apply(base);

  return (
    <div>
      <PageTitle>{overview ? t("dash.driver") : t("drv.assigned")}</PageTitle>
      {!overview && base.length > 0 && <OrderToolbar filter={filter} />}
      {isLoading ? (
        <SkeletonList />
      ) : base.length === 0 ? (
        <EmptyState text={t("drv.noAssigned")} icon="truck" />
      ) : list.length === 0 ? (
        <EmptyState text={t("ui.noResults")} icon="package" />
      ) : (
        <div className="stagger space-y-2">
          {list.map((o) => (
            <Link key={o.id} to={`/app/driver/orders/${o.id}`} className="card card-hover flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">#{o.id}</span>
                <span className="text-sm text-slate-500">{t(`dmethod.${o.delivery_method}`)}</span>
                {o.priority === "high" && <span className="rounded-full bg-status-failed/10 px-2 py-0.5 text-xs font-semibold text-status-failed">{t("prio.high")}</span>}
                {o.is_delayed && <Icon name="alert" className="h-4 w-4 text-status-failed" />}
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
