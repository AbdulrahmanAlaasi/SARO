import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { Order } from "../../../lib/types";
import { EmptyState, Icon, Modal, PageTitle, SkeletonList, Spinner, StatusBadge } from "../../../components/ui";
import { useToast } from "../../../components/Toast";
import { OrderToolbar, useOrderFilter } from "../../../components/OrderToolbar";

interface Candidate { driver: number; driver_name: string; score: number; reason: string; }

export default function ManageOrders() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const filter = useOrderFilter();
  const [assigning, setAssigning] = useState<Order | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders/")).data,
  });
  const rows = filter.apply(data);

  return (
    <div>
      <PageTitle>{t("adm.manageOrders")}</PageTitle>
      {isLoading ? <SkeletonList /> : data.length === 0 ? <EmptyState text={t("cust.noOrders")} icon="package" /> : (
        <>
        <OrderToolbar filter={filter} />
        {rows.length === 0 ? <EmptyState text={t("ui.noResults")} icon="package" /> : (<>
        {/* Desktop table */}
        <div className="card hidden overflow-hidden p-0 sm:block">
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
              {rows.map((o, i) => (
                <tr key={o.id} className={`transition-colors hover:bg-navy-50 ${i % 2 ? "bg-slate-50/60" : ""}`}>
                  <td className="p-2 font-medium">#{o.id}</td>
                  <td className="p-2">{t(`dmethod.${o.delivery_method}`)}</td>
                  <td className="p-2"><span className="inline-flex items-center gap-1">{t(`prio.${o.priority}`)}{o.is_delayed && <Icon name="alert" className="h-3.5 w-3.5 text-status-failed" />}</span></td>
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
        {/* Mobile cards */}
        <div className="stagger space-y-2 sm:hidden">
          {rows.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">#{o.id}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-sm text-slate-500">{t(`dmethod.${o.delivery_method}`)} · {t(`prio.${o.priority}`)}{o.is_delayed && <Icon name="alert" className="ms-1 inline h-3.5 w-3.5 text-status-failed" />}</p>
              <p className="text-sm text-slate-500">{t("adm.driver")}: {o.driver_name || t("adm.noDriver")}</p>
              {["created", "assigned"].includes(o.status) && (
                <button className="btn-outline mt-3 w-full py-1.5 text-xs" onClick={() => setAssigning(o)}>{t("adm.assign")}</button>
              )}
            </div>
          ))}
        </div>
        </>)}
        </>
      )}
      {assigning && (
        <AssignModal order={assigning} onClose={() => setAssigning(null)}
          onAssigned={() => { qc.invalidateQueries({ queryKey: ["orders"] }); setAssigning(null); toast(t("toast.driverAssigned")); }} />
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
            <div className="flex items-center gap-2 rounded-md bg-accent/10 p-3 text-sm">
              <Icon name="star" className="h-4 w-4 fill-accent text-accent-600" />
              <span><span className="font-semibold text-accent-600">{t("adm.recommended")}: </span>
              {data.recommendation.driver_name} ({data.recommendation.score} {t("adm.score")})</span>
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
