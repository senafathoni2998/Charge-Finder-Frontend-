import { useMemo, useState, type FormEvent } from "react";
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
import {
  Form,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router";
import { UI } from "../../theme/theme";
import { useAppSelector } from "../../app/hooks";
import type { ConnectorType } from "../../models/model";

const CONNECTOR_OPTIONS: ConnectorType[] = ["CCS2", "Type2", "CHAdeMO"];

type AddCarActionData = {
  error?: string;
};

export async function addCarAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { error: "Backend URL is not configured." };
  }

  const email = String(formData.get("email") || "").trim();
  const userId = String(formData.get("userId") || "").trim();
  const nameRaw = String(formData.get("name") || "").trim();
  const name = nameRaw || "My EV";
  const connectorTypes = formData
    .getAll("connectorTypes")
    .map((value) => String(value))
    .filter((value) => value);
  const minKW = Number.isFinite(Number(formData.get("minKW")))
    ? Number(formData.get("minKW"))
    : 0;

  if (!connectorTypes.length) {
    return { error: "Select at least one connector type." };
  }
  if (!email) {
    return { error: "Email is required." };
  }
  if (!userId) {
    return { error: "User session is missing." };
  }

  try {
    const response = await fetch(`${baseUrl}/vehicles/add-vehicle`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        email,
        name,
        connector_type: connectorTypes,
        min_power: minKW,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const vehicle = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: vehicle.message || "Could not save car." };
    }

    if (typeof window !== "undefined") {
      try {
        if (vehicle?.id) {
          window.localStorage.setItem("cf_active_car_id", String(vehicle.id));
        }
      } catch {
        // ignore
      }
    }

    return redirect("/profile");
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save car.",
    };
  }
}

export default function AddCarPage() {
  const navigate = useNavigate();
  const actionData = useActionData() as AddCarActionData | undefined;
  const navigation = useNavigation();
  const email = useAppSelector((state) => state.auth.email);
  const userId = useAppSelector((state) => state.auth.userId);

  const [carName, setCarName] = useState("");
  const [carConnectors, setCarConnectors] = useState<Set<ConnectorType>>(
    new Set()
  );
  const [carMinKW, setCarMinKW] = useState(0);
  const [carError, setCarError] = useState<string | null>(null);

  const connectorList = useMemo(() => CONNECTOR_OPTIONS, []);

  const handleSubmit = (event: FormEvent) => {
    if (!carConnectors.size) {
      event.preventDefault();
      setCarError("Select at least one connector type.");
      return;
    }
    if (carError) setCarError(null);
  };

  const submitError = carError || actionData?.error || null;
  const isSubmitting = navigation.state === "submitting";

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
              <Box
                component={Form}
                method="post"
                onSubmit={handleSubmit}
                noValidate
              >
                <input type="hidden" name="userId" value={userId || ""} />
                <input type="hidden" name="email" value={email || ""} />
                {Array.from(carConnectors).map((c) => (
                  <input
                    key={c}
                    type="hidden"
                    name="connectorTypes"
                    value={c}
                  />
                ))}
                <input
                  type="hidden"
                  name="minKW"
                  value={Number.isFinite(carMinKW) ? carMinKW : 0}
                />
                <Stack spacing={2}>
                  <TextField
                    label="Car name"
                    name="name"
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
                    {submitError ? (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(244,67,54,0.9)",
                          mt: 0.75,
                          display: "block",
                        }}
                      >
                        {submitError}
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
                      type="submit"
                      disabled={isSubmitting}
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        background: UI.brandGradStrong,
                        color: "white",
                      }}
                    >
                      {isSubmitting ? "Saving…" : "Save car"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
