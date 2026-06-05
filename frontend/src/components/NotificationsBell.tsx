import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import type { NotificationItem } from "../lib/types";

export default function NotificationsBell() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get<NotificationItem[]>("/notifications/")).data,
    refetchInterval: 20000,
  });
  const unread = data.filter((n) => !n.is_read).length;

  const readAll = useMutation({
    mutationFn: async () => api.post("/notifications/read-all/"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-sm bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -end-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute end-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-md border border-slate-200 bg-white text-slate-900 shadow-md">
          <div className="flex items-center justify-between border-b p-2">
            <span className="text-sm font-semibold">{t("notif.title")}</span>
            <button onClick={() => readAll.mutate()} className="text-xs text-navy underline">
              {t("notif.readAll")}
            </button>
          </div>
          {data.length === 0 ? (
            <p className="p-4 text-center text-sm text-slate-400">{t("notif.empty")}</p>
          ) : (
            data.map((n) => (
              <div key={n.id} className={`border-b p-3 text-sm ${n.is_read ? "" : "bg-navy-50"}`}>
                <p className="font-medium">{n.title}</p>
                <p className="text-slate-500">{n.body}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
