import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LangToggle from "../components/LangToggle";

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between bg-navy px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">{t("appName")}</span>
          {user && (
            <span className="rounded-sm bg-white/15 px-2 py-0.5 text-xs">
              {t(`role.${user.role}`)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <LangToggle className="text-white/90" />
          {user && (
            <span className="text-sm text-white/90">
              {user.first_name || user.username}
            </span>
          )}
          <button onClick={logout} className="rounded-sm bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25">
            {t("nav.logout")}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export function DashboardPlaceholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">{t(titleKey)}</h1>
      <p className="text-slate-600">
        {t("dash.welcome")}, {user?.first_name || user?.username} 👋
      </p>
      <div className="card p-6 text-slate-500">{t("dash.placeholder")}</div>
    </div>
  );
}
