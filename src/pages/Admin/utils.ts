import { minutesAgo } from "../../utils/time";
import { UI } from "../../theme/theme";
import type { AdminUser } from "./types";

// Narrows unknown values into records for safe key access.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object";

// Converts unknown values into trimmed strings for display.
const toCleanString = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

// Normalizes role values into a lowercase string.
const normalizeRoleValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string");
    return first ? first.trim().toLowerCase() : "";
  }
  if (typeof value === "string") return value.trim().toLowerCase();
  return "";
};

// Builds a fallback display name from an email address.
const formatNameFromEmail = (email: string) => {
  const [prefix] = email.split("@");
  const cleaned = prefix.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  return cleaned || "User";
};

// Formats last-active timestamps into a compact display label.
const formatLastActive = (value: unknown): string => {
  if (typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return `${minutesAgo(parsed.toISOString())}m ago`;
    }
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "N/A";
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return `${minutesAgo(new Date(parsed).toISOString())}m ago`;
    }
    return trimmed;
  }
  return "N/A";
};

// Converts raw status fields into a normalized admin status value.
const normalizeUserStatus = (
  raw: Record<string, unknown>
): AdminUser["status"] => {
  const statusValue = raw.status ?? raw.state;
  if (typeof statusValue === "string") {
    const normalized = statusValue.trim().toLowerCase();
    if (normalized === "active" || normalized === "enabled") return "active";
    if (normalized === "pending" || normalized === "invited") return "pending";
    if (
      normalized === "suspended" ||
      normalized === "blocked" ||
      normalized === "disabled"
    )
      return "suspended";
  }
  if (typeof statusValue === "boolean") {
    return statusValue ? "active" : "suspended";
  }
  const isActive = raw.is_active ?? raw.active ?? raw.isActive;
  if (typeof isActive === "boolean") {
    return isActive ? "active" : "suspended";
  }
  const isSuspended =
    raw.suspended ?? raw.isSuspended ?? raw.disabled ?? raw.isDisabled;
  if (typeof isSuspended === "boolean") {
    return isSuspended ? "suspended" : "active";
  }
  return "active";
};

// Normalizes raw API payloads into the AdminUser shape.
export const normalizeAdminUser = (data: unknown): AdminUser | null => {
  if (!isRecord(data)) return null;
  const id = toCleanString(data.id ?? data.userId ?? data._id);
  if (!id) return null;
  const email = toCleanString(data.email ?? data.mail ?? data.userEmail);
  const name = toCleanString(
    data.name ?? data.fullName ?? data.displayName ?? data.username
  );
  const role =
    normalizeRoleValue(data.role ?? data.roles ?? data.userRole) || "user";
  const status = normalizeUserStatus(data);
  const lastActive = formatLastActive(
    data.lastActive ??
      data.last_active ??
      data.lastLogin ??
      data.last_login ??
      data.lastSeen ??
      data.updatedAt ??
      data.updated_at
  );
  const finalEmail = email || "unknown@chargefinder.app";
  const finalName = name || formatNameFromEmail(finalEmail);

  return {
    id,
    name: finalName,
    email: finalEmail,
    role,
    status,
    lastActive,
  };
};

// Computes the next status for the toggle action button.
export const nextStatusForUser = (status: AdminUser["status"]) => {
  if (status === "active") return "suspended";
  if (status === "suspended") return "active";
  return "active";
};

// Maps a user status to the action label shown in the UI.
export const userActionLabel = (status: AdminUser["status"]) => {
  if (status === "active") return "Suspend";
  if (status === "suspended") return "Activate";
  return "Approve";
};

// Defines the station status chip colors for the admin list.
export const statusChipStyles = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return {
        backgroundColor: "rgba(0, 200, 83, 0.12)",
        border: "1px solid rgba(0, 200, 83, 0.35)",
        color: UI.text,
      };
    case "BUSY":
      return {
        backgroundColor: "rgba(255, 193, 7, 0.18)",
        border: "1px solid rgba(255, 193, 7, 0.4)",
        color: UI.text,
      };
    case "OFFLINE":
      return {
        backgroundColor: "rgba(244, 67, 54, 0.14)",
        border: "1px solid rgba(244, 67, 54, 0.35)",
        color: UI.text,
      };
    default:
      return {
        backgroundColor: "rgba(10, 10, 16, 0.05)",
        border: `1px solid ${UI.border2}`,
        color: UI.text,
      };
  }
};

// Defines role chip colors for admin user badges.
export const roleChipStyles = (role: string) => {
  switch (role) {
    case "admin":
      return {
        backgroundColor: "rgba(124,92,255,0.12)",
        border: "1px solid rgba(124,92,255,0.35)",
        color: UI.text,
      };
    case "operator":
      return {
        backgroundColor: "rgba(0,229,255,0.12)",
        border: "1px solid rgba(0,229,255,0.35)",
        color: UI.text,
      };
    default:
      return {
        backgroundColor: "rgba(10, 10, 16, 0.05)",
        border: `1px solid ${UI.border2}`,
        color: UI.text,
      };
  }
};

// Defines user status chip colors for the admin list.
export const userStatusChipStyles = (status: AdminUser["status"]) => {
  switch (status) {
    case "active":
      return {
        backgroundColor: "rgba(0, 200, 83, 0.12)",
        border: "1px solid rgba(0, 200, 83, 0.35)",
        color: UI.text,
      };
    case "pending":
      return {
        backgroundColor: "rgba(255, 193, 7, 0.18)",
        border: "1px solid rgba(255, 193, 7, 0.4)",
        color: UI.text,
      };
    case "suspended":
      return {
        backgroundColor: "rgba(244, 67, 54, 0.14)",
        border: "1px solid rgba(244, 67, 54, 0.35)",
        color: UI.text,
      };
    default:
      return {
        backgroundColor: "rgba(10, 10, 16, 0.05)",
        border: `1px solid ${UI.border2}`,
        color: UI.text,
      };
  }
};
