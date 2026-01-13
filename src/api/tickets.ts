import type { ConnectorType } from "../models/model";

type RequestChargingTicketParams = {
  stationId: string;
  connectorType?: ConnectorType;
  signal?: AbortSignal;
};

type RequestChargingTicketResult = {
  ok: boolean;
  ticket?: Record<string, unknown> | null;
  error?: string;
};

type FetchActiveTicketResult = {
  ok: boolean;
  ticket?: Record<string, unknown> | null;
  error?: string;
};

export const requestChargingTicket = async ({
  stationId,
  connectorType,
  signal,
}: RequestChargingTicketParams): Promise<RequestChargingTicketResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!stationId) {
    return { ok: false, error: "Station is missing." };
  }

  const payload: { stationId: string; connectorType?: ConnectorType } = {
    stationId,
  };
  if (connectorType) {
    payload.connectorType = connectorType;
  }

  try {
    const response = await fetch(`${baseUrl}/stations/request-ticket`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: data.message || "Could not request ticket.",
      };
    }

    return { ok: true, ticket: data?.ticket ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not request ticket.",
    };
  }
};

export const fetchActiveTicketForStation = async (
  stationId: string,
  signal?: AbortSignal
): Promise<FetchActiveTicketResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!stationId) {
    return { ok: false, error: "Station is missing." };
  }

  try {
    const response = await fetch(
      `${baseUrl}/stations/${stationId}/active-ticket`,
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
        error: data.message || "Could not load active ticket.",
      };
    }

    return { ok: true, ticket: data?.ticket ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not load active ticket.",
    };
  }
};
