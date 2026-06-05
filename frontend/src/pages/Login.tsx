import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { HOME_BY_ROLE } from "../auth/types";
import LangToggle from "../components/LangToggle";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { notice?: string } };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(username, password);
      navigate(HOME_BY_ROLE[user.role], { replace: true });
    } catch (err: any) {
      setError(err.response?.status === 401 ? t("auth.invalid") : t("auth.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("auth.loginTitle")}>
      {location.state?.notice && (
        <p className="rounded-sm bg-status-delivered/10 px-3 py-2 text-sm text-status-delivered">
          {location.state.notice}
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label={t("auth.username")} value={username} onChange={setUsername} autoFocus />
        <Field label={t("auth.password")} value={password} onChange={setPassword} type="password" />
        {error && <p className="text-sm text-status-failed">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {t("auth.submitLogin")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {t("auth.noAccount")}{" "}
        <Link to="/register" className="font-medium text-navy underline">
          {t("register")}
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between bg-navy px-6 py-4 text-white">
        <Link to="/" className="text-2xl font-bold">
          {t("appName")}
        </Link>
        <LangToggle className="text-white/90" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="card w-full max-w-md p-8">
          <h1 className="mb-6 text-2xl font-semibold text-navy">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-slate-200 px-3 py-2.5 outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        required
      />
    </label>
  );
}
