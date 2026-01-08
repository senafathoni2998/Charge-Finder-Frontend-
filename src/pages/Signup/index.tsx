import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Box, CssBaseline } from "@mui/material";
import {
  useActionData,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router";
import {
  isValidEmail,
  passwordIssue,
  strengthLabel,
} from "../../utils/validate";
import { UI } from "../../theme/theme";
import type { SignupActionData } from "./types";
import { safeNextPath } from "./signupUtils";
import SignupAppBar from "./components/SignupAppBar";
import SignupBackground from "./components/SignupBackground";
import SignupFormCard from "./components/SignupFormCard";

export { signupAction } from "./signupRoute";

// Signup page container that wires form state and layout components.
export default function ChargeFinderSignupPage() {
  const navigate = useNavigate();
  const actionData = useActionData() as SignupActionData | undefined;
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pwIssue = useMemo(() => passwordIssue(password), [password]);
  const pwStrength = useMemo(() => strengthLabel(password), [password]);
  const passwordsMatch = password === confirm;
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
      setError(pwIssue);
      event.preventDefault();
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      event.preventDefault();
      return;
    }
  };

  const handleNavigateToLogin = () => {
    navigate(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  const formValues = { name, region, email, password, confirm };
  const formHandlers = {
    onNameChange: (value: string) => setName(value),
    onRegionChange: (value: string) => setRegion(value),
    onEmailChange: (value: string) => setEmail(value),
    onPasswordChange: (value: string) => setPassword(value),
    onConfirmChange: (value: string) => setConfirm(value),
  };

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <CssBaseline />

      <SignupAppBar />

      <Box
        sx={{
          height: { xs: "auto", md: "calc(100dvh - 65px)" },
          position: "relative",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        <SignupBackground />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "1fr",
            alignItems: "start",
            maxWidth: 520,
            mx: "auto",
          }}
        >
          <SignupFormCard
            values={formValues}
            handlers={formHandlers}
            error={error}
            onDismissError={() => setError(null)}
            onSubmit={handleSubmit}
            pwIssue={pwIssue}
            pwStrength={pwStrength}
            passwordsMatch={passwordsMatch}
            isSubmitting={isSubmitting}
            onNavigateToLogin={handleNavigateToLogin}
          />
        </Box>
      </Box>
    </Box>
  );
}
