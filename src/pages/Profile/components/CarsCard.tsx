import { useState, type MouseEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuCarId, setMenuCarId] = useState<string | null>(null);
  const menuOpen = Boolean(menuAnchor);
  const menuCar = cars.find((car) => car.id === menuCarId) ?? null;
  const isMenuCarActive = menuCar ? menuCar.id === activeCarId : false;

  const handleOpenMenu = (event: MouseEvent<HTMLElement>, carId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuCarId(carId);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuCarId(null);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    handleCloseMenu();
  };

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
                const hasBatteryPercent = Number.isFinite(car.batteryPercent);
                const hasBatteryCapacity = Number.isFinite(car.batteryCapacity);
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
                        {hasBatteryPercent ? (
                          <Chip
                            size="small"
                            label={`Battery ${car.batteryPercent}%`}
                            sx={{
                              borderRadius: 999,
                              backgroundColor: "rgba(0,200,83,0.12)",
                              border: "1px solid rgba(0,200,83,0.35)",
                              color: UI.text,
                              fontWeight: 700,
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
                        <IconButton
                          size="small"
                          onClick={(event) => handleOpenMenu(event, car.id)}
                          sx={{
                            borderRadius: 2.5,
                            border: `1px solid ${UI.border2}`,
                            color: UI.text,
                          }}
                          aria-label="Car actions"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
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

                      <Stack spacing={0.25}>
                        <Typography variant="caption" sx={{ color: UI.text2 }}>
                          Preferred minimum power: {car.minKW || 0} kW
                        </Typography>
                        {hasBatteryCapacity ? (
                          <Typography variant="caption" sx={{ color: UI.text2 }}>
                            Battery capacity: {car.batteryCapacity} kWh
                          </Typography>
                        ) : null}
                      </Stack>
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

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${UI.border}`,
            boxShadow: "0 16px 40px rgba(10,10,16,0.14)",
          },
        }}
      >
        <MenuItem
          disabled={!menuCar || isMenuCarActive}
          onClick={() =>
            menuCar ? handleMenuAction(() => onSetActive(menuCar.id)) : handleCloseMenu()
          }
        >
          <ListItemIcon>
            <CheckCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          Use this car
        </MenuItem>
        <MenuItem
          disabled={!menuCar}
          onClick={() =>
            menuCar ? handleMenuAction(() => onEdit(menuCar.id)) : handleCloseMenu()
          }
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          disabled={!menuCar}
          onClick={() =>
            menuCar ? handleMenuAction(() => onRemove(menuCar.id)) : handleCloseMenu()
          }
          sx={{ color: "rgba(244,67,54,0.95)" }}
        >
          <ListItemIcon sx={{ color: "rgba(244,67,54,0.95)" }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          Remove
        </MenuItem>
      </Menu>
    </Card>
  );
}
