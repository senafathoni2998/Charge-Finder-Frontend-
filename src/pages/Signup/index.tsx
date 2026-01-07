import * as React from "react";
import { useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Snackbar,
} from "@mui/material";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate, useSearchParams } from "react-router";
import {
  isValidEmail,
  isValidName,
  passwordIssue,
  strengthLabel,
  toneChipSx,
} from "../../utils/validate";
import { UI } from "../../theme/theme";
import { useAppDispatch } from "../../app/hooks";
import { login } from "../../features/auth/authSlice";
import useHttpClient from "../../hooks/http-hook";
import PersonIcon from "@mui/icons-material/Person";
import { LocationCity } from "@mui/icons-material";

export default function ChargeFinderSignupPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { sendRequest, error: httpError, clearError } = useHttpClient();

  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pwIssue = useMemo(() => passwordIssue(password), [password]);
  const pwStrength = useMemo(() => strengthLabel(password), [password]);
  const passwordsMatch = password === confirm;
  const nextPath = useMemo(() => {
    const raw = searchParams.get("next");
    if (!raw || !raw.startsWith("/") || raw.startsWith("/login")) return "/";
    if (raw.startsWith("/signup")) return "/";
    return raw;
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (pwIssue) {
      setError(pwIssue);
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    // await new Promise((r) => setTimeout(r, 750));
    try {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_APP_BACKEND_URL}/auth/signup`,
        "POST",
        JSON.stringify({
          email: email.trim(),
          password: password,
          name: name.trim(),
          region: region.trim(),
        }),
        {
          "Content-Type": "application/json",
        }
      );
      // Log response and authenticate user
      console.log("Login response:", responseData);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("cf_auth_token", responseData.user.token);
          window.localStorage.setItem("cf_auth_email", email.trim());
          window.localStorage.setItem("cf_auth_id", responseData.user.id);
          window.localStorage.setItem("cf_profile_region", region.trim());
          if (remember)
            window.localStorage.setItem("cf_login_email", email.trim());
          else window.localStorage.removeItem("cf_login_email");

          setToast("Logged in (demo). Wire this to your API.");

          dispatch(
            login({
              email: email.trim(),
              name: name.trim() || null,
              region: region.trim() || null,
              userId: responseData.user.id,
            })
          );
          navigate(nextPath, { replace: true });
        } catch {
          // ignore
        }
      }
      // auth.login(responseData.user, responseData.user.token);
    } catch (err) {
      console.error("Login error:", err);
      // Error handled by useHttpClient
    }
    setSubmitting(false);
    setToast("Account created (demo).");
  };

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <CssBaseline />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: UI.glass,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${UI.border2}`,
          color: UI.text,
        }}
      >
        <Toolbar sx={{ gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              background: UI.brandGrad,
              boxShadow: "0 12px 30px rgba(124,92,255,0.14)",
              color: "white",
            }}
            aria-label="ChargeFinder"
          >
            <ElectricBoltIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 950, color: UI.text, lineHeight: 1.1 }}
              noWrap
            >
              ChargeFinder
            </Typography>
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Create your account
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip
            size="small"
            label="Light mode"
            sx={{
              borderRadius: 999,
              backgroundColor: "rgba(10,10,16,0.04)",
              border: `1px solid ${UI.border2}`,
              color: UI.text2,
              fontWeight: 750,
            }}
          />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          height: { xs: "auto", md: "calc(100dvh - 65px)" },
          position: "relative",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 520,
              height: 520,
              left: -160,
              top: -160,
              borderRadius: 999,
              background:
                "radial-gradient(circle, rgba(124,92,255,0.22), rgba(124,92,255,0) 65%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 520,
              height: 520,
              right: -180,
              bottom: -220,
              borderRadius: 999,
              background:
                "radial-gradient(circle, rgba(0,229,255,0.18), rgba(0,229,255,0) 65%)",
            }}
          />
        </Box>

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
                    onClose={() => setError(null)}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid rgba(244, 67, 54, 0.22)`,
                      backgroundColor: "rgba(244, 67, 54, 0.08)",
                    }}
                  >
                    {error}
                  </Alert>
                ) : null}

                <Box component="form" onSubmit={onSubmit} noValidate>
                  <Stack spacing={1.5}>
                    <TextField
                      placeholder="Your full name"
                      label="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      fullWidth
                      error={name.length > 0 && !isValidName(name)}
                      helperText={
                        name.length > 0 && !isValidName(name)
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
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      autoComplete="address-level1"
                      fullWidth
                      error={region.length > 0 && !isValidName(region)}
                      helperText={
                        region.length > 0 && !isValidName(region)
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      fullWidth
                      error={email.length > 0 && !isValidEmail(email)}
                      helperText={
                        email.length > 0 && !isValidEmail(email)
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      fullWidth
                      type={showPw ? "text" : "password"}
                      error={password.length > 0 && !!pwIssue}
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
                              onClick={() => setShowPw((v) => !v)}
                              edge="end"
                              aria-label={
                                showPw ? "Hide password" : "Show password"
                              }
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
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      fullWidth
                      type={showConfirm ? "text" : "password"}
                      error={confirm.length > 0 && !passwordsMatch}
                      helperText={
                        confirm.length > 0 && !passwordsMatch
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
                              onClick={() => setShowConfirm((v) => !v)}
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

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mt: -0.5 }}
                    >
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
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
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
                        disabled={submitting}
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
                        {submitting ? "Creating..." : "Create account"}
                      </Button>
                    </Stack>

                    <Divider sx={{ borderColor: UI.border2, my: 0.75 }} />

                    <Typography variant="body2" sx={{ color: UI.text2 }}>
                      Already have an account?{" "}
                      <Link
                        component="button"
                        type="button"
                        onClick={() =>
                          navigate(
                            `/login?next=${encodeURIComponent(nextPath)}`
                          )
                        }
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
                  By creating an account, you agree to the demo Terms and
                  Privacy.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
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
