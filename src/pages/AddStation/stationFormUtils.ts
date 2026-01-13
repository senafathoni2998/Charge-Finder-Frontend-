import type {
  Availability,
  ConnectorType,
  StationPricing,
  StationPhoto,
} from "../../models/model";

type StationConnectorPayload = {
  type: ConnectorType;
  powerKW: number;
  ports: number;
  availablePorts: number;
};

export type StationFormPayload = {
  name: string;
  address: string;
  status: Availability;
  lat: number;
  lng: number;
  connectors: StationConnectorPayload[];
  pricing: StationPricing;
  amenities: string[];
  photos: StationPhoto[];
  notes?: string | null;
  lastUpdatedISO: string;
};

type StationFormParseResult =
  | { ok: true; payload: StationFormPayload }
  | { ok: false; error: string };

const VALID_STATUSES = new Set<Availability>(["AVAILABLE", "BUSY", "OFFLINE"]);
const VALID_CONNECTORS = new Set<ConnectorType>(["CCS2", "Type2", "CHAdeMO"]);

const parseNumber = (value: unknown): number | null => {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseJson = (raw: FormDataEntryValue | null, fallback: unknown) => {
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const parseAmenities = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

const parsePhotos = (raw: unknown): StationPhoto[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rawPhoto = item as Partial<StationPhoto>;
      const label =
        typeof rawPhoto.label === "string" && rawPhoto.label.trim()
          ? rawPhoto.label.trim()
          : "";
      const gradient =
        typeof rawPhoto.gradient === "string" && rawPhoto.gradient.trim()
          ? rawPhoto.gradient.trim()
          : "";
      if (!label || !gradient) return null;
      return { label, gradient };
    })
    .filter(Boolean) as StationPhoto[];
};

const parseConnectors = (raw: unknown): StationConnectorPayload[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rawConnector = item as Partial<StationConnectorPayload>;
      const type = VALID_CONNECTORS.has(rawConnector.type as ConnectorType)
        ? (rawConnector.type as ConnectorType)
        : null;
      const powerKW = parseNumber(rawConnector.powerKW);
      const ports = parseNumber(rawConnector.ports);
      const availablePorts = parseNumber(rawConnector.availablePorts);
      if (!type || powerKW == null || ports == null || availablePorts == null) {
        return null;
      }
      if (ports <= 0 || powerKW <= 0 || availablePorts < 0) {
        return null;
      }
      return {
        type,
        powerKW,
        ports,
        availablePorts: Math.min(availablePorts, ports),
      };
    })
    .filter(Boolean) as StationConnectorPayload[];
};

export const parseStationFormData = (
  formData: FormData
): StationFormParseResult => {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Station name is required." };

  const address = String(formData.get("address") || "").trim();
  if (!address) return { ok: false, error: "Address is required." };

  const statusRaw = String(formData.get("status") || "").trim().toUpperCase();
  const status = VALID_STATUSES.has(statusRaw as Availability)
    ? (statusRaw as Availability)
    : "AVAILABLE";

  const lat = parseNumber(formData.get("lat"));
  const lng = parseNumber(formData.get("lng"));
  if (lat == null || lng == null) {
    return { ok: false, error: "Latitude and longitude are required." };
  }

  const connectorsRaw = parseJson(formData.get("connectors"), []);
  const connectors = parseConnectors(connectorsRaw);
  if (!connectors.length) {
    return {
      ok: false,
      error: "Add at least one connector with valid power and ports.",
    };
  }

  const pricingRaw = parseJson(formData.get("pricing"), {}) as Record<
    string,
    unknown
  >;
  const currency =
    typeof pricingRaw.currency === "string" ? pricingRaw.currency.trim() : "";
  const perKwh = parseNumber(pricingRaw.perKwh);
  if (!currency || perKwh == null || perKwh <= 0) {
    return { ok: false, error: "Pricing currency and per kWh are required." };
  }
  const perMinute = parseNumber(pricingRaw.perMinute);
  const parkingFee =
    typeof pricingRaw.parkingFee === "string"
      ? pricingRaw.parkingFee.trim()
      : undefined;

  const amenitiesRaw = parseJson(formData.get("amenities"), []);
  const amenities = parseAmenities(amenitiesRaw);

  const photosRaw = parseJson(formData.get("photos"), []);
  const photos = parsePhotos(photosRaw);

  const notes = String(formData.get("notes") || "").trim();

  return {
    ok: true,
    payload: {
      name,
      address,
      status,
      lat,
      lng,
      connectors,
      pricing: {
        currency,
        perKwh,
        ...(perMinute && perMinute > 0 ? { perMinute } : {}),
        ...(parkingFee ? { parkingFee } : {}),
      },
      amenities,
      photos,
      notes: notes || null,
      lastUpdatedISO: new Date().toISOString(),
    },
  };
};
