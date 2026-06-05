export type Role = "customer" | "driver" | "admin" | "branch_supervisor";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  preferred_language: "en" | "ar";
}

export const HOME_BY_ROLE: Record<Role, string> = {
  customer: "/app/customer",
  driver: "/app/driver",
  admin: "/app/admin",
  branch_supervisor: "/app/branch",
};
