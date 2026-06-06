import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { OrderStatus } from "../../lib/types";
import { Card, EmptyState, Spinner, StatusBadge } from "../../components/ui";

interface TrackResult {
  id: number;
  status: OrderStatus;
  delivery_method: string;
  is_delayed: boolean;
  created_at: string;
  timeline: { status: OrderStatus; note: string; created_at: string }[];
}

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

      <div className="card mt-6 flex items-center gap-2 p-2">
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
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-navy">{t("trk.result", { id: data.id })}</h2>
                  <p className="text-sm text-slate-500">{t("trk.method")}: {t(`dmethod.${data.delivery_method}`)}</p>
                </div>
                <StatusBadge status={data.status} />
              </div>
              <ol className="space-y-3 border-s-2 border-navy-50 ps-4">
                {data.timeline.map((log, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-[21px] top-1 h-3 w-3 rounded-full border-2 border-white bg-navy" />
                    <p className="font-medium">{t(`ostatus.${log.status}`)}</p>
                    {log.note && <p className="text-sm text-slate-500">{log.note}</p>}
                    <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
