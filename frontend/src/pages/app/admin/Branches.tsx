import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { Branch } from "../../../lib/types";
import { Card, EmptyState, Modal, PageTitle, Spinner } from "../../../components/ui";
import { Text } from "../customer/Orders";

export default function Branches() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", name_ar: "", city: "", district: "" });

  const { data = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => (await api.get<Branch[]>("/branches/")).data,
  });
  const create = useMutation({
    mutationFn: async () => api.post("/branches/", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches"] }); setOpen(false); setForm({ name: "", name_ar: "", city: "", district: "" }); },
  });
  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/branches/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });

  if (isLoading) return <Spinner />;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>{t("adm.manageBranches")}</PageTitle>
        <button className="btn-cta" onClick={() => setOpen(true)}>{t("adm.addBranch")}</button>
      </div>
      {data.length === 0 ? <EmptyState text={t("ui.none")} /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((b) => (
            <Card key={b.id} className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-slate-500">{b.city} {b.district && `· ${b.district}`}</p>
              </div>
              <button className="text-sm text-status-failed" onClick={() => remove.mutate(b.id)}>{t("ui.delete")}</button>
            </Card>
          ))}
        </div>
      )}
      {open && (
        <Modal title={t("adm.addBranch")} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Text label={t("adm.name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Text label={t("adm.nameAr")} value={form.name_ar} onChange={(v) => setForm({ ...form, name_ar: v })} />
            <Text label={t("cust.city")} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Text label={t("cust.district")} value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            <button className="btn-primary w-full" disabled={create.isPending} onClick={() => create.mutate()}>{t("ui.save")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
