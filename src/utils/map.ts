export const CHARGING_COLOR = "rgba(0,200,83,0.95)";

export function statusColor(status, isChargingHere = false) {
  if (isChargingHere) return CHARGING_COLOR;
  if (status === "AVAILABLE") return "rgba(0,229,255,0.95)";
  if (status === "BUSY") return "rgba(255,193,7,0.95)";
  return "rgba(244,67,54,0.95)";
}
