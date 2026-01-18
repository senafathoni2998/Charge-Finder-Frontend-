import { formatCurrency } from "../../utils/distance";
import type { Station } from "./types";

// Builds a Google Maps query URL for a station coordinate.
export const buildMapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

// Computes the ticket price label for a given station and kWh amount.
export const getTicketPriceLabel = (
  station: Station | null,
  ticketKwh: number,
  pricePerKwhOverride?: number | null
) => {
  if (!station) return "N/A";
  const perKwh = Number.isFinite(pricePerKwhOverride)
    ? Number(pricePerKwhOverride)
    : station.pricing.perKwh;
  if (!Number.isFinite(perKwh)) return "—";
  return formatCurrency(station.pricing.currency, perKwh * ticketKwh);
};

// Builds the payload used for native share.
export const getSharePayload = (station: Station) => ({
  title: station.name,
  text: `${station.name} \u2014 ${station.address}`,
  url: buildMapsUrl(station.lat, station.lng),
});
