import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { HOME_BY_ROLE, type Role } from "./types";

export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-navy">
        …
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  }
  return <Outlet />;
}
