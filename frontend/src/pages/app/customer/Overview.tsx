import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import type { Order } from "../../../lib/types";
import { Card, PageTitle, Spinner, StatusBadge, EmptyState } from "../../../components/ui";

export default function CustomerOverview() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders/")).data,
  });

  if (isLoading) return <Spinner />;
  const orders = data ?? [];
  const active = orders.filter((o) => !["delivered", "failed"].includes(o.status));

  return (
    <div>
      <PageTitle>{t("dash.customer")}</PageTitle>
      <div className="stagger mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-500">{t("cust.activeOrders")}</p><p className="text-3xl font-bold text-navy">{active.length}</p></Card>
        <Card><p className="text-sm text-slate-500">{t("cust.myOrders")}</p><p className="text-3xl font-bold text-navy">{orders.length}</p></Card>
        <Card className="flex items-center justify-center">
          <Link to="/app/customer/orders" className="btn-cta">{t("cust.newOrder")}</Link>
        </Card>
      </div>
      <h2 className="mb-2 font-semibold text-navy">{t("cust.recent")}</h2>
      {orders.length === 0 ? (
        <EmptyState text={t("cust.noOrders")} />
      ) : (
        <div className="stagger space-y-2">
          {orders.slice(0, 5).map((o) => (
            <Link key={o.id} to={`/app/customer/orders/${o.id}`} className="card card-hover flex items-center justify-between p-4">
              <span className="font-medium">#{o.id} · {t(`dmethod.${o.delivery_method}`)}</span>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
