import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { Plan, Subscription } from "../../../lib/types";
import { Card, Icon, PageTitle, Spinner } from "../../../components/ui";
import { useToast } from "../../../components/Toast";

export default function Subscriptions() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await api.get<Plan[]>("/plans/")).data,
  });
  const { data: subs = [] } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => (await api.get<Subscription[]>("/subscriptions/")).data,
  });
  const active = subs.find((s) => s.status === "active");

  const subscribe = useMutation({
    mutationFn: async (planId: number) => api.post("/subscriptions/", { plan: planId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subscriptions"] }); toast(t("toast.subscribed")); },
    onError: () => toast(t("toast.error"), "error"),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageTitle>{t("nav.subscriptions")}</PageTitle>
      <Card className="mb-4">
        <p className="text-sm text-slate-500">{t("cust.currentPlan")}</p>
        <p className="text-lg font-semibold text-navy">
          {active ? (i18n.language === "ar" && active.plan_detail.name_ar ? active.plan_detail.name_ar : active.plan_detail.name) : t("cust.noSub")}
        </p>
      </Card>
      <div className="stagger grid gap-3 sm:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} hover className="flex flex-col">
            <p className="text-lg font-semibold text-navy">{i18n.language === "ar" && p.name_ar ? p.name_ar : p.name}</p>
            <p className="my-2 text-2xl font-bold">{p.price} <span className="text-sm font-normal text-slate-500">SAR/{t(`adm.period`)}</span></p>
            <ul className="mb-3 flex-1 space-y-1 text-sm text-slate-600">
              {p.features.split("\n").filter(Boolean).map((f, i) => <li key={i}>• {f}</li>)}
            </ul>
            <button className="btn-primary" disabled={subscribe.isPending || active?.plan === p.id} onClick={() => subscribe.mutate(p.id)}>
              {active?.plan === p.id ? <Icon name="check" className="h-4 w-4" /> : t("cust.subscribe")}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
