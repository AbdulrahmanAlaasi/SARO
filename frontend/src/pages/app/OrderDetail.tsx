import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../lib/api";
import type { Order, OrderStatus } from "../../lib/types";
import { Card, Icon, PageTitle, Spinner, StatusBadge } from "../../components/ui";
import Conversation from "./Conversation";

const DRIVER_NEXT: Partial<Record<OrderStatus, { to: OrderStatus; key: string }[]>> = {
  assigned: [{ to: "picked_up", key: "drv.markPicked" }, { to: "failed", key: "drv.markFailed" }],
  picked_up: [{ to: "in_transit", key: "drv.markTransit" }, { to: "failed", key: "drv.markFailed" }],
  in_transit: [{ to: "delivered", key: "drv.markDelivered" }, { to: "failed", key: "drv.markFailed" }],
};

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [delayNote, setDelayNote] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.get<Order>(`/orders/${id}/`)).data,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["order", id] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  };
  const setStatus = useMutation({
    mutationFn: async (status: OrderStatus) => api.post(`/orders/${id}/status/`, { status }),
    onSuccess: invalidate,
  });
  const delay = useMutation({
    mutationFn: async () => api.post(`/orders/${id}/delay/`, { note: delayNote }),
    onSuccess: invalidate,
  });
  const rate = useMutation({
    mutationFn: async () => api.post(`/orders/${id}/rate/`, { stars, comment }),
    onSuccess: invalidate,
  });

  if (isLoading || !order) return <Spinner />;
  const isDriver = user?.role === "driver";
  const isCustomer = user?.role === "customer";
  const driverActions = DRIVER_NEXT[order.status] ?? [];

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-3 inline-flex cursor-pointer items-center gap-1 text-sm text-navy transition hover:gap-2">
        <Icon name="back" className="h-4 w-4" />{t("ui.back")}
      </button>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>#{order.id} · {t(`dmethod.${order.delivery_method}`)}</PageTitle>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">{t("cust.package")}</p>
          <p className="mb-2 font-medium">{order.package_description || "—"}</p>
          <p className="text-sm text-slate-500">{t("cust.priority")}</p>
          <p className="mb-2 font-medium">{t(`prio.${order.priority}`)}</p>
          {order.driver_name && (<><p className="text-sm text-slate-500">{t("adm.driver")}</p><p className="mb-2 font-medium">{order.driver_name}</p></>)}
          {order.is_delayed && <p className="flex items-center gap-1 font-medium text-status-failed"><Icon name="alert" className="h-4 w-4" /> {t("adm.delayed")}</p>}

          {order.delivery_method === "locker" && order.pickup_code && (
            <div className="mt-3 rounded-md bg-navy-50 p-3 text-center">
              <p className="text-xs text-slate-500">{t("cust.pickupCode")}</p>
              <p className="text-2xl font-bold tracking-widest text-navy" dir="ltr">{order.pickup_code}</p>
            </div>
          )}
          {order.delivery_method === "over_the_wall" && order.delivery_instructions && (
            <div className="mt-3 rounded-md bg-accent/10 p-3">
              <p className="text-xs text-slate-500">{t("drv.wallInstr")}</p>
              <p className="font-medium">{order.delivery_instructions}</p>
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-2 font-semibold text-navy">{t("cust.timeline")}</p>
          <ol className="space-y-2">
            {order.status_logs.map((log) => (
              <li key={log.id} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-navy" />
                <div>
                  <span className="font-medium">{t(`ostatus.${log.status}`)}</span>
                  {log.note && <span className="text-slate-500"> — {log.note}</span>}
                  <div className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Driver actions */}
      {isDriver && (driverActions.length > 0 || true) && (
        <Card className="mt-4">
          <p className="mb-2 font-semibold text-navy">{t("drv.advance")}</p>
          {order.delivery_method === "locker" && <p className="mb-2 text-sm text-slate-500">{t("drv.lockerInstr")}</p>}
          <div className="flex flex-wrap gap-2">
            {driverActions.map((a) => (
              <button key={a.to} className="btn-primary py-2 text-sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate(a.to)}>
                {t(a.key)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={delayNote} onChange={(e) => setDelayNote(e.target.value)} placeholder={t("drv.delayNote")} className="flex-1 rounded-sm border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy" />
            <button className="btn-outline py-2 text-sm" onClick={() => delay.mutate()}>{t("drv.reportDelay")}</button>
          </div>
        </Card>
      )}

      {/* Customer rating */}
      {isCustomer && order.status === "delivered" && (
        <Card className="mt-4">
          <p className="mb-2 font-semibold text-navy">{t("cust.rate")}</p>
          {order.rating ? (
            <p className="flex items-center gap-1">{t("cust.yourRating")}:
              <span className="flex text-accent">
                {Array.from({ length: order.rating.stars }).map((_, i) => <Icon key={i} name="star" className="h-4 w-4 fill-accent" />)}
              </span>
            </p>
          ) : (
            <div className="space-y-2">
              <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="rounded-sm border border-slate-200 px-3 py-2">
                {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{"★".repeat(s)}</option>)}
              </select>
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("cust.leaveComment")} className="w-full rounded-sm border border-slate-200 px-3 py-2 outline-none focus:border-navy" />
              <button className="btn-cta" onClick={() => rate.mutate()}>{t("cust.submitRating")}</button>
            </div>
          )}
        </Card>
      )}

      {/* Messaging (privacy-first) */}
      {(isCustomer || isDriver) && order.driver && (
        <div className="mt-4">
          <Conversation orderId={order.id} />
        </div>
      )}
    </div>
  );
}
