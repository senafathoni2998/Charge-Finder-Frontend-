import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from "react-router";
import { UI } from "../../theme/theme";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import {
  logout,
  removeCar,
  setActiveCar,
  setCars,
  updateProfile,
} from "../../features/auth/authSlice";
import { passwordIssue, strengthLabel, toneChipSx } from "../../utils/validate";

type ProfileLoaderData = {
  user: {
    name?: string | null;
    region?: string | null;
  } | null;
  vehicles: unknown[] | null;
  activeCarId: string | null;
};

type ProfileActionData = {
  intent: "profile" | "password";
  ok?: boolean;
  error?: string;
  name?: string | null;
  region?: string | null;
};

const fetchProfileJson = async (url: string, signal?: AbortSignal) => {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    signal,
  });
  if (!response.ok) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export async function profileLoader({ request }: { request: Request }) {
  if (typeof window === "undefined") {
    return { user: null, vehicles: null, activeCarId: null };
  }

  let activeCarId: string | null = null;
  let token: string | null = null;
  try {
    activeCarId = window.localStorage.getItem("cf_active_car_id");
    token = window.localStorage.getItem("cf_auth_token");
  } catch {
    return { user: null, vehicles: null, activeCarId: null };
  }
  if (!token) {
    return { user: null, vehicles: null, activeCarId };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { user: null, vehicles: null, activeCarId };
  }

  const [profileData, vehiclesData] = await Promise.all([
    fetchProfileJson(`${baseUrl}/profile`, request.signal).catch(() => null),
    fetchProfileJson(`${baseUrl}/vehicles`, request.signal).catch(() => null),
  ]);

  const user =
    profileData && typeof profileData === "object"
      ? (profileData as { user?: ProfileLoaderData["user"] }).user ?? null
      : null;
  const vehiclesPayload =
    vehiclesData && typeof vehiclesData === "object"
      ? (vehiclesData as { vehicles?: unknown[] }).vehicles
      : null;
  const vehicles = Array.isArray(vehiclesPayload) ? vehiclesPayload : null;

  return { user, vehicles, activeCarId };
}

