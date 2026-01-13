type ReverseGeocodeResult = {
  ok: boolean;
  address: string | null;
  error?: string;
};

// Resolves an address for a latitude/longitude using OpenStreetMap Nominatim.
export const reverseGeocode = async (
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<ReverseGeocodeResult> => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, address: null, error: "Invalid coordinates." };
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      signal,
      headers: { Accept: "application/json" },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        address: null,
        error: data.message || "Could not resolve address.",
      };
    }
    const address =
      typeof data?.display_name === "string" ? data.display_name.trim() : "";
    if (!address) {
      return { ok: false, address: null, error: "No address found." };
    }
    return { ok: true, address };
  } catch (err) {
    return {
      ok: false,
      address: null,
      error: err instanceof Error ? err.message : "Could not resolve address.",
    };
  }
};
