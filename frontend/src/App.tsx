import { useTranslation } from "react-i18next";

export default function App() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-8 text-center">
      <header className="space-y-2">
        <h1 className="text-5xl font-bold text-saro-navy">{t("appName")}</h1>
        <p className="text-lg text-slate-600">{t("tagline")}</p>
      </header>

      <div className="flex gap-3">
        <button className="rounded-lg bg-saro-navy px-5 py-2 text-white">
          {t("login")}
        </button>
        <button className="rounded-lg border border-saro-navy px-5 py-2 text-saro-navy">
          {t("register")}
        </button>
      </div>

      <button
        onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
        className="text-sm text-saro-accent underline"
      >
        {t("switchLang")}
      </button>

      <p className="mt-8 text-xs text-slate-400">
        Phase 0 scaffold · React + Django + Supabase · AR/EN RTL ready
      </p>
    </div>
  );
}
