type FetchVehicleResult = {
  ok: boolean;
  vehicle: Record<string, unknown> | null;
  error?: string;
};

// Loads a single vehicle by id.
export const fetchVehicleById = async (
  vehicleId: string,
  signal?: AbortSignal
): Promise<FetchVehicleResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, vehicle: null, error: "Backend URL is not configured." };
  }

  if (!vehicleId) {
    return { ok: false, vehicle: null, error: "Vehicle is missing." };
  }

  try {
    const response = await fetch(
      `${baseUrl}/vehicles/${encodeURIComponent(vehicleId)}`,
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
        vehicle: null,
        error: data.message || "Could not load vehicle.",
      };
    }

    const vehicle =
      data && typeof data === "object"
        ? (data as { vehicle?: Record<string, unknown> }).vehicle ?? data
        : null;
    if (!vehicle || typeof vehicle !== "object") {
      return { ok: false, vehicle: null, error: "Vehicle not found." };
    }

    return { ok: true, vehicle: vehicle as Record<string, unknown> };
  } catch (err) {
    return {
      ok: false,
      vehicle: null,
      error: err instanceof Error ? err.message : "Could not load vehicle.",
    };
  }
};
