import { useTranslation } from "react-i18next";

const methods = ["home", "locker", "homeBox", "overWall"];
const features = ["created", "assigned", "transit", "delivered"];

export default function Services() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-navy">{t("pub.services")}</h1>
      <p className="mt-2 text-slate-600">{t("pub.servicesIntro")}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {methods.map((m) => (
          <div key={m} className="card p-6">
            <p className="text-lg font-semibold text-navy">{t(`method.${m}`)}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {features.map((f) => (
          <span key={f} className="rounded-sm bg-navy-50 px-3 py-1 text-sm text-navy">{t(`status.${f}`)}</span>
        ))}
      </div>
    </section>
  );
}
