import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import type { Address, DeliveryMethod, Order, Priority } from "../../../lib/types";
import { EmptyState, Modal, PageTitle, Spinner, StatusBadge } from "../../../components/ui";

const METHODS: DeliveryMethod[] = ["home", "locker", "home_box", "over_the_wall"];
const PRIORITIES: Priority[] = ["low", "normal", "high"];

export default function CustomerOrders() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders/")).data,
  });
  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get<Address[]>("/addresses/")).data,
  });

  const [form, setForm] = useState({
    delivery_method: "home" as DeliveryMethod,
    priority: "normal" as Priority,
    package_description: "",
    delivery_instructions: "",
    address: "",
  });

  const create = useMutation({
    mutationFn: async () =>
      api.post("/orders/", {
        ...form,
        address: form.address || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      setOpen(false);
      setForm({ delivery_method: "home", priority: "normal", package_description: "", delivery_instructions: "", address: "" });
    },
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>{t("cust.myOrders")}</PageTitle>
        <button className="btn-cta" onClick={() => setOpen(true)}>{t("cust.newOrder")}</button>
      </div>

      {orders.length === 0 ? (
        <EmptyState text={t("cust.noOrders")} />
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <Link key={o.id} to={`/app/customer/orders/${o.id}`} className="card flex items-center justify-between p-4 hover:bg-navy-50">
              <div>
                <span className="font-medium">#{o.id}</span>
                <span className="ms-2 text-sm text-slate-500">{t(`dmethod.${o.delivery_method}`)}</span>
                {o.is_delayed && <span className="ms-2 text-xs text-status-failed">⚠</span>}
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}

      {open && (
        <Modal title={t("cust.newOrder")} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Select label={t("cust.method")} value={form.delivery_method}
              onChange={(v) => setForm({ ...form, delivery_method: v as DeliveryMethod })}
              options={METHODS.map((m) => ({ value: m, label: t(`dmethod.${m}`) }))} />
            <Select label={t("cust.priority")} value={form.priority}
              onChange={(v) => setForm({ ...form, priority: v as Priority })}
              options={PRIORITIES.map((p) => ({ value: p, label: t(`prio.${p}`) }))} />
            <Select label={t("cust.address")} value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
              options={[{ value: "", label: t("cust.pickAddress") }, ...addresses.map((a) => ({ value: String(a.id), label: `${a.label} — ${a.city}` }))]} />
            <Text label={t("cust.package")} value={form.package_description} onChange={(v) => setForm({ ...form, package_description: v })} />
            {form.delivery_method === "over_the_wall" && (
              <Text label={t("cust.instructions")} value={form.delivery_instructions} onChange={(v) => setForm({ ...form, delivery_instructions: v })} />
            )}
            <button className="btn-primary w-full" disabled={create.isPending} onClick={() => create.mutate()}>
              {t("cust.create")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-sm border border-slate-200 px-3 py-2.5 outline-none focus:border-navy">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-sm border border-slate-200 px-3 py-2.5 outline-none focus:border-navy" />
    </label>
  );
}
export { Select, Text };
