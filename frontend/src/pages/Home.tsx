import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const statuses = [
  { key: "created", cls: "bg-status-created/10 text-status-created" },
  { key: "assigned", cls: "bg-status-assigned/10 text-status-assigned" },
  { key: "transit", cls: "bg-status-transit/10 text-status-transit" },
  { key: "delivered", cls: "bg-status-delivered/10 text-status-delivered" },
  { key: "delayed", cls: "bg-status-delayed/10 text-status-delayed" },
];
const methods = ["home", "locker", "homeBox", "overWall"];

export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      <section className="bg-navy px-6 pb-16 pt-10 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">{t("tagline")}</h1>
          <p className="mt-3 text-navy-50/80">{t("heroSub")}</p>
          <div className="card mx-auto mt-8 flex max-w-xl items-center gap-2 p-2">
            <input className="w-full rounded-sm px-4 py-2.5 text-slate-900 outline-none" placeholder={t("trackPlaceholder")} dir="ltr" />
            <button className="btn-cta whitespace-nowrap">{t("track")}</button>
          </div>
          <Link to="/register" className="mt-6 inline-block text-sm text-accent underline">{t("pub.getStarted")} →</Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-semibold text-navy">{t("methodsTitle")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {methods.map((m) => (
            <div key={m} className="card p-5 text-center">
              <p className="font-medium text-slate-900">{t(`method.${m}`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="mb-4 text-2xl font-semibold text-navy">{t("statusTitle")}</h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <span key={s.key} className={`rounded-sm px-3 py-1 text-sm font-medium ${s.cls}`}>{t(`status.${s.key}`)}</span>
          ))}
        </div>
      </section>
    </>
  );
}
