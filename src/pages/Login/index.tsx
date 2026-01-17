import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Box, CssBaseline, Snackbar } from "@mui/material";
import {
  useActionData,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router";
import { isValidEmail, passwordIssue } from "../../utils/validate";
import { UI } from "../../theme/theme";
import type { LoginActionData } from "./types";
import { getRememberedLoginEmail } from "./loginStorage";
import { safeNextPath } from "./loginUtils";
import { consumeSessionMessage } from "../../utils/session";
import LoginAppBar from "./components/LoginAppBar";
import LoginBackground from "./components/LoginBackground";
import LoginFormCard from "./components/LoginFormCard";

export { loginAction } from "./loginRoute";

// Login page container that wires form state and layout components.
export default function ChargeFinderLoginPage() {
  const navigate = useNavigate();
  const actionData = useActionData() as LoginActionData | undefined;
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(() => getRememberedLoginEmail() ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(() =>
    consumeSessionMessage()
  );

  const pwIssue = useMemo(() => passwordIssue(password), [password]);
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) setError(actionData.error);
  }, [actionData]);

  // Performs client-side validation before submitting the form.
  const handleSubmit = (event: FormEvent) => {
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      event.preventDefault();
      return;
    }
    if (pwIssue) {
      setError(pwIssue || "Invalid password.");
      event.preventDefault();
      return;
    }
  };

  const handleForgotPassword = () => {
    setToast("Forgot password (demo). Wire to reset flow.");
  };


  const handleNavigateToSignup = () => {
    navigate(`/signup?next=${encodeURIComponent(nextPath)}`);
  };

  const formValues = { email, password };
  const formHandlers = {
    onEmailChange: (value: string) => setEmail(value),
    onPasswordChange: (value: string) => setPassword(value),
  };

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <CssBaseline />

      <LoginAppBar onNavigateHome={() => navigate("/")} />

      <Box
        sx={{
          width: "100%",
          height: { xs: "auto", md: "calc(100dvh - 65px)" },
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "flex-start", md: "center" },
          alignItems: "center",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        <LoginBackground />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "1fr",
            alignItems: "start",
            width: "100%",
            maxWidth: 520,
            mx: "auto",
          }}
        >
          <LoginFormCard
            values={formValues}
            handlers={formHandlers}
            error={error}
            onDismissError={() => setError(null)}
            onSubmit={handleSubmit}
            pwIssue={pwIssue}
            isSubmitting={isSubmitting}
            onForgotPassword={handleForgotPassword}
            onNavigateToSignup={handleNavigateToSignup}
          />
        </Box>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={3200}
        onClose={() => setToast(null)}
        message={toast || ""}
      />
    </Box>
  );
}
