import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LocationCity } from "@mui/icons-material";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";
import { isValidEmail, isValidName, toneChipSx } from "../../../utils/validate";

type SignupFormValues = {
  name: string;
  region: string;
  email: string;
  password: string;
  confirm: string;
};

type SignupFormHandlers = {
  onNameChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
};

type PasswordStrength = {
  label: string;
  tone: "weak" | "ok" | "strong";
};

type SignupFormCardProps = {
  values: SignupFormValues;
  handlers: SignupFormHandlers;
  error: string | null;
  onDismissError: () => void;
  onSubmit: (event: FormEvent) => void;
  pwIssue: string | null;
  pwStrength: PasswordStrength;
  passwordsMatch: boolean;
  isSubmitting: boolean;
  onNavigateToLogin: () => void;
};

// Renders the signup card with form fields and helper text.
export default function SignupFormCard({
  values,
  handlers,
  error,
  onDismissError,
  onSubmit,
  pwIssue,
  pwStrength,
  passwordsMatch,
  isSubmitting,
  onNavigateToLogin,
}: SignupFormCardProps) {
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: "0 18px 50px rgba(10,10,16,0.12)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: 10,
          background: UI.brandGradStrong,
        }}
      />
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontWeight: 980,
                color: UI.text,
                fontSize: 26,
                lineHeight: 1.15,
              }}
            >
              Create your account
            </Typography>
            <Typography sx={{ color: UI.text2, mt: 0.5 }}>
              Save your car profile and personalize stations.
            </Typography>
          </Box>

          {error ? (
            <Alert
              severity="error"
              onClose={onDismissError}
              sx={{
                borderRadius: 3,
                border: `1px solid rgba(244, 67, 54, 0.22)`,
                backgroundColor: "rgba(244, 67, 54, 0.08)",
              }}
            >
              {error}
            </Alert>
          ) : null}

          <Box component={Form} method="post" onSubmit={onSubmit} noValidate>
            <Stack spacing={1.5}>
              <TextField
                placeholder="Your full name"
                label="Name"
                name="name"
                value={values.name}
                onChange={(event) => handlers.onNameChange(event.target.value)}
                autoComplete="name"
                fullWidth
                error={values.name.length > 0 && !isValidName(values.name)}
                helperText={
                  values.name.length > 0 && !isValidName(values.name)
                    ? "Please enter a valid name."
                    : " "
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: UI.text3 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />

              <TextField
                placeholder="Your Region"
                label="Region"
                name="region"
                value={values.region}
                onChange={(event) => handlers.onRegionChange(event.target.value)}
                autoComplete="address-level1"
                fullWidth
                error={values.region.length > 0 && !isValidName(values.region)}
                helperText={
                  values.region.length > 0 && !isValidName(values.region)
                    ? "Please enter a valid region."
                    : " "
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCity sx={{ color: UI.text3 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />

              <TextField
                label="Email"
                placeholder="name@email.com"
                name="email"
                value={values.email}
                onChange={(event) => handlers.onEmailChange(event.target.value)}
                autoComplete="email"
                fullWidth
                error={values.email.length > 0 && !isValidEmail(values.email)}
                helperText={
                  values.email.length > 0 && !isValidEmail(values.email)
                    ? "Example: name@email.com"
                    : " "
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: UI.text3 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />

              <TextField
                label="Password"
                placeholder="At least 7 characters"
                name="password"
                value={values.password}
                onChange={(event) => handlers.onPasswordChange(event.target.value)}
                autoComplete="new-password"
                fullWidth
                type={showPw ? "text" : "password"}
                error={values.password.length > 0 && !!pwIssue}
                helperText={pwIssue ? pwIssue : " "}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: UI.text3 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPw((value) => !value)}
                        edge="end"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? (
                          <VisibilityOffIcon sx={{ color: UI.text3 }} />
                        ) : (
                          <VisibilityIcon sx={{ color: UI.text3 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />

              <TextField
                label="Confirm password"
                placeholder="Re-enter your password"
                name="confirm"
                value={values.confirm}
                onChange={(event) => handlers.onConfirmChange(event.target.value)}
                autoComplete="new-password"
                fullWidth
                type={showConfirm ? "text" : "password"}
                error={values.confirm.length > 0 && !passwordsMatch}
                helperText={
                  values.confirm.length > 0 && !passwordsMatch
                    ? "Passwords do not match."
                    : " "
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: UI.text3 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((value) => !value)}
                        edge="end"
                        aria-label={
                          showConfirm
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirm ? (
                          <VisibilityOffIcon sx={{ color: UI.text3 }} />
                        ) : (
                          <VisibilityIcon sx={{ color: UI.text3 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: -0.5 }}>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Strength: ${pwStrength.label}`}
                  sx={{
                    borderRadius: 999,
                    color: UI.text,
                    fontWeight: 900,
                    borderWidth: 1,
                    ...toneChipSx(pwStrength.tone),
                  }}
                />
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      name="remember"
                      value="1"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      sx={{
                        color: UI.text3,
                        "&.Mui-checked": {
                          color: "rgba(124,92,255,0.95)",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        color: UI.text2,
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      Remember me
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />

                <Box sx={{ flex: 1 }} />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    px: 2.25,
                    py: 1.1,
                    background: UI.brandGradStrong,
                    color: "white",
                    boxShadow: "0 14px 40px rgba(124,92,255,0.16)",
                  }}
                >
                  {isSubmitting ? "Creating\u2026" : "Create account"}
                </Button>
              </Stack>

              <Divider sx={{ borderColor: UI.border2, my: 0.75 }} />

              <Typography variant="body2" sx={{ color: UI.text2 }}>
                Already have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={onNavigateToLogin}
                  underline="hover"
                  sx={{
                    fontWeight: 950,
                    color: "rgba(124,92,255,0.95)",
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </Box>

          <Typography variant="caption" sx={{ color: UI.text3 }}>
            By creating an account, you agree to the demo Terms and Privacy.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
