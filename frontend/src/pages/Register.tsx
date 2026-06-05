import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../auth/types";
import { AuthShell, Field } from "./Login";

const ROLES: Role[] = ["customer", "driver", "admin", "branch_supervisor"];

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "customer" as Role,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/login", { replace: true, state: { notice: t("auth.registered") } });
    } catch {
      setError(t("auth.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("auth.registerTitle")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("auth.firstName")} value={form.first_name} onChange={set("first_name")} />
          <Field label={t("auth.lastName")} value={form.last_name} onChange={set("last_name")} />
        </div>
        <Field label={t("auth.username")} value={form.username} onChange={set("username")} />
        <Field label={t("auth.email")} value={form.email} onChange={set("email")} type="email" />
        <Field label={t("auth.password")} value={form.password} onChange={set("password")} type="password" />
        <Field label={t("auth.phone")} value={form.phone} onChange={set("phone")} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t("auth.role")}</span>
          <select
            value={form.role}
            onChange={(e) => set("role")(e.target.value)}
            className="w-full rounded-sm border border-slate-200 px-3 py-2.5 outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`role.${r}`)}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="text-sm text-status-failed">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {t("auth.submitRegister")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="font-medium text-navy underline">
          {t("login")}
        </Link>
      </p>
    </AuthShell>
  );
}
