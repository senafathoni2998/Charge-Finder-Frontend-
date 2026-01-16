type FetchChargingHistoryResult = {
  ok: boolean;
  history: Record<string, unknown>[];
  error?: string;
};

// Loads charging history items for the last 3 days.
export const fetchChargingHistory = async (
  signal?: AbortSignal
): Promise<FetchChargingHistoryResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, history: [], error: "Backend URL is not configured." };
  }

  try {
    const response = await fetch(`${baseUrl}/profile/charging-history`, {
      method: "GET",
      credentials: "include",
      signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        history: [],
        error: data.message || "Could not load charging history.",
      };
    }

    const history = Array.isArray(data?.history) ? data.history : [];
    return { ok: true, history };
  } catch (err) {
    return {
      ok: false,
      history: [],
      error:
        err instanceof Error ? err.message : "Could not load charging history.",
    };
  }
};
