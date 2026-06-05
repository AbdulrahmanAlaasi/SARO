import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { Address } from "../../../lib/types";
import { Card, EmptyState, Modal, PageTitle, Spinner } from "../../../components/ui";
import { Text } from "./Orders";

export default function Addresses() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: "", city: "", district: "", street: "", national_address: "", is_default: false });

  const { data = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get<Address[]>("/addresses/")).data,
  });
  const create = useMutation({
    mutationFn: async () => api.post("/addresses/", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["addresses"] }); setOpen(false); setForm({ label: "", city: "", district: "", street: "", national_address: "", is_default: false }); },
  });
  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/addresses/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>{t("nav.addresses")}</PageTitle>
        <button className="btn-cta" onClick={() => setOpen(true)}>{t("cust.addAddress")}</button>
      </div>
      {data.length === 0 ? <EmptyState text={t("cust.noAddresses")} /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{a.label} {a.is_default && <span className="text-xs text-accent">★</span>}</p>
                  <p className="text-sm text-slate-500">{a.city} {a.district && `· ${a.district}`}</p>
                  {a.street && <p className="text-sm text-slate-500">{a.street}</p>}
                  {a.national_address && <p className="text-xs text-slate-400" dir="ltr">{a.national_address}</p>}
                </div>
                <button className="text-sm text-status-failed" onClick={() => remove.mutate(a.id)}>{t("ui.delete")}</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open && (
        <Modal title={t("cust.addAddress")} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Text label={t("cust.label")} value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
            <Text label={t("cust.city")} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Text label={t("cust.district")} value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            <Text label={t("cust.street")} value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
            <Text label={t("cust.nationalAddr")} value={form.national_address} onChange={(v) => setForm({ ...form, national_address: v })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
              {t("cust.makeDefault")}
            </label>
            <button className="btn-primary w-full" disabled={create.isPending} onClick={() => create.mutate()}>{t("ui.save")}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
