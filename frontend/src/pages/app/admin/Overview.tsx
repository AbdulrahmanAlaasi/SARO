import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../../lib/api";
import type { KPIs } from "../../../lib/types";
import { Card, PageTitle, Spinner } from "../../../components/ui";

const STATUS_COLORS: Record<string, string> = {
  created: "#64748B", assigned: "#6366F1", picked_up: "#0EA5E9",
  in_transit: "#3B82F6", delivered: "#16A34A", failed: "#DC2626",
};

export default function AdminOverview() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["kpis"],
    queryFn: async () => (await api.get<KPIs>("/reports/kpis/")).data,
  });
  if (isLoading || !data) return <Spinner />;

  const statusData = Object.entries(data.by_status).map(([k, v]) => ({ name: t(`ostatus.${k}`), value: v, color: STATUS_COLORS[k] }));
  const methodData = Object.entries(data.by_method).map(([k, v]) => ({ name: t(`dmethod.${k}`), value: v }));

  return (
    <div>
      <PageTitle>{t("adm.kpis")}</PageTitle>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label={t("adm.totalOrders")} value={data.total_orders} />
        <Kpi label={t("adm.active")} value={data.active} />
        <Kpi label={t("adm.delivered")} value={data.delivered} />
        <Kpi label={t("adm.delayed")} value={data.delayed} accent />
        <Kpi label={t("adm.avgRating")} value={data.avg_rating} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="mb-2 font-semibold text-navy">{t("adm.byStatus")}</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p className="mb-2 font-semibold text-navy">{t("adm.byMethod")}</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={methodData}>
              <XAxis dataKey="name" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="#001F5F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-status-failed" : "text-navy"}`}>{value}</p>
    </Card>
  );
}
