import type { UserCar } from "../../features/auth/authSlice";
import type { EditCarFormValues } from "./types";

// Finds the car that matches the route parameter, or null if missing.
export const findCarById = (
  cars: UserCar[],
  carId: string | null | undefined
): UserCar | null => {
  if (!carId) return null;
  return cars.find((item) => item.id === carId) ?? null;
};

// Converts a stored car into the editable form defaults.
export const getCarFormDefaults = (car: UserCar | null): EditCarFormValues => ({
  name: car?.name ?? "",
  connectors: new Set(car?.connectorTypes ?? []),
  minKW: Number.isFinite(car?.minKW ?? Number.NaN) ? car?.minKW ?? 0 : 0,
});
