import { useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router";
import { UI } from "../../theme/theme";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout, removeCar, setActiveCar } from "../../features/auth/authSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const email = useAppSelector((state) => state.auth.email);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);

  const displayName = useMemo(() => {
    if (!email) return "Driver";
    const [name] = email.split("@");
    return name ? name.replace(/[^a-zA-Z0-9]+/g, " ").trim() : "Driver";
  }, [email]);

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    if (!parts.length) return "D";
    return parts[0].charAt(0).toUpperCase();
  }, [displayName]);

  const persistCars = (nextCars, nextActiveId) => {
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
  };

  const handleSetActive = (carId: string) => {
    dispatch(setActiveCar(carId));
    persistCars(cars, carId);
  };

  const handleRemoveCar = (carId: string) => {
    const nextCars = cars.filter((c) => c.id !== carId);
    const nextActiveId =
      activeCarId === carId ? (nextCars[0]?.id ?? null) : activeCarId;
    dispatch(removeCar(carId));
    persistCars(nextCars, nextActiveId);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("cf_auth_token");
        window.localStorage.removeItem("cf_auth_email");
        window.localStorage.removeItem("cf_user_car");
        window.localStorage.removeItem("cf_user_cars");
        window.localStorage.removeItem("cf_active_car_id");
      } catch {
        // ignore
      }
    }
    dispatch(logout());
    navigate("/login", { replace: true });
  };

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
                      Jakarta, ID
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
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      borderColor: UI.border,
                      color: UI.text,
                      backgroundColor: "rgba(10,10,16,0.01)",
                    }}
                    disabled
                  >
                    Edit profile (soon)
                  </Button>
                  <Box sx={{ flex: 1 }} />
                  <Button
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
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

                {cars.length ? (
                  <Stack spacing={1.5}>
                    {cars.map((car) => {
                      const isActive = car.id === activeCarId;
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
                              {car.connectorTypes.map((c) => (
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
                              {!car.connectorTypes.length ? (
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
    </Box>
  );
}
