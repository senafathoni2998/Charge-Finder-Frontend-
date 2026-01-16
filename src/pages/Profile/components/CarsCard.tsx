import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";
import type { UserCar } from "../../../features/auth/authSlice";

type CarsCardProps = {
  cars: UserCar[];
  activeCarId: string | null;
  onAddCar: () => void;
  onSetActive: (carId: string) => void;
  onRemove: (carId: string) => void;
  onEdit: (carId: string) => void;
};

// Renders the car list card with active car selection controls.
export default function CarsCard({
  cars,
  activeCarId,
  onAddCar,
  onSetActive,
  onRemove,
  onEdit,
}: CarsCardProps) {
  const hasCars = cars.length > 0;

  return (
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
                onClick={onAddCar}
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

          {hasCars ? (
            <Stack spacing={1.5}>
              {cars.map((car) => {
                const isActive = car.id === activeCarId;
                const isCharging =
                  typeof car.chargingStatus === "string" &&
                  car.chargingStatus.trim().toUpperCase() === "CHARGING";
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
                        {isCharging ? (
                          <Chip
                            size="small"
                            label="Charging"
                            sx={{
                              borderRadius: 999,
                              backgroundColor: "rgba(0,200,83,0.12)",
                              border: "1px solid rgba(0,200,83,0.35)",
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
                            onClick={() => onSetActive(car.id)}
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
                          onClick={() => onEdit(car.id)}
                          sx={{
                            textTransform: "none",
                            color: UI.text,
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => onRemove(car.id)}
                          sx={{
                            textTransform: "none",
                            color: "rgba(244,67,54,0.95)",
                          }}
                        >
                          Remove
                        </Button>
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
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
                          <Typography variant="caption" sx={{ color: UI.text3 }}>
                            No connectors selected
                          </Typography>
                        ) : null}
                      </Stack>

                      <Typography variant="caption" sx={{ color: UI.text2 }}>
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
  );
}
