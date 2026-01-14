import type { Availability } from "../../models/model";

// Normalized user shape used by the admin UI.
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending" | "suspended";
  lastActive: string;
};

// Filter selector for station status in the admin list.
export type StationFilterStatus = "" | Availability;
