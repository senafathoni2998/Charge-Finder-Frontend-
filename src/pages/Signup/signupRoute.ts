import { redirect } from "react-router";
import store from "../../app/store";
import { login } from "../../features/auth/authSlice";
import { isValidEmail, passwordIssue } from "../../utils/validate";
import { persistSignupSession } from "./signupStorage";
import { safeNextPath } from "./signupUtils";

// Handles signup submissions and initializes the auth session.
export async function signupAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm") || "");
  const remember = formData.get("remember") === "1";

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }
  const pwIssue = passwordIssue(password);
  if (pwIssue) {
    return { error: pwIssue };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { error: "Backend URL is not configured." };
  }

  try {
    const response = await fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
        region,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: responseData.message || "Failed to sign up." };
    }

    const user = responseData.user || {};
    const userEmail =
      typeof user.email === "string" && user.email.trim()
        ? user.email.trim()
        : email;
    const userName =
      typeof user.name === "string" && user.name.trim()
        ? user.name.trim()
        : name || null;
    const userRegion =
      typeof user.region === "string" && user.region.trim()
        ? user.region.trim()
        : region || null;
    const userId =
      typeof user.id === "string"
        ? user.id
        : user.id != null
        ? String(user.id)
        : "";

    persistSignupSession({
      token: user.token,
      userId,
      email: userEmail,
      region: userRegion,
      remember,
    });

    store.dispatch(
      login({
        email: userEmail,
        name: userName,
        region: userRegion,
        userId: userId,
      })
    );

    const url = new URL(request.url);
    const nextPath = safeNextPath(url.searchParams.get("next"));
    return redirect(nextPath);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to sign up.",
    };
  }
}
