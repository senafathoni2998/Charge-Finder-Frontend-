import type { Station } from "../models/model";

type StationPayload = Omit<Station, "id"> & { id?: string };

type StationMutationResult = {
  ok: boolean;
  station: Station | null;
  error?: string;
};

type StationDeleteResult = {
  ok: boolean;
  error?: string;
};

// Creates a new station using admin credentials.
export const createStation = async (
  payload: StationPayload,
  signal?: AbortSignal
): Promise<StationMutationResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return {
      ok: false,
      station: null,
      error: "Backend URL is not configured.",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/stations/add-station`, {
      method: "POST",
      credentials: "include",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        station: null,
        error: data.message || "Could not create station.",
      };
    }

    const station = (data?.station ?? data?.data ?? null) as Station | null;
    return { ok: true, station };
  } catch (err) {
    return {
      ok: false,
      station: null,
      error: err instanceof Error ? err.message : "Could not create station.",
    };
  }
};

// Updates a station using admin credentials.
export const updateStation = async (
  stationId: string,
  payload: StationPayload,
  signal?: AbortSignal
): Promise<StationMutationResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return {
      ok: false,
      station: null,
      error: "Backend URL is not configured.",
    };
  }

  if (!stationId) {
    return { ok: false, station: null, error: "Station ID is missing." };
  }

  try {
    const response = await fetch(`${baseUrl}/stations/update-station`, {
      method: "PATCH",
      credentials: "include",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        stationId,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        station: null,
        error: data.message || "Could not update station.",
      };
    }

    const station = (data?.station ?? data?.data ?? null) as Station | null;
    return { ok: true, station };
  } catch (err) {
    return {
      ok: false,
      station: null,
      error: err instanceof Error ? err.message : "Could not update station.",
    };
  }
};

// Deletes a station using admin credentials.
export const deleteStation = async (
  stationId: string,
  signal?: AbortSignal
): Promise<StationDeleteResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!stationId) {
    return { ok: false, error: "Station ID is missing." };
  }

  try {
    const response = await fetch(`${baseUrl}/stations/delete-station`, {
      method: "DELETE",
      credentials: "include",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: data.message || "Could not delete station.",
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not delete station.",
    };
  }
};
