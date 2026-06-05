import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "../../lib/api";
import type { Branch } from "../../lib/types";
import { EmptyState, Spinner } from "../../components/ui";

export default function PublicBranches() {
  const { t, i18n } = useTranslation();
  const { data = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => (await api.get<Branch[]>("/branches/")).data,
  });
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-navy">{t("pub.branches")}</h1>
      {isLoading ? <Spinner /> : data.length === 0 ? <EmptyState text={t("ui.none")} /> : (
        <div className="stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((b) => (
            <div key={b.id} className="card card-hover p-5">
              <p className="font-semibold text-navy">{i18n.language === "ar" && b.name_ar ? b.name_ar : b.name}</p>
              <p className="text-sm text-slate-500">{b.city} {b.district && `· ${b.district}`}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
