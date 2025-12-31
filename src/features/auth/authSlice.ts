import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  isAuthenticated: boolean;
  email: string | null;
};

const getInitialAuth = (): AuthState => {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, email: null };
  }
  try {
    const token = window.localStorage.getItem("cf_auth_token");
    const email = window.localStorage.getItem("cf_auth_email");
    return { isAuthenticated: !!token, email: email ?? null };
  } catch {
    return { isAuthenticated: false, email: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuth(),
  reducers: {
    login(state, action: PayloadAction<{ email: string }>) {
      state.isAuthenticated = true;
      state.email = action.payload.email;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.email = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
