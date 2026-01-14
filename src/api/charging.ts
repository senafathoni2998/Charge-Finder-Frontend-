type ChargingRequestParams = {
  stationId: string;
  signal?: AbortSignal;
};

type ChargingProgressParams = {
  stationId: string;
  progressPercent: number;
  signal?: AbortSignal;
};

type ChargingRequestResult = {
  ok: boolean;
  ticket?: Record<string, unknown> | null;
  error?: string;
};

type ChargingProgressResult = {
  ok: boolean;
  ticket?: Record<string, unknown> | null;
  error?: string;
};

// Starts a charging session for the user's active ticket.
export const startChargingSession = async ({
  stationId,
  signal,
}: ChargingRequestParams): Promise<ChargingRequestResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!stationId) {
    return { ok: false, error: "Station is missing." };
  }

  try {
    const response = await fetch(`${baseUrl}/stations/start-charging`, {
      method: "POST",
      body: JSON.stringify({ stationId }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: data.message || "Could not start charging.",
      };
    }

    return { ok: true, ticket: data?.ticket ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not start charging.",
    };
  }
};

// Updates charging progress for the user's active ticket.
export const updateChargingProgress = async ({
  stationId,
  progressPercent,
  signal,
}: ChargingProgressParams): Promise<ChargingProgressResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!stationId) {
    return { ok: false, error: "Station is missing." };
  }

  if (!Number.isFinite(progressPercent)) {
    return { ok: false, error: "Progress percent is invalid." };
  }

  try {
    const response = await fetch(`${baseUrl}/stations/charging-progress`, {
      method: "PATCH",
      body: JSON.stringify({ stationId, progressPercent }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: data.message || "Could not update charging progress.",
      };
    }

    return { ok: true, ticket: data?.ticket ?? null };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Could not update charging progress.",
    };
  }
};

// Completes the charging session and clears the active ticket.
export const completeChargingSession = async ({
  stationId,
  signal,
}: ChargingRequestParams): Promise<ChargingRequestResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!stationId) {
    return { ok: false, error: "Station is missing." };
  }

  try {
    const response = await fetch(`${baseUrl}/stations/complete-charging`, {
      method: "POST",
      body: JSON.stringify({ stationId }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: data.message || "Could not complete charging.",
      };
    }

    return { ok: true, ticket: data?.ticket ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not complete charging.",
    };
  }
};
