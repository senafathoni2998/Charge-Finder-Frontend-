import type { Station } from "../models/model";

type FetchStationsResult = {
  ok: boolean;
  stations: Station[];
  error?: string;
};

// Loads stations from the backend, returning an empty list on failures.
export const fetchStations = async (
  signal?: AbortSignal
): Promise<FetchStationsResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, stations: [], error: "Backend URL is not configured." };
  }

  try {
    const response = await fetch(`${baseUrl}/stations`, {
      method: "GET",
      credentials: "include",
      signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        stations: [],
        error: data.message || "Could not load stations.",
      };
    }

    const stations = Array.isArray(data?.stations) ? data.stations : [];
    return { ok: true, stations };
  } catch (err) {
    return {
      ok: false,
      stations: [],
      error: err instanceof Error ? err.message : "Could not load stations.",
    };
  }
};
