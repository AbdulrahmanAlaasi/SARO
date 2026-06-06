import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../auth/types";
import LangToggle from "../components/LangToggle";
import NotificationsBell from "../components/NotificationsBell";
import { Icon } from "../components/ui";

interface NavItem {
  to: string;
  key: string;
}

const NAV: Record<Role, NavItem[]> = {
  customer: [
    { to: "/app/customer", key: "nav.overview" },
    { to: "/app/customer/orders", key: "nav.orders" },
    { to: "/app/customer/addresses", key: "nav.addresses" },
    { to: "/app/customer/subscriptions", key: "nav.subscriptions" },
  ],
  driver: [
    { to: "/app/driver", key: "nav.overview" },
    { to: "/app/driver/orders", key: "nav.assigned" },
  ],
  admin: [
    { to: "/app/admin", key: "nav.overview" },
    { to: "/app/admin/orders", key: "nav.orders" },
    { to: "/app/admin/users", key: "nav.users" },
    { to: "/app/admin/branches", key: "nav.branches" },
    { to: "/app/admin/lockers", key: "nav.lockers" },
    { to: "/app/admin/plans", key: "nav.plans" },
  ],
  branch_supervisor: [
    { to: "/app/branch", key: "nav.overview" },
    { to: "/app/branch/orders", key: "nav.orders" },
    { to: "/app/branch/lockers", key: "nav.lockers" },
  ],
};

export default function DashboardLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const items = user ? NAV[user.role] : [];

  // close the mobile drawer whenever the route changes
  useEffect(() => setDrawer(false), [location.pathname]);

  const rtl = i18n.language === "ar";
  const closedTransform = rtl ? "translateX(100%)" : "translateX(-100%)";

  const navList = (
    <nav className="flex flex-col gap-1">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to.split("/").length === 3}
          onClick={() => setDrawer(false)}
          className={({ isActive }) =>
            `rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-navy text-white" : "text-slate-700 hover:bg-navy-50"
            }`
          }
        >
          {t(it.key)}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between bg-navy px-4 py-3 text-white sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawer(true)}
            aria-label="Menu"
            className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-white/15 sm:hidden"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <span className="text-xl font-bold">{t("appName")}</span>
          {user && (
            <span className="hidden rounded-sm bg-white/15 px-2 py-0.5 text-xs sm:inline">
              {t(`role.${user.role}`)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationsBell />
          <LangToggle className="text-white/90" />
          {user && <span className="hidden text-sm text-white/90 sm:inline">{user.first_name || user.username}</span>}
          <button onClick={logout} className="rounded-sm bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25">
            {t("nav.logout")}
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 p-4 sm:p-6">
        {/* desktop sidebar */}
        <aside className="hidden w-52 shrink-0 sm:block">
          <div className="card p-2">{navList}</div>
        </aside>

        <main key={location.pathname} className="min-w-0 flex-1 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* mobile drawer */}
      {drawer && (
        <div
          className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm animate-fade-in sm:hidden"
          onClick={() => setDrawer(false)}
        />
      )}
      <aside
        className="fixed inset-y-0 z-50 w-64 bg-white shadow-hover transition-transform duration-300 ease-out sm:hidden"
        style={{ insetInlineStart: 0, transform: drawer ? "none" : closedTransform }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-navy px-4 py-3 text-white">
          <span className="font-bold">{t("appName")}</span>
          <button onClick={() => setDrawer(false)} aria-label={t("ui.close")} className="rounded-md p-1 hover:bg-white/15">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        {user && (
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="font-medium text-slate-800">{user.first_name || user.username}</p>
            <p className="text-xs text-slate-500">{t(`role.${user.role}`)}</p>
          </div>
        )}
        <div className="p-3">{navList}</div>
      </aside>
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
