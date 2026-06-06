import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { OrderStatus } from "../../lib/types";
import { Card, EmptyState, Icon, METHOD_ICON, Spinner, StatusBadge } from "../../components/ui";

interface TrackResult {
  id: number;
  status: OrderStatus;
  delivery_method: string;
  is_delayed: boolean;
  created_at: string;
  timeline: { status: OrderStatus; note: string; created_at: string }[];
}

const STAGES: { key: OrderStatus; icon: string }[] = [
  { key: "created", icon: "package" },
  { key: "assigned", icon: "pin" },
  { key: "picked_up", icon: "box" },
  { key: "in_transit", icon: "truck" },
  { key: "delivered", icon: "check" },
];

export default function Track() {
  const { t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["track", code],
    enabled: !!code,
    retry: false,
    queryFn: async () => (await api.get<TrackResult>(`/track/${code}/`)).data,
  });

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold text-navy">{t("trk.title")}</h1>

      <div className="card mt-6 flex items-center gap-2 p-2 shadow-card">
        <input
          className="w-full rounded-md px-4 py-2.5 text-slate-900 outline-none"
          placeholder={t("trk.placeholder")}
          dir="ltr"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) navigate(`/track/${input.trim()}`); }}
        />
        <button className="btn-cta whitespace-nowrap" disabled={!input.trim()} onClick={() => navigate(`/track/${input.trim()}`)}>
          {t("trk.button")}
        </button>
      </div>

      {code && (
        <div className="mt-8">
          {isLoading ? <Spinner /> : isError || !data ? (
            <EmptyState text={t("trk.notFound")} icon="package" />
          ) : (
            <TrackCard data={data} />
          )}
        </div>
      )}
    </section>
  );
}

function TrackCard({ data }: { data: TrackResult }) {
  const { t } = useTranslation();
  const failed = data.status === "failed";
  const currentIdx = failed
    ? STAGES.length - 1
    : STAGES.findIndex((s) => s.key === data.status);
  const pctTarget = failed ? 100 : (currentIdx / (STAGES.length - 1)) * 100;

  // animate the progress bar from 0 -> target on mount
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setPct(pctTarget), 120);
    return () => clearTimeout(id);
  }, [pctTarget]);

  return (
    <Card className="animate-fade-up p-6">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-50 text-navy">
            <Icon name={METHOD_ICON[data.delivery_method] ?? "package"} className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-navy">{t("trk.result", { id: data.id })}</h2>
            <p className="text-sm text-slate-500">{t(`dmethod.${data.delivery_method}`)}</p>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {data.is_delayed && (
        <div className="mb-5 flex items-center gap-2 rounded-md bg-status-delayed/10 px-3 py-2 text-sm font-medium text-status-delayed animate-fade-in">
          <Icon name="alert" className="h-4 w-4" /> {t("adm.delayed")}
        </div>
      )}

      {/* animated stepper */}
      <div className="mb-8 hidden sm:block">
        <div className="relative mx-2 mt-2">
          {/* track + fill */}
          <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-200" />
          <div
            className={`absolute top-5 h-1 rounded-full transition-[width] duration-700 ease-out ${failed ? "bg-status-failed" : "bg-status-delivered"}`}
            style={{ width: `${pct}%`, insetInlineStart: 0 }}
          />
          <div className="relative flex justify-between">
            {STAGES.map((s, i) => {
              const allDone = data.status === "delivered";
              const done = i < currentIdx || allDone;
              const current = i === currentIdx && !allDone;
              const color = failed && i === currentIdx ? "bg-status-failed text-white"
                : done ? "bg-status-delivered text-white"
                : current ? "bg-accent text-white"
                : "bg-slate-200 text-slate-400";
              return (
                <div key={s.key} className="flex flex-col items-center gap-2"
                  style={{ animation: "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${i * 90}ms` }}>
                  <span className="relative">
                    {current && !failed && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
                    )}
                    <span className={`relative flex h-10 w-10 items-center justify-center rounded-full shadow-card transition-colors ${color}`}>
                      <Icon name={done ? "check" : s.icon} className="h-5 w-5" />
                    </span>
                  </span>
                  <span className={`text-xs font-medium ${current ? "text-navy" : "text-slate-400"}`}>
                    {t(`ostatus.${s.key}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* detailed timeline */}
      <p className="mb-3 text-sm font-semibold text-slate-500">{t("cust.timeline")}</p>
      <ol className="stagger space-y-4 border-s-2 border-navy-50 ps-5">
        {data.timeline.map((log, i) => {
          const last = i === data.timeline.length - 1;
          return (
            <li key={i} className="relative">
              <span className={`absolute -start-[26px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${last ? "bg-status-delivered" : "bg-navy"}`}>
                {last && <span className="absolute inset-0 animate-ping rounded-full bg-status-delivered/40" />}
              </span>
              <p className="font-medium text-slate-800">{t(`ostatus.${log.status}`)}</p>
              {log.note && <p className="text-sm text-slate-500">{log.note}</p>}
              <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
