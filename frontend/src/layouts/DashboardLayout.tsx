import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../auth/types";
import LangToggle from "../components/LangToggle";
import NotificationsBell from "../components/NotificationsBell";

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
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = user ? NAV[user.role] : [];

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
        <div className="flex items-center gap-3">
          <NotificationsBell />
          <LangToggle className="text-white/90" />
          {user && <span className="text-sm text-white/90">{user.first_name || user.username}</span>}
          <button onClick={logout} className="rounded-sm bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25">
            {t("nav.logout")}
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 p-6">
        <aside className="hidden w-52 shrink-0 sm:block">
          <nav className="card flex flex-col p-2">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to.split("/").length === 3}
                className={({ isActive }) =>
                  `rounded-sm px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-navy text-white" : "text-slate-700 hover:bg-navy-50"
                  }`
                }
              >
                {t(it.key)}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main key={location.pathname} className="min-w-0 flex-1 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
