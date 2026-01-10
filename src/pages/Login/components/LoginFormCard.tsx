import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";
import { isValidEmail } from "../../../utils/validate";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormHandlers = {
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

type LoginFormCardProps = {
  values: LoginFormValues;
  handlers: LoginFormHandlers;
  error: string | null;
  onDismissError: () => void;
  onSubmit: (event: FormEvent) => void;
  pwIssue: string | null;
  isSubmitting: boolean;
  onForgotPassword: () => void;
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
  onNavigateToSignup: () => void;
};

// Renders the login card with credentials and social sign-in actions.
export default function LoginFormCard({
  values,
  handlers,
  error,
  onDismissError,
  onSubmit,
  pwIssue,
  isSubmitting,
  onForgotPassword,
  onGoogleLogin,
  onAppleLogin,
  onNavigateToSignup,
}: LoginFormCardProps) {
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);

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
              Welcome back
            </Typography>
            <Typography sx={{ color: UI.text2, mt: 0.5 }}>
              Sign in to access your car profile and tickets.
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
                label="Email"
                name="email"
                placeholder="your@email.com"
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
                name="password"
                placeholder="Enter your password"
                value={values.password}
                onChange={(event) =>
                  handlers.onPasswordChange(event.target.value)
                }
                autoComplete="current-password"
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

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: -0.5 }}
              >
                <Box sx={{ flex: 1 }} />
                <Link
                  component="button"
                  type="button"
                  onClick={onForgotPassword}
                  underline="hover"
                  sx={{ color: UI.text2, fontWeight: 800, fontSize: 13 }}
                >
                  Forgot password?
                </Link>
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
                  {isSubmitting ? "Signing in\u2026" : "Sign in"}
                </Button>
              </Stack>

              <Divider sx={{ borderColor: UI.border2, my: 0.75 }} />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onGoogleLogin}
                  startIcon={<GoogleIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                    backgroundColor: "rgba(10,10,16,0.01)",
                  }}
                  fullWidth
                >
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onAppleLogin}
                  startIcon={<AppleIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                    backgroundColor: "rgba(10,10,16,0.01)",
                  }}
                  fullWidth
                >
                  Continue with Apple
                </Button>
              </Stack>

              <Box
                sx={{
                  mt: 0.25,
                  p: 1.25,
                  borderRadius: 3,
                  border: `1px dashed ${UI.border}`,
                  backgroundColor: "rgba(10,10,16,0.02)",
                }}
              >
                <Typography variant="body2" sx={{ color: UI.text2 }}>
                  New here?{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={onNavigateToSignup}
                    underline="hover"
                    sx={{
                      fontWeight: 950,
                      color: "rgba(124,92,255,0.95)",
                    }}
                  >
                    Create an account
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Typography variant="caption" sx={{ color: UI.text3 }}>
            By signing in, you agree to the demo Terms and Privacy.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
