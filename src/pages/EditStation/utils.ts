import type { ConnectorType, Station } from "../../models/model";
import type {
  StationConnectorDraft,
  StationFormValues,
  StationPhotoDraft,
} from "../AddStation/components/StationFormCard";

const DEFAULT_MAP_CENTER = { lat: -6.2, lng: 106.8167 };

// Generates a unique identifier for draft items in the form.
export const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Builds a default connector draft with starter values.
export const createDefaultConnector = (
  connectorType: ConnectorType
): StationConnectorDraft => ({
  id: makeId("connector"),
  type: connectorType,
  powerKW: "50",
  ports: "2",
  availablePorts: "2",
});

// Builds an empty photo draft entry.
export const createDefaultPhoto = (): StationPhotoDraft => ({
  id: makeId("photo"),
  label: "",
  gradient: "",
});

// Converts station connector data into editable drafts.
const buildConnectorDrafts = (
  station: Station | null,
  defaultConnectorType: ConnectorType
): StationConnectorDraft[] => {
  if (station?.connectors?.length) {
    return station.connectors.map((connector) => ({
      id: makeId("connector"),
      type: connector.type,
      powerKW: String(connector.powerKW ?? ""),
      ports: String(connector.ports ?? ""),
      availablePorts: String(connector.availablePorts ?? ""),
    }));
  }
  return [createDefaultConnector(defaultConnectorType)];
};

// Converts station photos into editable drafts.
const buildPhotoDrafts = (station: Station | null): StationPhotoDraft[] => {
  if (station?.photos?.length) {
    return station.photos.map((photo) => ({
      id: makeId("photo"),
      label: photo.label || "",
      gradient: photo.gradient || "",
    }));
  }
  return [createDefaultPhoto()];
};

// Builds the initial form values from an existing station record.
export const buildEditStationDefaults = (
  station: Station | null,
  defaultConnectorType: ConnectorType
): StationFormValues => ({
  name: station?.name ?? "",
  address: station?.address ?? "",
  status: station?.status ?? "AVAILABLE",
  lat: Number.isFinite(station?.lat ?? Number.NaN) ? String(station?.lat) : "",
  lng: Number.isFinite(station?.lng ?? Number.NaN) ? String(station?.lng) : "",
  connectors: buildConnectorDrafts(station, defaultConnectorType),
  pricing: {
    currency: station?.pricing?.currency || "IDR",
    perKwh:
      station?.pricing?.perKwh != null ? String(station.pricing.perKwh) : "",
    perMinute:
      station?.pricing?.perMinute != null
        ? String(station.pricing.perMinute)
        : "",
    parkingFee: station?.pricing?.parkingFee || "",
  },
  amenities: station?.amenities?.join(", ") || "",
  photos: buildPhotoDrafts(station),
  notes: station?.notes || "",
});

// Selects the preferred map center based on form coordinates and fallback.
export const getMapCenter = (
  lat: string,
  lng: string,
  fallback?: { lat: number; lng: number }
) => {
  const latNum = lat.trim() ? Number(lat) : Number.NaN;
  const lngNum = lng.trim() ? Number(lng) : Number.NaN;
  if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
    return { lat: latNum, lng: lngNum };
  }
  return fallback ?? DEFAULT_MAP_CENTER;
};

// Validates station form values and returns a user-facing error.
export const validateStationForm = (values: StationFormValues): string | null => {
  if (!values.name.trim()) return "Station name is required.";
  if (!values.address.trim()) return "Address is required.";
  if (
    !values.lat.trim() ||
    !values.lng.trim() ||
    !Number.isFinite(Number(values.lat)) ||
    !Number.isFinite(Number(values.lng))
  ) {
    return "Latitude and longitude must be valid numbers.";
  }
  const invalidConnector = values.connectors.some((connector) => {
    const power = Number(connector.powerKW);
    const ports = Number(connector.ports);
    const available = Number(connector.availablePorts);
    return (
      !connector.type ||
      !Number.isFinite(power) ||
      power <= 0 ||
      !Number.isFinite(ports) ||
      ports <= 0 ||
      !Number.isFinite(available) ||
      available < 0
    );
  });
  if (!values.connectors.length || invalidConnector) {
    return "Add at least one valid connector entry.";
  }
  if (
    !values.pricing.currency.trim() ||
    !values.pricing.perKwh.trim() ||
    !Number.isFinite(Number(values.pricing.perKwh))
  ) {
    return "Pricing currency and per kWh are required.";
  }
  return null;
};
