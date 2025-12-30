export function normalizeToCanvas(lat, lng, bounds) {
  // y inverted: higher lat -> smaller y
  const x = (lng - bounds.minLng) / bounds.lngSpan;
  const y = 1 - (lat - bounds.minLat) / bounds.latSpan;
  // clamp
  return {
    x: Math.min(0.98, Math.max(0.02, x)),
    y: Math.min(0.98, Math.max(0.02, y)),
  };
}

export function statusColor(status) {
  if (status === "AVAILABLE") return "rgba(0,229,255,0.95)";
  if (status === "BUSY") return "rgba(255,193,7,0.95)";
  return "rgba(244,67,54,0.95)";
}