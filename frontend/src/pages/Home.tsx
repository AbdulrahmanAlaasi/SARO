import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Icon } from "../components/ui";

const statuses = [
  { key: "created", cls: "bg-status-created/10 text-status-created" },
  { key: "assigned", cls: "bg-status-assigned/10 text-status-assigned" },
  { key: "transit", cls: "bg-status-transit/10 text-status-transit" },
  { key: "delivered", cls: "bg-status-delivered/10 text-status-delivered" },
  { key: "delayed", cls: "bg-status-delayed/10 text-status-delayed" },
];
const methods = [
  { key: "home", icon: "truck" },
  { key: "locker", icon: "lock" },
  { key: "homeBox", icon: "box" },
  { key: "overWall", icon: "wall" },
];

export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-700 px-6 pb-20 pt-14 text-white">
        <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight animate-fade-up sm:text-5xl">{t("tagline")}</h1>
          <p className="mt-3 text-navy-50/80 animate-fade-up" style={{ animationDelay: "0.06s" }}>{t("heroSub")}</p>
          <div className="card mx-auto mt-8 flex max-w-xl items-center gap-2 p-2 animate-fade-up" style={{ animationDelay: "0.12s" }}>
            <input className="w-full rounded-md px-4 py-2.5 text-slate-900 outline-none" placeholder={t("trackPlaceholder")} dir="ltr" />
            <button className="btn-cta whitespace-nowrap">{t("track")}</button>
          </div>
          <Link to="/register" className="mt-6 inline-flex items-center gap-1 text-sm text-accent underline-offset-4 transition hover:underline animate-fade-up" style={{ animationDelay: "0.18s" }}>
            {t("pub.getStarted")} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-navy">{t("methodsTitle")}</h2>
        <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-4">
          {methods.map((m) => (
            <div key={m.key} className="card card-hover flex flex-col items-center gap-3 p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 text-navy">
                <Icon name={m.icon} className="h-6 w-6" />
              </span>
              <p className="font-medium text-slate-900">{t(`method.${m.key}`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-navy">{t("statusTitle")}</h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <span key={s.key} className={`rounded-full px-3 py-1 text-sm font-medium ${s.cls}`}>{t(`status.${s.key}`)}</span>
          ))}
        </div>
      </section>
    </>
  );
}
