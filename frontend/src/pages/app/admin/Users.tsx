import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../lib/api";
import type { AppUser } from "../../../lib/types";
import { EmptyState, PageTitle, Spinner } from "../../../components/ui";

const ROLES = ["", "customer", "driver", "admin", "branch_supervisor"];

export default function Users() {
  const { t } = useTranslation();
  const [role, setRole] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["users", role],
    queryFn: async () => (await api.get<AppUser[]>(`/users/${role ? `?role=${role}` : ""}`)).data,
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>{t("adm.manageUsers")}</PageTitle>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-sm border border-slate-200 px-3 py-2 text-sm">
          {ROLES.map((r) => <option key={r} value={r}>{r ? t(`role.${r}`) : t("ui.none")}</option>)}
        </select>
      </div>
      {isLoading ? <Spinner /> : data.length === 0 ? <EmptyState text={t("ui.none")} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-navy text-white">
              <th className="p-2 text-start">{t("auth.username")}</th>
              <th className="p-2 text-start">{t("auth.email")}</th>
              <th className="p-2 text-start">{t("auth.role")}</th>
            </tr></thead>
            <tbody>
              {data.map((u, i) => (
                <tr key={u.id} className={i % 2 ? "bg-navy-50" : ""}>
                  <td className="p-2 font-medium">{u.username}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{t(`role.${u.role}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
