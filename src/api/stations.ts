import type { Station } from "../models/model";

type FetchStationsResult = {
  ok: boolean;
  stations: Station[];
  error?: string;
};

type FetchStationResult = {
  ok: boolean;
  station: Station | null;
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

// Loads a single station by id.
export const fetchStationById = async (
  stationId: string,
  signal?: AbortSignal
): Promise<FetchStationResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, station: null, error: "Backend URL is not configured." };
  }

  if (!stationId) {
    return { ok: false, station: null, error: "Station ID is missing." };
  }

  try {
    const response = await fetch(
      `${baseUrl}/stations/${encodeURIComponent(stationId)}`,
      {
        method: "GET",
        credentials: "include",
        signal,
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        station: null,
        error: data.message || "Could not load station.",
      };
    }

    const station =
      data && typeof data === "object"
        ? (data as { station?: Station }).station ?? data
        : null;
    if (!station || typeof station !== "object") {
      return { ok: false, station: null, error: "Station not found." };
    }

    return { ok: true, station: station as Station };
  } catch (err) {
    return {
      ok: false,
      station: null,
      error: err instanceof Error ? err.message : "Could not load station.",
    };
  }
};
