import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/public/Services";
import PublicPlans from "./pages/public/PublicPlans";
import PublicBranches from "./pages/public/PublicBranches";
import Contact from "./pages/public/Contact";
import OrderDetail from "./pages/app/OrderDetail";
import CustomerOverview from "./pages/app/customer/Overview";
import CustomerOrders from "./pages/app/customer/Orders";
import Addresses from "./pages/app/customer/Addresses";
import Subscriptions from "./pages/app/customer/Subscriptions";
import DriverOrders from "./pages/app/driver/Orders";
import AdminOverview from "./pages/app/admin/Overview";
import ManageOrders from "./pages/app/admin/ManageOrders";
import Users from "./pages/app/admin/Users";
import Branches from "./pages/app/admin/Branches";
import Lockers from "./pages/app/admin/Lockers";
import Plans from "./pages/app/admin/Plans";

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/plans" element={<PublicPlans />} />
        <Route path="/branches" element={<PublicBranches />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* App (role-guarded) */}
      <Route element={<DashboardLayout />}>
        <Route element={<ProtectedRoute roles={["customer"]} />}>
          <Route path="/app/customer" element={<CustomerOverview />} />
          <Route path="/app/customer/orders" element={<CustomerOrders />} />
          <Route path="/app/customer/orders/:id" element={<OrderDetail />} />
          <Route path="/app/customer/addresses" element={<Addresses />} />
          <Route path="/app/customer/subscriptions" element={<Subscriptions />} />
        </Route>

        <Route element={<ProtectedRoute roles={["driver"]} />}>
          <Route path="/app/driver" element={<DriverOrders overview />} />
          <Route path="/app/driver/orders" element={<DriverOrders />} />
          <Route path="/app/driver/orders/:id" element={<OrderDetail />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/app/admin" element={<AdminOverview />} />
          <Route path="/app/admin/orders" element={<ManageOrders />} />
          <Route path="/app/admin/users" element={<Users />} />
          <Route path="/app/admin/branches" element={<Branches />} />
          <Route path="/app/admin/lockers" element={<Lockers />} />
          <Route path="/app/admin/plans" element={<Plans />} />
        </Route>

        <Route element={<ProtectedRoute roles={["branch_supervisor"]} />}>
          <Route path="/app/branch" element={<AdminOverview />} />
          <Route path="/app/branch/orders" element={<ManageOrders />} />
          <Route path="/app/branch/lockers" element={<Lockers />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
