import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { Plan } from "../../lib/types";
import { Spinner } from "../../components/ui";

export default function PublicPlans() {
  const { t, i18n } = useTranslation();
  const { data = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await api.get<Plan[]>("/plans/")).data,
  });
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-navy">{t("pub.plans")}</h1>
      <p className="mt-2 text-slate-600">{t("pub.plansIntro")}</p>
      {isLoading ? <Spinner /> : (
        <div className="stagger mt-8 grid gap-4 sm:grid-cols-3">
          {data.map((p) => (
            <div key={p.id} className="card card-hover flex flex-col p-6">
              <p className="text-lg font-semibold text-navy">{i18n.language === "ar" && p.name_ar ? p.name_ar : p.name}</p>
              <p className="my-2 text-3xl font-bold">{p.price}<span className="text-sm font-normal text-slate-500"> SAR</span></p>
              <ul className="mb-4 flex-1 space-y-1 text-sm text-slate-600">
                {p.features.split("\n").filter(Boolean).map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
              <Link to="/register" className="btn-primary text-center">{t("pub.getStarted")}</Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
