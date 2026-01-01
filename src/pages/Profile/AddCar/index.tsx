import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";
import { UI } from "../../../theme/theme";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addCar } from "../../../features/auth/authSlice";
import type { ConnectorType } from "../../../models/model";

const CONNECTOR_OPTIONS: ConnectorType[] = ["CCS2", "Type2", "CHAdeMO"];

const createCarId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `car-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export default function AddCarPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cars = useAppSelector((state) => state.auth.cars);

  const [carName, setCarName] = useState("");
  const [carConnectors, setCarConnectors] = useState<Set<ConnectorType>>(
    new Set()
  );
  const [carMinKW, setCarMinKW] = useState(0);
  const [carError, setCarError] = useState<string | null>(null);

  const connectorList = useMemo(
    () => CONNECTOR_OPTIONS,
    []
  );

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

  const handleSave = () => {
    const trimmedName = carName.trim() || "My EV";
    const connectorTypes = Array.from(carConnectors);
    if (!connectorTypes.length) {
      setCarError("Select at least one connector type.");
      return;
    }
    const nextCar = {
      id: createCarId(),
      name: trimmedName,
      connectorTypes,
      minKW: Number.isFinite(carMinKW) ? carMinKW : 0,
    };
    setCarError(null);
    const nextCars = [...cars, nextCar];
    dispatch(addCar(nextCar));
    persistCars(nextCars, nextCar.id);
    navigate("/profile", { replace: true });
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
              Add a car
            </Typography>
            <Typography sx={{ color: UI.text2 }}>
              Save your connector types to personalize compatible stations.
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
              <Stack spacing={2}>
                <TextField
                  label="Car name"
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  placeholder="e.g. Hyundai Ioniq 5"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    },
                  }}
                />

                <Box>
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    Connector types
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, flexWrap: "wrap" }}
                  >
                    {connectorList.map((c) => {
                      const active = carConnectors.has(c);
                      return (
                        <Chip
                          key={c}
                          clickable
                          label={c}
                          variant={active ? "filled" : "outlined"}
                          onClick={() => {
                            setCarError(null);
                            setCarConnectors((prev) => {
                              const next = new Set(prev);
                              if (next.has(c)) next.delete(c);
                              else next.add(c);
                              return next;
                            });
                          }}
                          sx={{
                            borderRadius: 999,
                            backgroundColor: active
                              ? "rgba(124,92,255,0.12)"
                              : "transparent",
                            borderColor: active
                              ? "rgba(124,92,255,0.35)"
                              : UI.border2,
                            color: UI.text,
                            fontWeight: 700,
                          }}
                        />
                      );
                    })}
                  </Stack>
                  {carError ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(244,67,54,0.9)",
                        mt: 0.75,
                        display: "block",
                      }}
                    >
                      {carError}
                    </Typography>
                  ) : null}
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" sx={{ color: UI.text3 }}>
                      Preferred minimum power
                    </Typography>
                    <Typography variant="caption" sx={{ color: UI.text2 }}>
                      {carMinKW || 0} kW
                    </Typography>
                  </Stack>
                  <Slider
                    value={Number.isFinite(carMinKW) ? carMinKW : 0}
                    onChange={(_, v) =>
                      setCarMinKW(Array.isArray(v) ? v[0] : v)
                    }
                    step={10}
                    min={0}
                    max={200}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Divider sx={{ borderColor: UI.border2 }} />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/profile")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      borderColor: UI.border,
                      color: UI.text,
                      backgroundColor: "rgba(10,10,16,0.01)",
                    }}
                  >
                    Cancel
                  </Button>
                  <Box sx={{ flex: 1 }} />
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      background: UI.brandGradStrong,
                      color: "white",
                    }}
                  >
                    Save car
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
