import { redirect } from "react-router";
import store from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { persistSessionMessage } from "../../utils/session";
import { passwordIssue } from "../../utils/validate";
import type { ProfileLoaderData } from "./types";
import {
  clearAuthStorage,
  readStoredActiveCarId,
  readStoredAuthToken,
  readStoredUserId,
} from "./profileStorage";

type ProfileFetchResult = {
  ok: boolean;
  status: number;
  data: unknown | null;
};

// Fetches JSON safely for loader routes, returning status details on errors.
const fetchProfileJson = async (
  url: string,
  signal?: AbortSignal
): Promise<ProfileFetchResult> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      signal,
    });
    const status = response.status;
    if (!response.ok) return { ok: false, status, data: null };
    try {
      return { ok: true, status, data: await response.json() };
    } catch {
      return { ok: false, status, data: null };
    }
  } catch {
    return { ok: false, status: 0, data: null };
  }
};

// Loads the profile and vehicle data for the profile route.
export async function profileLoader({ request }: { request: Request }) {
  if (typeof window === "undefined") {
    return { user: null, vehicles: null, activeCarId: null };
  }

  const activeCarId = readStoredActiveCarId();
  const token = readStoredAuthToken();
  if (!token) {
    return { user: null, vehicles: null, activeCarId };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { user: null, vehicles: null, activeCarId };
  }

  const [profileResult, vehiclesResult] = await Promise.all([
    fetchProfileJson(`${baseUrl}/profile`, request.signal),
    fetchProfileJson(`${baseUrl}/vehicles`, request.signal),
  ]);

  const unauthorized = [profileResult.status, vehiclesResult.status].some(
    (status) => status === 401 || status === 403
  );
  if (unauthorized) {
    persistSessionMessage("Your session has expired. Please log in again.");
    clearAuthStorage({ setLogoutRedirect: false });
    store.dispatch(logout());
    return { user: null, vehicles: null, activeCarId };
  }

  const profileData = profileResult.ok ? profileResult.data : null;
  const vehiclesData = vehiclesResult.ok ? vehiclesResult.data : null;

  const user =
    profileData && typeof profileData === "object"
      ? (profileData as { user?: ProfileLoaderData["user"] }).user ?? null
      : null;
  const vehiclesPayload =
    vehiclesData && typeof vehiclesData === "object"
      ? (vehiclesData as { vehicles?: unknown[] }).vehicles
      : null;
  const vehicles = Array.isArray(vehiclesPayload) ? vehiclesPayload : null;

  return { user, vehicles, activeCarId };
}

// Handles profile edits, password changes, and logout submissions.
export async function profileAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "logout") {
    try {
      const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
      if (baseUrl) {
        await fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      }
    } catch {
      // ignore
    }

    clearAuthStorage();
    store.dispatch(logout());
    return redirect("/");
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return {
      intent: intent === "password" ? "password" : "profile",
      error: "Backend URL is not configured.",
    };
  }

  const rawUserId = String(formData.get("userId") || "").trim();
  const userId = rawUserId || readStoredUserId() || "";

  if (intent === "profile") {
    const name = String(formData.get("name") || "").trim();
    const region = String(formData.get("region") || "").trim();
    const imageEntry = formData.get("image");
    const imageFile =
      imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;
    if (!name) {
      return { intent: "profile", error: "Name is required." };
    }
    if (!userId) {
      return { intent: "profile", error: "User session is missing." };
    }
    if (imageFile && !imageFile.type.startsWith("image/")) {
      return {
        intent: "profile",
        error: "Profile photo must be an image file.",
      };
    }

    try {
      const payload = new FormData();
      payload.append("userId", userId);
      payload.append("name", name);
      if (region) payload.append("region", region);
      if (imageFile) payload.append("image", imageFile);

      const response = await fetch(`${baseUrl}/profile/update-profile`, {
        method: "PATCH",
        body: payload,
        credentials: "include",
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          intent: "profile",
          error: responseData.message || "Could not update profile.",
        };
      }
      return {
        intent: "profile",
        ok: true,
        name,
        region: region || null,
      };
    } catch (err) {
      return {
        intent: "profile",
        error: err instanceof Error ? err.message : "Could not update profile.",
      };
    }
  }

  if (intent === "password") {
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    if (!currentPassword.trim()) {
      return { intent: "password", error: "Enter your current password." };
    }
    const issue = passwordIssue(newPassword);
    if (issue) {
      return { intent: "password", error: issue };
    }
    if (!newPassword.trim()) {
      return { intent: "password", error: "Enter a new password." };
    }
    if (newPassword !== confirmPassword) {
      return { intent: "password", error: "Passwords do not match." };
    }
    if (currentPassword === newPassword) {
      return {
        intent: "password",
        error: "New password must be different.",
      };
    }
    if (!userId) {
      return { intent: "password", error: "User session is missing." };
    }

    try {
      const response = await fetch(`${baseUrl}/profile/update-password`, {
        method: "PATCH",
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          intent: "password",
          error: responseData.message || "Failed to update password.",
        };
      }
      return { intent: "password", ok: true };
    } catch (err) {
      return {
        intent: "password",
        error:
          err instanceof Error ? err.message : "Failed to update password.",
      };
    }
  }

  return { intent: "profile", error: "Unknown action." };
}
