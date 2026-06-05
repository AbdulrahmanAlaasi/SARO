import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { Locker } from "../../../lib/types";
import { Card, EmptyState, Modal, PageTitle, Spinner } from "../../../components/ui";
import { Text } from "../customer/Orders";

export default function Lockers() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", district: "", location: "", total_slots: 10, available_slots: 10 });

  const { data = [], isLoading } = useQuery({
    queryKey: ["lockers"],
    queryFn: async () => (await api.get<Locker[]>("/lockers/")).data,
  });
  const create = useMutation({
    mutationFn: async () => api.post("/lockers/", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lockers"] }); setOpen(false); },
  });
  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/lockers/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lockers"] }),
  });

  if (isLoading) return <Spinner />;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>{t("adm.manageLockers")}</PageTitle>
        <button className="btn-cta" onClick={() => setOpen(true)}>{t("adm.addLocker")}</button>
      </div>
      {data.length === 0 ? <EmptyState text={t("ui.none")} /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((l) => (
            <Card key={l.id} className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{l.name}</p>
                <p className="text-sm text-slate-500">{l.city} {l.district && `· ${l.district}`}</p>
                <p className="text-xs text-slate-400">{l.available_slots}/{l.total_slots} · {l.status}</p>
              </div>
              <button className="text-sm text-status-failed" onClick={() => remove.mutate(l.id)}>{t("ui.delete")}</button>
            </Card>
          ))}
        </div>
      )}
      {open && (
        <Modal title={t("adm.addLocker")} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Text label={t("adm.name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Text label={t("cust.city")} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Text label={t("cust.district")} value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            <Text label={t("adm.location")} value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            <button className="btn-primary w-full" disabled={create.isPending} onClick={() => create.mutate()}>{t("ui.save")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
