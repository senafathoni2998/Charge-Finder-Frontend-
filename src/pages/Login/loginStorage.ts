const LOCAL_KEYS = {
  authToken: "cf_auth_token",
  authId: "cf_auth_id",
  authEmail: "cf_auth_email",
  profileRegion: "cf_profile_region",
  profileRole: "cf_profile_role",
  loginEmail: "cf_login_email",
};

type LoginSessionPayload = {
  token?: string | null;
  userId: string;
  email: string;
  region: string | null;
  role?: string | null;
  remember: boolean;
};

// Persists login session data for subsequent authenticated requests.
export const persistLoginSession = ({
  token,
  userId,
  email,
  region,
  role,
  remember,
}: LoginSessionPayload) => {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(LOCAL_KEYS.authToken, token);
    }
    if (userId) {
      window.localStorage.setItem(LOCAL_KEYS.authId, userId);
    }
    window.localStorage.setItem(LOCAL_KEYS.authEmail, email);
    if (region) {
      window.localStorage.setItem(LOCAL_KEYS.profileRegion, region);
    }
    if (role) {
      window.localStorage.setItem(LOCAL_KEYS.profileRole, role);
    } else if (role === null) {
      window.localStorage.removeItem(LOCAL_KEYS.profileRole);
    }
    if (remember) {
      window.localStorage.setItem(LOCAL_KEYS.loginEmail, email);
    } else {
      window.localStorage.removeItem(LOCAL_KEYS.loginEmail);
    }
  } catch {
    // ignore
  }
};

// Loads the previously remembered login email, if present.
export const getRememberedLoginEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCAL_KEYS.loginEmail);
  } catch {
    return null;
  }
};
