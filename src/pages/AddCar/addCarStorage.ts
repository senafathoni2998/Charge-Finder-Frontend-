const LOCAL_KEYS = {
  activeCarId: "cf_active_car_id",
};

// Persists the active car id for later personalization.
export const persistActiveCarId = (carId: string | number | null | undefined) => {
  if (typeof window === "undefined") return;
  if (!carId) return;
  try {
    window.localStorage.setItem(LOCAL_KEYS.activeCarId, String(carId));
  } catch {
    // ignore
  }
};
