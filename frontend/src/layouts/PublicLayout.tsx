import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router-dom";
import LangToggle from "../components/LangToggle";

const links = [
  { to: "/", key: "pub.home", end: true },
  { to: "/services", key: "pub.services", end: false },
  { to: "/plans", key: "pub.plans", end: false },
  { to: "/branches", key: "pub.branches", end: false },
  { to: "/contact", key: "pub.contact", end: false },
];

export default function PublicLayout() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-navy px-6 py-4 text-white">
        <Link to="/" className="text-2xl font-bold">{t("appName")}</Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => isActive ? "font-semibold text-accent" : "text-white/90 hover:text-white"}>
              {t(l.key)}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangToggle className="text-white/90" />
          <Link to="/login" className="rounded-md border border-white px-4 py-1.5 text-sm hover:bg-white/10">{t("login")}</Link>
          <Link to="/register" className="btn-cta py-1.5 text-sm">{t("register")}</Link>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} {t("appName")} · {t("tagline")}
      </footer>
    </div>
  );
}
