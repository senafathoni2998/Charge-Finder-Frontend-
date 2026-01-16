import { useCallback, useState } from "react";

export function useGeoLocation() {
  const [loc, setLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(0);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this environment.");
      setLoading(false);
      setRequestId((prev) => prev + 1);
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        debugger;
        console.log("Got position:", pos);
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
        setRequestId((prev) => prev + 1);
      },
      (err) => {
        setError(err.message || "Failed to get location.");
        setLoading(false);
        setRequestId((prev) => prev + 1);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  return { loc, loading, error, request, requestId };
}
