import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  AdminDashboard,
  BranchDashboard,
  CustomerDashboard,
  DriverDashboard,
} from "./pages/dashboards";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<DashboardLayout />}>
        <Route element={<ProtectedRoute roles={["customer"]} />}>
          <Route path="/app/customer" element={<CustomerDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={["driver"]} />}>
          <Route path="/app/driver" element={<DriverDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/app/admin" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={["branch_supervisor"]} />}>
          <Route path="/app/branch" element={<BranchDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
