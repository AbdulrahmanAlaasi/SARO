import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import type { Order } from "../../../lib/types";
import { EmptyState, PageTitle, Spinner, StatusBadge } from "../../../components/ui";

export default function DriverOrders({ overview = false }: { overview?: boolean }) {
  const { t } = useTranslation();
  const { data = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders/")).data,
  });
  if (isLoading) return <Spinner />;
  const list = overview
    ? data.filter((o) => !["delivered", "failed"].includes(o.status))
    : data;

  return (
    <div>
      <PageTitle>{overview ? t("dash.driver") : t("drv.assigned")}</PageTitle>
      {list.length === 0 ? (
        <EmptyState text={t("drv.noAssigned")} />
      ) : (
        <div className="space-y-2">
          {list.map((o) => (
            <Link key={o.id} to={`/app/driver/orders/${o.id}`} className="card flex items-center justify-between p-4 hover:bg-navy-50">
              <div>
                <span className="font-medium">#{o.id}</span>
                <span className="ms-2 text-sm text-slate-500">{t(`dmethod.${o.delivery_method}`)}</span>
                {o.priority === "high" && <span className="ms-2 text-xs font-semibold text-status-failed">{t("prio.high")}</span>}
                {o.is_delayed && <span className="ms-2 text-xs text-status-failed">⚠</span>}
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
