const LOCAL_KEYS = {
  authToken: "cf_auth_token",
  authId: "cf_auth_id",
  authEmail: "cf_auth_email",
  profileRegion: "cf_profile_region",
  loginEmail: "cf_login_email",
};

type SignupSessionPayload = {
  token?: string | null;
  userId: string;
  email: string;
  region: string | null;
  remember: boolean;
};

// Persists signup session data for subsequent authenticated requests.
export const persistSignupSession = ({
  token,
  userId,
  email,
  region,
  remember,
}: SignupSessionPayload) => {
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
    if (remember) {
      window.localStorage.setItem(LOCAL_KEYS.loginEmail, email);
    } else {
      window.localStorage.removeItem(LOCAL_KEYS.loginEmail);
    }
  } catch {
    // ignore
  }
};