export async function profileAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "logout") {
    try {
      const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
      if (baseUrl) {
        await fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      }
    } catch {
      // ignore
    }

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("cf_auth_token");
        window.localStorage.removeItem("cf_auth_email");
        window.localStorage.removeItem("cf_profile_name");
        window.localStorage.removeItem("cf_profile_region");
        window.localStorage.removeItem("cf_user_car");
        window.localStorage.removeItem("cf_user_cars");
        window.localStorage.removeItem("cf_active_car_id");
        window.sessionStorage.setItem("cf_logout_redirect", "1");
      } catch {
        // ignore
      }
    }

    store.dispatch(logout());
    return redirect("/");
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return {
      intent: intent === "password" ? "password" : "profile",
      error: "Backend URL is not configured.",
    };
  }

  let fallbackUserId = "";
  if (typeof window !== "undefined") {
    try {
      fallbackUserId = window.localStorage.getItem("cf_auth_id") || "";
    } catch {
      fallbackUserId = "";
    }
  }
  const rawUserId = String(formData.get("userId") || "").trim();
  const userId = rawUserId || fallbackUserId;

  if (intent === "profile") {
    const name = String(formData.get("name") || "").trim();
    const region = String(formData.get("region") || "").trim();
    if (!name) {
      return { intent: "profile", error: "Name is required." };
    }
    if (!userId) {
      return { intent: "profile", error: "User session is missing." };
    }

    try {
      const response = await fetch(`${baseUrl}/profile/update-profile`, {
        method: "PATCH",
        body: JSON.stringify({
          userId,
          name,
          region,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          intent: "profile",
          error: responseData.message || "Could not update profile.",
        };
      }
      return {
        intent: "profile",
        ok: true,
        name,
        region: region || null,
      };
    } catch (err) {
      return {
        intent: "profile",
        error: err instanceof Error ? err.message : "Could not update profile.",
      };
    }
  }

  if (intent === "password") {
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    if (!currentPassword.trim()) {
      return { intent: "password", error: "Enter your current password." };
    }
    const issue = passwordIssue(newPassword);
    if (issue) {
      return { intent: "password", error: issue };
    }
    if (!newPassword.trim()) {
      return { intent: "password", error: "Enter a new password." };
    }
    if (newPassword !== confirmPassword) {
      return { intent: "password", error: "Passwords do not match." };
    }
    if (currentPassword === newPassword) {
      return {
        intent: "password",
        error: "New password must be different.",
      };
    }
    if (!userId) {
      return { intent: "password", error: "User session is missing." };
    }

    try {
      const response = await fetch(`${baseUrl}/profile/update-password`, {
        method: "PATCH",
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          intent: "password",
          error: responseData.message || "Failed to update password.",
        };
      }
      return { intent: "password", ok: true };
    } catch (err) {
      return {
        intent: "password",
        error:
          err instanceof Error ? err.message : "Failed to update password.",
      };
    }
  }

  return { intent: "profile", error: "Unknown action." };
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as ProfileLoaderData | null;
  const actionData = useActionData() as ProfileActionData | undefined;
  const email = useAppSelector((state) => state.auth.email);
  const userId = useAppSelector((state) => state.auth.userId);
  const profileName = useAppSelector((state) => state.auth.name);
  const profileRegion = useAppSelector((state) => state.auth.region);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);
  const [profileOpen, setProfileOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [regionDraft, setRegionDraft] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const newPwIssue = useMemo(() => passwordIssue(newPassword), [newPassword]);
  const newPwStrength = useMemo(
    () => strengthLabel(newPassword),
    [newPassword]
  );

  const displayName = useMemo(() => {
    console.log("profileName:", profileName);
    if (profileName && profileName.trim()) return profileName.trim();
    if (!email) return "Driver";
    const [name] = email.split("@");
    return name ? name.replace(/[^a-zA-Z0-9]+/g, " ").trim() : "Driver";
  }, [email, profileName]);

  const regionLabel = profileRegion?.trim() || "Jakarta, ID";

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    if (!parts.length) return "D";
    return parts[0].charAt(0).toUpperCase();
  }, [displayName]);

  const persistCars = useCallback((nextCars, nextActiveId) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("cf_user_cars", JSON.stringify(nextCars));
      if (nextActiveId)
        window.localStorage.setItem("cf_active_car_id", nextActiveId);
      else window.localStorage.removeItem("cf_active_car_id");
      window.localStorage.removeItem("cf_user_car");
    } catch {
      // ignore
    }
  }, []);

  const persistProfile = useCallback(
    (nextName: string | null, nextRegion: string | null) => {
      if (typeof window === "undefined") return;
      try {
        if (nextName) window.localStorage.setItem("cf_profile_name", nextName);
        else window.localStorage.removeItem("cf_profile_name");
        if (nextRegion)
          window.localStorage.setItem("cf_profile_region", nextRegion);
        else window.localStorage.removeItem("cf_profile_region");
      } catch {
        // ignore
      }
    },
    []
  );

  const handleOpenProfileEditor = () => {
    setNameDraft(profileName?.trim() || displayName);
    setRegionDraft(profileRegion?.trim() || "Jakarta, ID");
    setProfileError(null);
    setProfileOpen(true);
  };

  const handleProfileSubmit = (event: FormEvent) => {
    const nextName = nameDraft.trim();
    if (!nextName) {
      event.preventDefault();
      setProfileError("Name is required.");
      return;
    }
    if (profileError) setProfileError(null);
  };

  useEffect(() => {
    if (!loaderData) return;

    const { user, vehicles, activeCarId: storedActiveId } = loaderData;
    if (user && typeof user === "object") {
      const { name, region } = user;
      const nextName =
        typeof name === "string" && name.trim() ? name.trim() : null;
      const nextRegion =
        typeof region === "string" && region.trim() ? region.trim() : null;
      if (nextName || nextRegion) {
        dispatch(
          updateProfile({
            name: nextName,
            region: nextRegion,
          })
        );
        persistProfile(nextName, nextRegion);
      }
    }

    if (!Array.isArray(vehicles)) return;
    const remappedVehicles = vehicles
      .map((v: any) => ({
        id:
          typeof v.id === "string"
            ? v.id.trim()
            : typeof v.id === "number"
            ? String(v.id)
            : "",
        name:
          typeof v.name === "string" && v.name.trim() ? v.name.trim() : "My EV",
        connectorTypes: Array.isArray(v.connector_type) ? v.connector_type : [],
        minKW: Number.isFinite(Number(v.min_power)) ? Number(v.min_power) : 0,
      }))
      .filter((car) => car.id);
    const nextActiveId =
      storedActiveId &&
      remappedVehicles.some((car) => car.id === storedActiveId)
        ? storedActiveId
        : remappedVehicles[0]?.id ?? null;
    dispatch(
      setCars({
        cars: remappedVehicles,
        activeCarId: nextActiveId,
      })
    );
    persistCars(remappedVehicles, nextActiveId);
  }, [dispatch, loaderData, persistCars, persistProfile]);

  useEffect(() => {
    if (!actionData) return;

    if (actionData.intent === "profile") {
      if (actionData.error) {
        setProfileError(actionData.error);
        return;
      }
      if (actionData.ok) {
        dispatch(
          updateProfile({
            name: actionData.name ?? null,
            region: actionData.region ?? null,
          })
        );
        persistProfile(actionData.name ?? null, actionData.region ?? null);
        setProfileOpen(false);
        setProfileError(null);
      }
    }

    if (actionData.intent === "password") {
      if (actionData.error) {
        setPasswordError(actionData.error);
        return;
      }
      if (actionData.ok) {
        setPasswordToast("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordOpen(false);
        setPasswordError(null);
      }
    }
  }, [actionData, dispatch, persistProfile]);

  const handleOpenPasswordEditor = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setPasswordOpen(true);
  };

  const handlePasswordSubmit = (event: FormEvent) => {
    setPasswordError(null);
    if (!currentPassword.trim()) {
      event.preventDefault();
      setPasswordError("Enter your current password.");
      return;
    }

    if (newPwIssue) {
      event.preventDefault();
      setPasswordError(newPwIssue);
      return;
    }
    if (!newPassword.trim()) {
      event.preventDefault();
      setPasswordError("Enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      event.preventDefault();
      setPasswordError("Passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      event.preventDefault();
      setPasswordError("New password must be different.");
      return;
    }
  };

  const handleSetActive = (carId: string) => {
    dispatch(setActiveCar(carId));
    persistCars(cars, carId);
  };

  const handleRemoveCar = (carId: string) => {
    const nextCars = cars.filter((c) => c.id !== carId);
    const nextActiveId =
      activeCarId === carId ? nextCars[0]?.id ?? null : activeCarId;
    dispatch(removeCar(carId));
    persistCars(nextCars, nextActiveId);
  };

  console.log(
    "Rendering ProfilePage with cars:",
    cars,
    "activeCarId:",
    activeCarId
  );

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 28 }}>
              Profile
            </Typography>
            <Typography sx={{ color: UI.text2 }}>
              Manage your account and charging preferences.
            </Typography>
          </Box>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: UI.border2,
              background: UI.surface,
              boxShadow: "0 18px 50px rgba(10,10,16,0.10)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ height: 8, background: UI.brandGradStrong }} />
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack spacing={2.25}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: UI.brandGrad,
                      color: "white",
                      fontWeight: 900,
                      fontSize: 24,
                      boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{ fontWeight: 900, color: UI.text, fontSize: 20 }}
                    >
                      {displayName}
                    </Typography>
                    <Typography sx={{ color: UI.text2 }}>
                      {email || "demo@chargefinder.app"}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(0,229,255,0.12)",
                      border: "1px solid rgba(0,229,255,0.3)",
                      color: UI.text,
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Divider sx={{ borderColor: UI.border2 }} />

                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1}>
                    <Typography sx={{ color: UI.text3, minWidth: 120 }}>
                      Name
                    </Typography>
                    <Typography sx={{ color: UI.text, fontWeight: 700 }}>
                      {displayName}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography sx={{ color: UI.text3, minWidth: 120 }}>
                      Email
                    </Typography>
                    <Typography sx={{ color: UI.text, fontWeight: 700 }}>
                      {email || "demo@chargefinder.app"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography sx={{ color: UI.text3, minWidth: 120 }}>
                      Plan
                    </Typography>
                    <Typography sx={{ color: UI.text, fontWeight: 700 }}>
                      Driver • Free
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography sx={{ color: UI.text3, minWidth: 120 }}>
                      Region
                    </Typography>
                    <Typography sx={{ color: UI.text, fontWeight: 700 }}>
                      {regionLabel}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ borderColor: UI.border2 }} />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={handleOpenProfileEditor}
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      borderColor: UI.border,
                      color: UI.text,
                      backgroundColor: "rgba(10,10,16,0.01)",
                    }}
                  >
                    Edit profile
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={handleOpenPasswordEditor}
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      borderColor: UI.border,
                      color: UI.text,
                      backgroundColor: "rgba(10,10,16,0.01)",
                    }}
                  >
                    Change password
                  </Button>
                  <Box sx={{ flex: 1 }} />
                  <Form method="post">
                    <input type="hidden" name="intent" value="logout" />
                    <Button
                      variant="contained"
                      startIcon={<LogoutIcon />}
                      type="submit"
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        backgroundColor: "rgba(244,67,54,0.9)",
                        "&:hover": {
                          backgroundColor: "rgba(244,67,54,1)",
                        },
                      }}
                    >
                      Sign out
                    </Button>
                  </Form>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: UI.border2,
              background: UI.surface,
              boxShadow: "0 18px 50px rgba(10,10,16,0.10)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ height: 8, background: UI.brandGradStrong }} />
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack spacing={2}>
                <Box>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    spacing={1}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: UI.text }}>
                        Your cars
                      </Typography>
                      <Typography sx={{ color: UI.text2 }}>
                        Choose an active car to personalize filters.
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }} />
                    <Button
                      variant="contained"
                      onClick={() => navigate("/profile/cars/new")}
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        background: UI.brandGradStrong,
                        color: "white",
                      }}
                    >
                      Add new car
                    </Button>
                  </Stack>
                </Box>

                {cars?.length ? (
                  <Stack spacing={1.5}>
                    {cars?.map((car) => {
                      const isActive = car.id === activeCarId;
                      console.log("Rendering car:", car, "isActive:", isActive);
                      return (
                        <Box
                          key={car.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 3,
                            border: `1px solid ${UI.border2}`,
                            backgroundColor: isActive
                              ? "rgba(124,92,255,0.08)"
                              : "rgba(10,10,16,0.01)",
                          }}
                        >
                          <Stack spacing={1.25}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              alignItems={{ sm: "center" }}
                              spacing={1}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  color: UI.text,
                                  fontSize: 16,
                                }}
                              >
                                {car.name}
                              </Typography>
                              {isActive ? (
                                <Chip
                                  size="small"
                                  label="Active"
                                  sx={{
                                    borderRadius: 999,
                                    backgroundColor: "rgba(0,229,255,0.12)",
                                    border: "1px solid rgba(0,229,255,0.3)",
                                    color: UI.text,
                                    fontWeight: 800,
                                  }}
                                />
                              ) : null}
                              <Box sx={{ flex: 1 }} />
                              {!isActive ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleSetActive(car.id)}
                                  sx={{
                                    textTransform: "none",
                                    borderRadius: 3,
                                    borderColor: UI.border,
                                    color: UI.text,
                                    backgroundColor: "rgba(10,10,16,0.01)",
                                  }}
                                >
                                  Use this car
                                </Button>
                              ) : null}
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => handleRemoveCar(car.id)}
                                sx={{
                                  textTransform: "none",
                                  color: "rgba(244,67,54,0.95)",
                                }}
                              >
                                Remove
                              </Button>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ flexWrap: "wrap" }}
                            >
                              {car.connectorTypes?.map((c) => (
                                <Chip
                                  key={c}
                                  size="small"
                                  label={c}
                                  sx={{
                                    borderRadius: 999,
                                    backgroundColor: "rgba(124,92,255,0.12)",
                                    borderColor: "rgba(124,92,255,0.35)",
                                    color: UI.text,
                                    fontWeight: 700,
                                  }}
                                />
                              ))}
                              {!car.connectorTypes?.length ? (
                                <Typography
                                  variant="caption"
                                  sx={{ color: UI.text3 }}
                                >
                                  No connectors selected
                                </Typography>
                              ) : null}
                            </Stack>

                            <Typography
                              variant="caption"
                              sx={{ color: UI.text2 }}
                            >
                              Preferred minimum power: {car.minKW || 0} kW
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `1px dashed ${UI.border}`,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, color: UI.text }}>
                      No cars added yet.
                    </Typography>
                    <Typography sx={{ color: UI.text2, mt: 0.5 }}>
                      Add your first EV to personalize compatible stations.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: UI.surface,
            border: `1px solid ${UI.border}`,
            color: UI.text,
            boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Edit profile</DialogTitle>
        <DialogContent dividers sx={{ borderColor: UI.border2 }}>
          <Form id="profile-form" method="post" onSubmit={handleProfileSubmit}>
            <input type="hidden" name="intent" value="profile" />
            <input type="hidden" name="userId" value={userId?.trim() || ""} />
            <Stack spacing={2}>
              <TextField
                label="Full name"
                name="name"
                value={nameDraft}
                onChange={(event) => {
                  setNameDraft(event.target.value);
                  if (profileError) setProfileError(null);
                }}
                fullWidth
                required
                error={!!profileError}
                helperText={profileError || "Shown on your profile."}
              />
              <TextField label="Email" value={email || ""} fullWidth disabled />
              <TextField
                label="Region"
                name="region"
                value={regionDraft}
                onChange={(event) => setRegionDraft(event.target.value)}
                fullWidth
                placeholder="Example: Jakarta, ID"
                helperText="Used for local recommendations."
              />
            </Stack>
          </Form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setProfileOpen(false)}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: UI.border,
              color: UI.text,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="profile-form"
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: UI.brandGradStrong,
              color: "white",
            }}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: UI.surface,
            border: `1px solid ${UI.border}`,
            color: UI.text,
            boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Change password</DialogTitle>
        <DialogContent dividers sx={{ borderColor: UI.border2 }}>
          <Form
            id="password-form"
            method="post"
            onSubmit={handlePasswordSubmit}
          >
            <input type="hidden" name="intent" value="password" />
            <input type="hidden" name="userId" value={userId?.trim() || ""} />
            <Stack spacing={2}>
              {passwordError ? (
                <Alert severity="error">{passwordError}</Alert>
              ) : null}
              <TextField
                label="Current password"
                name="currentPassword"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                autoComplete="current-password"
                fullWidth
                type={showCurrentPw ? "text" : "password"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: UI.text3 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPw((v) => !v)}
                        edge="end"
                        aria-label={
                          showCurrentPw ? "Hide password" : "Show password"
                        }
                      >
                        {showCurrentPw ? (
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
                label="New password"
                name="newPassword"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                autoComplete="new-password"
                fullWidth
                type={showNewPw ? "text" : "password"}
                error={newPassword.length > 0 && !!newPwIssue}
                helperText={
                  newPassword.length > 0 && newPwIssue ? newPwIssue : " "
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
                        onClick={() => setShowNewPw((v) => !v)}
                        edge="end"
                        aria-label={
                          showNewPw ? "Hide password" : "Show password"
                        }
                      >
                        {showNewPw ? (
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
              <Stack direction="row" spacing={1} alignItems="center">
                {newPassword.length > 0 ? (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Strength: ${newPwStrength.label}`}
                    sx={{
                      borderRadius: 999,
                      color: UI.text,
                      fontWeight: 900,
                      borderWidth: 1,
                      ...toneChipSx(newPwStrength.tone),
                    }}
                  />
                ) : null}
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  Use 8+ characters, letters, and numbers.
                </Typography>
              </Stack>
              <TextField
                label="Confirm new password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                autoComplete="new-password"
                fullWidth
                type={showConfirmPw ? "text" : "password"}
                error={
                  confirmPassword.length > 0 && confirmPassword !== newPassword
                }
                helperText={
                  confirmPassword.length > 0 && confirmPassword !== newPassword
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
                        onClick={() => setShowConfirmPw((v) => !v)}
                        edge="end"
                        aria-label={
                          showConfirmPw ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirmPw ? (
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
            </Stack>
          </Form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setPasswordOpen(false)}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: UI.border,
              color: UI.text,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="password-form"
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: UI.brandGradStrong,
              color: "white",
            }}
          >
            Update password
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!passwordToast}
        autoHideDuration={4000}
        onClose={() => setPasswordToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setPasswordToast(null)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {passwordToast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
