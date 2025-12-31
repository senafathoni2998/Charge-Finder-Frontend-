export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

export function boundsFromStations(stations) {
  const lats = stations.map((s) => s.lat);
  const lngs = stations.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // avoid 0 span
  const latSpan = Math.max(0.00001, maxLat - minLat);
  const lngSpan = Math.max(0.00001, maxLng - minLng);
  return { minLat, maxLat, minLng, maxLng, latSpan, lngSpan };
}

export function filterStations(stations, filters, userCenter) {
  const lower = filters.q.toLowerCase();
  return stations
    .filter((s) => {
      const matchesQ = !filters.q
        ? true
        : s.name.toLowerCase().includes(lower) ||
          s.address.toLowerCase().includes(lower);

      const matchesStatus = !filters.status
        ? true
        : s.status === filters.status;

      const matchesConnector = filters.connectorSet.size
        ? s.connectors.some((c) => filters.connectorSet.has(c.type))
        : true;

      const matchesMinKw = filters.minKW
        ? s.connectors.some((c) => c.powerKW >= filters.minKW)
        : true;

      return matchesQ && matchesStatus && matchesConnector && matchesMinKw;
    })
    .map((s) => {
      const distanceKm = haversineKm(userCenter, { lat: s.lat, lng: s.lng });
      return { ...s, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
