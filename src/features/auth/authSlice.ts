import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ConnectorType } from "../../models/model";

type AuthState = {
  isAuthenticated: boolean;
  email: string | null;
  userId: string | null;
  name: string | null;
  region: string | null;
  role: UserRole | null;
  cars: UserCar[];
  activeCarId: string | null;
};

type UserRole = "admin" | "user";

export type UserCar = {
  id: string;
  name: string;
  connectorTypes: ConnectorType[];
  minKW: number;
};

const VALID_CONNECTORS = new Set<ConnectorType>(["CCS2", "Type2", "CHAdeMO"]);

const normalizeRole = (role: unknown): UserRole | null => {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase();
  if (normalized === "admin") return "admin";
  if (normalized === "user") return "user";
  return null;
};

const sanitizeCar = (data: unknown): UserCar | null => {
  if (!data || typeof data !== "object") return null;
  const raw = data as Partial<UserCar>;
  const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : null;
  if (!id) return null;
  const name =
    typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "My EV";
  const connectorTypes = Array.isArray(raw.connectorTypes)
    ? raw.connectorTypes.filter((c): c is ConnectorType =>
        VALID_CONNECTORS.has(c as ConnectorType)
      )
    : [];
  const minKW = Number.isFinite(raw.minKW) ? Number(raw.minKW) : 0;
  return { id, name, connectorTypes, minKW };
};

const parseCars = (raw: string | null): UserCar[] => {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map(sanitizeCar).filter(Boolean) as UserCar[];
  } catch {
    return [];
  }
};

const parseLegacyCar = (raw: string | null): UserCar | null => {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<UserCar>;
    if (!data || typeof data !== "object") return null;
    const name =
      typeof data.name === "string" && data.name.trim()
        ? data.name.trim()
        : "My EV";
    const connectorTypes = Array.isArray(data.connectorTypes)
      ? data.connectorTypes.filter((c): c is ConnectorType =>
          VALID_CONNECTORS.has(c as ConnectorType)
        )
      : [];
    const minKW = Number.isFinite(data.minKW) ? Number(data.minKW) : 0;
    const id = `car-${Date.now()}`;
    return { id, name, connectorTypes, minKW };
  } catch {
    return null;
  }
};

const ensureActiveCarId = (
  cars: UserCar[],
  activeId: string | null
): string | null => {
  if (activeId && cars.some((c) => c.id === activeId)) return activeId;
  return cars.length ? cars[0].id : null;
};

const getInitialAuth = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      isAuthenticated: false,
      email: null,
      userId: null,
      name: null,
      region: null,
      role: null,
      cars: [],
      activeCarId: null,
    };
  }
  try {
    const token = window.localStorage.getItem("cf_auth_token");
    const email = window.localStorage.getItem("cf_auth_email");
    const userId = window.localStorage.getItem("cf_auth_id");
    const name = window.localStorage.getItem("cf_profile_name");
    const region = window.localStorage.getItem("cf_profile_region");
    const role = normalizeRole(window.localStorage.getItem("cf_profile_role"));
    const cars = parseCars(window.localStorage.getItem("cf_user_cars"));
    const legacyCar = parseLegacyCar(
      window.localStorage.getItem("cf_user_car")
    );
    const mergedCars = cars.length ? cars : legacyCar ? [legacyCar] : [];
    const storedActive = window.localStorage.getItem("cf_active_car_id");
    const activeCarId = ensureActiveCarId(mergedCars, storedActive);
    return {
      isAuthenticated: !!token,
      email: email ?? null,
      userId: userId ?? null,
      name: name && name.trim() ? name.trim() : null,
      region: region && region.trim() ? region.trim() : null,
      role,
      cars: mergedCars,
      activeCarId,
    };
  } catch {
    return {
      isAuthenticated: false,
      email: null,
      name: null,
      userId: null,
      region: null,
      role: null,
      cars: [],
      activeCarId: null,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuth(),
  reducers: {
    login(
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        name: string | null;
        region: string | null;
        role?: string | null;
      }>
    ) {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.region = action.payload.region;
      state.role = normalizeRole(action.payload.role);
    },
    updateProfile(
      state,
      action: PayloadAction<{
        name: string | null;
        region: string | null;
        role?: string | null;
      }>
    ) {
      state.name = action.payload.name;
      state.region = action.payload.region;
      if (Object.prototype.hasOwnProperty.call(action.payload, "role")) {
        state.role = normalizeRole(action.payload.role);
      }
    },
    setCars(
      state,
      action: PayloadAction<{
        cars: UserCar[];
        activeCarId?: string | null;
      }>
    ) {
      const sanitized = action.payload.cars
        .map(sanitizeCar)
        .filter(Boolean) as UserCar[];
      const requestedActive = action.payload.activeCarId ?? state.activeCarId;
      state.cars = sanitized;
      state.activeCarId = ensureActiveCarId(sanitized, requestedActive);
    },
    addCar(state, action: PayloadAction<UserCar>) {
      state.cars.push(action.payload);
      state.activeCarId = action.payload.id;
    },
    removeCar(state, action: PayloadAction<string>) {
      const nextCars = state.cars.filter((c) => c.id !== action.payload);
      state.cars = nextCars;
      if (state.activeCarId === action.payload) {
        state.activeCarId = nextCars.length ? nextCars[0].id : null;
      }
    },
    setActiveCar(state, action: PayloadAction<string | null>) {
      state.activeCarId = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.email = null;
      state.userId = null;
      state.name = null;
      state.region = null;
      state.role = null;
      state.cars = [];
      state.activeCarId = null;
    },
  },
});

export const {
  login,
  logout,
  setCars,
  addCar,
  removeCar,
  setActiveCar,
  updateProfile,
} = authSlice.actions;
export default authSlice.reducer;
