import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../lib/api";
import { Card, Icon } from "../../components/ui";

interface Message { id: number; sender: number; sender_name: string; body: string; created_at: string; }
interface Convo { id: number; messages: Message[]; }

export default function Conversation({ orderId }: { orderId: number }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");

  const { data: convo } = useQuery({
    queryKey: ["convo", orderId],
    queryFn: async () => (await api.post<Convo>("/conversations/for-order/", { order: orderId })).data,
    refetchInterval: 10000,
  });

  const send = useMutation({
    mutationFn: async () => api.post(`/conversations/${convo!.id}/send/`, { body: text }),
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["convo", orderId] }); },
  });

  return (
    <Card>
      <p className="mb-2 font-semibold text-navy">{t("cust.messages")}</p>
      <div className="mb-3 max-h-60 space-y-2 overflow-y-auto">
        {convo?.messages.map((m) => {
          const mine = m.sender === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${mine ? "bg-navy text-white" : "bg-slate-100"}`}>
                <p>{m.body}</p>
                <p className={`mt-0.5 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>{m.sender_name}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("cust.typeMessage")}
          className="flex-1 rounded-sm border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy"
          onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) send.mutate(); }} />
        <button className="btn-primary py-2 text-sm" disabled={!text.trim() || send.isPending} onClick={() => send.mutate()} aria-label={t("cust.send")}>
          <Icon name="send" className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
