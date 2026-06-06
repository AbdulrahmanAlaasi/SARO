import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { Plan } from "../../../lib/types";
import { Card, EmptyState, Modal, PageTitle, Spinner } from "../../../components/ui";
import { useToast } from "../../../components/Toast";
import { useConfirm } from "../../../components/ConfirmDialog";
import { Text } from "../customer/Orders";

export default function Plans() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const { ui: confirmUI, confirm } = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", name_ar: "", price: "0", period: "monthly", features: "" });

  const { data = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await api.get<Plan[]>("/plans/")).data,
  });
  const create = useMutation({
    mutationFn: async () => api.post("/plans/", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); setOpen(false); toast(t("toast.saved")); },
    onError: () => toast(t("toast.error"), "error"),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/plans/${id}/`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); toast(t("toast.deleted")); },
  });
  const askRemove = async (id: number) => { if (await confirm(t("ui.confirmDelete"))) remove.mutate(id); };

  if (isLoading) return <Spinner />;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>{t("adm.managePlans")}</PageTitle>
        <button className="btn-cta" onClick={() => setOpen(true)}>{t("adm.addPlan")}</button>
      </div>
      {data.length === 0 ? <EmptyState text={t("ui.none")} /> : (
        <div className="grid gap-3 sm:grid-cols-3">
          {data.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <p className="font-semibold text-navy">{p.name}</p>
                <button className="text-sm text-status-failed hover:underline" onClick={() => askRemove(p.id)}>{t("ui.delete")}</button>
              </div>
              <p className="my-1 text-xl font-bold">{p.price} SAR</p>
              <p className="text-xs text-slate-400">{p.period}</p>
            </Card>
          ))}
        </div>
      )}
      {confirmUI}
      {open && (
        <Modal title={t("adm.addPlan")} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Text label={t("adm.name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Text label={t("adm.nameAr")} value={form.name_ar} onChange={(v) => setForm({ ...form, name_ar: v })} />
            <Text label={t("adm.price")} value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t("adm.features")}</span>
              <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={3} className="w-full rounded-sm border border-slate-200 px-3 py-2 outline-none focus:border-navy" />
            </label>
            <button className="btn-primary w-full" disabled={create.isPending} onClick={() => create.mutate()}>{t("ui.save")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
