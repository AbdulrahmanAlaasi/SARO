import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { Plan } from "../../../lib/types";
import { EmptyState, Icon, Modal, PageTitle, Spinner } from "../../../components/ui";
import { useToast } from "../../../components/Toast";
import { useConfirm } from "../../../components/ConfirmDialog";
import { Text } from "../customer/Orders";

type PlanForm = {
  name: string; name_ar: string; price: string;
  period: "monthly" | "yearly"; features: string; is_active: boolean;
};
const EMPTY: PlanForm = { name: "", name_ar: "", price: "0", period: "monthly", features: "", is_active: true };

export default function Plans() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const toast = useToast();
  const { ui: confirmUI, confirm } = useConfirm();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY);

  const { data = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await api.get<Plan[]>("/plans/")).data,
  });

  const save = useMutation({
    mutationFn: async () =>
      editId
        ? api.patch(`/plans/${editId}/`, form)
        : api.post("/plans/", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
      setOpen(false); setEditId(null); setForm(EMPTY);
      toast(t("toast.saved"));
    },
    onError: () => toast(t("toast.error"), "error"),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/plans/${id}/`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); toast(t("toast.deleted")); },
  });

  const openCreate = () => { setEditId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p: Plan) => {
    setEditId(p.id);
    setForm({ name: p.name, name_ar: p.name_ar, price: String(p.price), period: p.period, features: p.features, is_active: p.is_active });
    setOpen(true);
  };
  const askRemove = async (id: number) => { if (await confirm(t("ui.confirmDelete"))) remove.mutate(id); };

  if (isLoading) return <Spinner />;

  // mark the middle-priced plan as "popular"
  const sorted = [...data].sort((a, b) => Number(a.price) - Number(b.price));
  const popularId = sorted.length >= 3 ? sorted[Math.floor(sorted.length / 2)].id : -1;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>{t("adm.managePlans")}</PageTitle>
        <button className="btn-cta" onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />{t("adm.addPlan")}
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState icon="package" title={t("adm.noPlans")} text={t("adm.planSubtitle")}
          action={<button className="btn-cta" onClick={openCreate}>{t("adm.addPlan")}</button>} />
      ) : (
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const name = i18n.language === "ar" && p.name_ar ? p.name_ar : p.name;
            const features = p.features.split("\n").map((f) => f.trim()).filter(Boolean);
            const free = Number(p.price) === 0;
            const popular = p.id === popularId;
            return (
              <div key={p.id}
                className={`card card-hover relative flex flex-col p-6 ${popular ? "ring-2 ring-accent" : ""}`}>
                {popular && (
                  <span className="absolute -top-2.5 start-6 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-card">
                    {t("adm.popular")}
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-navy">{name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.is_active ? "bg-status-delivered/10 text-status-delivered" : "bg-slate-100 text-slate-400"}`}>
                    {p.is_active ? t("adm.active") : t("adm.inactive")}
                  </span>
                </div>

                <div className="mt-3 flex items-end gap-1">
                  {free ? (
                    <span className="text-3xl font-bold text-navy">{t("adm.free")}</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-400">SAR</span>
                      <span className="text-3xl font-bold text-navy">{Number(p.price).toFixed(0)}</span>
                      <span className="mb-1 text-sm text-slate-400">{p.period === "yearly" ? t("adm.perYear") : t("adm.perMonth")}</span>
                    </>
                  )}
                </div>

                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                  {features.length === 0 ? (
                    <li className="text-slate-400">{t("adm.noFeatures")}</li>
                  ) : features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-status-delivered" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button className="btn-outline flex-1 py-1.5 text-xs" onClick={() => openEdit(p)}>
                    <Icon name="edit" className="h-3.5 w-3.5" />{t("adm.editPlan")}
                  </button>
                  <button className="rounded-md px-3 py-1.5 text-xs font-medium text-status-failed transition-colors hover:bg-status-failed/10"
                    onClick={() => askRemove(p.id)}>
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {confirmUI}

      {open && (
        <Modal title={editId ? t("adm.editPlan") : t("adm.addPlan")} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Text label={t("adm.name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Text label={t("adm.nameAr")} value={form.name_ar} onChange={(v) => setForm({ ...form, name_ar: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Text label={t("adm.price")} value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">{t("adm.period")}</span>
                <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as "monthly" | "yearly" })}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 outline-none focus:border-navy">
                  <option value="monthly">{t("adm.monthly")}</option>
                  <option value="yearly">{t("adm.yearly")}</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t("adm.features")}</span>
              <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4}
                className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-navy" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              {t("adm.isActive")}
            </label>
            <button className="btn-primary w-full" disabled={save.isPending || !form.name} onClick={() => save.mutate()}>
              {t("ui.save")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
