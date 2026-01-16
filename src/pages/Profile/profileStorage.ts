import type { UserCar } from "../../features/auth/authSlice";

const LOCAL_KEYS = {
  authToken: "cf_auth_token",
  authEmail: "cf_auth_email",
  profileName: "cf_profile_name",
  profileRegion: "cf_profile_region",
  profileRole: "cf_profile_role",
  userCar: "cf_user_car",
  userCars: "cf_user_cars",
  activeCarId: "cf_active_car_id",
  authId: "cf_auth_id",
};

const SESSION_KEYS = {
  logoutRedirect: "cf_logout_redirect",
};

const getLocalStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

// Reads the stored auth token when available.
export const readStoredAuthToken = (): string | null => {
  const storage = getLocalStorage();
  return storage ? storage.getItem(LOCAL_KEYS.authToken) : null;
};

// Reads the stored active car id when available.
export const readStoredActiveCarId = (): string | null => {
  const storage = getLocalStorage();
  return storage ? storage.getItem(LOCAL_KEYS.activeCarId) : null;
};

// Reads the stored user id as a fallback for form submissions.
export const readStoredUserId = (): string | null => {
  const storage = getLocalStorage();
  return storage ? storage.getItem(LOCAL_KEYS.authId) : null;
};

// Persists profile name/region to local storage for fast reloads.
export const persistProfileToStorage = (
  name: string | null,
  region: string | null,
  role?: string | null
) => {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    if (name) storage.setItem(LOCAL_KEYS.profileName, name);
    else storage.removeItem(LOCAL_KEYS.profileName);
    if (region) storage.setItem(LOCAL_KEYS.profileRegion, region);
    else storage.removeItem(LOCAL_KEYS.profileRegion);
    if (role) storage.setItem(LOCAL_KEYS.profileRole, role);
    else if (role === null) storage.removeItem(LOCAL_KEYS.profileRole);
  } catch {
    // ignore
  }
};

// Persists user cars and active car selection to local storage.
export const persistCarsToStorage = (
  cars: UserCar[],
  activeCarId: string | null
) => {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(LOCAL_KEYS.userCars, JSON.stringify(cars));
    if (activeCarId) storage.setItem(LOCAL_KEYS.activeCarId, activeCarId);
    else storage.removeItem(LOCAL_KEYS.activeCarId);
    storage.removeItem(LOCAL_KEYS.userCar);
  } catch {
    // ignore
  }
};

// Clears auth-related storage on logout and flags a redirect hint.
export const clearAuthStorage = (
  options: { setLogoutRedirect?: boolean } = {}
) => {
  if (typeof window === "undefined") return;
  try {
    const storage = window.localStorage;
    storage.removeItem(LOCAL_KEYS.authToken);
    storage.removeItem(LOCAL_KEYS.authEmail);
    storage.removeItem(LOCAL_KEYS.profileName);
    storage.removeItem(LOCAL_KEYS.profileRegion);
    storage.removeItem(LOCAL_KEYS.profileRole);
    storage.removeItem(LOCAL_KEYS.userCar);
    storage.removeItem(LOCAL_KEYS.userCars);
    storage.removeItem(LOCAL_KEYS.activeCarId);
    if (options.setLogoutRedirect !== false) {
      window.sessionStorage.setItem(SESSION_KEYS.logoutRedirect, "1");
    }
  } catch {
    // ignore
  }
};
