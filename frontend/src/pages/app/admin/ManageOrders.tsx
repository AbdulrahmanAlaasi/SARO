import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { Order } from "../../../lib/types";
import { EmptyState, Modal, PageTitle, Spinner, StatusBadge } from "../../../components/ui";

interface Candidate { driver: number; driver_name: string; score: number; reason: string; }

export default function ManageOrders() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [assigning, setAssigning] = useState<Order | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders/")).data,
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageTitle>{t("adm.manageOrders")}</PageTitle>
      {data.length === 0 ? <EmptyState text={t("cust.noOrders")} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="p-2 text-start">#</th>
                <th className="p-2 text-start">{t("cust.method")}</th>
                <th className="p-2 text-start">{t("cust.priority")}</th>
                <th className="p-2 text-start">{t("adm.driver")}</th>
                <th className="p-2 text-start">{t("statusTitle")}</th>
                <th className="p-2 text-start">{t("ui.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o, i) => (
                <tr key={o.id} className={i % 2 ? "bg-navy-50" : ""}>
                  <td className="p-2 font-medium">#{o.id}</td>
                  <td className="p-2">{t(`dmethod.${o.delivery_method}`)}</td>
                  <td className="p-2">{t(`prio.${o.priority}`)}{o.is_delayed && <span className="ms-1 text-status-failed">⚠</span>}</td>
                  <td className="p-2">{o.driver_name || t("adm.noDriver")}</td>
                  <td className="p-2"><StatusBadge status={o.status} /></td>
                  <td className="p-2">
                    {["created", "assigned"].includes(o.status) && (
                      <button className="btn-outline py-1 text-xs" onClick={() => setAssigning(o)}>{t("adm.assign")}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {assigning && (
        <AssignModal order={assigning} onClose={() => setAssigning(null)}
          onAssigned={() => { qc.invalidateQueries({ queryKey: ["orders"] }); setAssigning(null); }} />
      )}
    </div>
  );
}

function AssignModal({ order, onClose, onAssigned }: { order: Order; onClose: () => void; onAssigned: () => void }) {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ["recommend", order.id],
    queryFn: async () => (await api.post("/dispatch/recommend/", { order: order.id })).data as { recommendation: Candidate | null; candidates: Candidate[] },
  });
  const assign = useMutation({
    mutationFn: async (driverId: number) => api.post(`/orders/${order.id}/assign/`, { driver: driverId }),
    onSuccess: onAssigned,
  });

  return (
    <Modal title={`${t("adm.assign")} · #${order.id}`} onClose={onClose}>
      {!data ? <Spinner /> : (
        <div className="space-y-2">
          {data.recommendation && (
            <div className="rounded-md bg-accent/10 p-3 text-sm">
              <span className="font-semibold text-accent-600">★ {t("adm.recommended")}: </span>
              {data.recommendation.driver_name} ({data.recommendation.score} {t("adm.score")})
            </div>
          )}
          {data.candidates.map((c) => (
            <div key={c.driver} className="flex items-center justify-between rounded-sm border border-slate-200 p-2 text-sm">
              <div>
                <p className="font-medium">{c.driver_name}</p>
                <p className="text-xs text-slate-500">{c.reason} · {c.score}</p>
              </div>
              <button className="btn-primary py-1 text-xs" disabled={assign.isPending} onClick={() => assign.mutate(c.driver)}>
                {t("adm.assign")}
              </button>
            </div>
          ))}
          {data.candidates.length === 0 && <EmptyState text={t("adm.noDriver")} />}
        </div>
      )}
    </Modal>
  );
}
