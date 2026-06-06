export type OrderStatus =
  | "created" | "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";
export type DeliveryMethod = "home" | "locker" | "home_box" | "over_the_wall";
export type Priority = "low" | "normal" | "high";

export interface StatusLog {
  id: number;
  status: OrderStatus;
  note: string;
  by: number | null;
  created_at: string;
}
export interface Rating {
  id: number;
  stars: number;
  comment: string;
  created_at: string;
}
export interface Order {
  id: number;
  customer: number;
  customer_name: string;
  driver: number | null;
  driver_name: string | null;
  branch: number | null;
  address: number | null;
  delivery_method: DeliveryMethod;
  status: OrderStatus;
  priority: Priority;
  package_description: string;
  delivery_instructions: string;
  locker: number | null;
  pickup_code: string;
  is_delayed: boolean;
  scheduled_time: string | null;
  created_at: string;
  updated_at: string;
  status_logs: StatusLog[];
  rating: Rating | null;
}
export interface Address {
  id: number;
  label: string;
  city: string;
  district: string;
  street: string;
  national_address: string;
  notes: string;
  is_default: boolean;
}
export interface Branch {
  id: number;
  name: string;
  name_ar: string;
  city: string;
  district: string;
  supervisor: number | null;
  is_active: boolean;
}
export interface Locker {
  id: number;
  name: string;
  branch: number | null;
  city: string;
  district: string;
  location: string;
  total_slots: number;
  available_slots: number;
  status: "active" | "full" | "maintenance";
}
export interface Plan {
  id: number;
  name: string;
  name_ar: string;
  price: string;
  period: "monthly" | "yearly";
  features: string;
  is_active: boolean;
}
export interface Subscription {
  id: number;
  plan: number;
  plan_detail: Plan;
  status: "active" | "expired" | "cancelled";
  start_date: string;
  end_date: string | null;
}
export interface AppUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}
export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
export interface KPIs {
  total_orders: number;
  delayed: number;
  delivered: number;
  active: number;
  delay_rate: number;
  by_status: Record<string, number>;
  by_method: Record<string, number>;
  avg_rating: number;
  daily: { date: string; count: number }[];
}
