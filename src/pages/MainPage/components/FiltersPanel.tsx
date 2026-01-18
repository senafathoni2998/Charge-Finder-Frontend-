import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { UI } from "../../../theme/theme";
import type { ConnectorType } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";
import { CONNECTOR_OPTIONS } from "../constants";
import type { FilterStatus, StationWithDistance } from "../types";
import StationsList from "./StationsList";

type FiltersPanelProps = {
  query: string;
  status: FilterStatus;
  connectorSet: Set<ConnectorType>;
  minKW: number;
  effectiveMinKW: number;
  radiusKm: number;
  useCarFilter: boolean;
  isAuthenticated: boolean;
  activeCarId: string | null;
  activeCar: UserCar | null;
  cars: UserCar[];
  stations: StationWithDistance[];
  selectedId: string | null;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: FilterStatus) => void;
  onToggleConnector: (connector: ConnectorType) => void;
  onMinKWChange: (value: number) => void;
  onRadiusKmChange: (value: number) => void;
  onSelectCar: (carId: string) => void;
  onToggleUseCarFilter: (value: boolean) => void;
  onLogin: () => void;
  onAddCar: () => void;
  onFocusStation: (station: StationWithDistance) => void;
};

// Sidebar panel with search, filter controls, and station list.
export default function FiltersPanel({
  query,
  status,
  connectorSet,
  minKW,
  effectiveMinKW,
  radiusKm,
  useCarFilter,
  isAuthenticated,
  activeCarId,
  activeCar,
  cars,
  stations,
  selectedId,
  onQueryChange,
  onStatusChange,
  onToggleConnector,
  onMinKWChange,
  onRadiusKmChange,
  onSelectCar,
  onToggleUseCarFilter,
  onLogin,
  onAddCar,
  onFocusStation,
}: FiltersPanelProps) {
  const accordionSx = {
    border: `1px solid ${UI.border2}`,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    boxShadow: "none",
    "&:before": { display: "none" },
  };

  const accordionSummarySx = {
    px: 1.5,
    minHeight: 48,
    "&.Mui-expanded": { minHeight: 48 },
    "& .MuiAccordionSummary-content": { margin: "8px 0" },
  };

  const accordionDetailsSx = { px: 1.5, pb: 1.5, pt: 0 };

  return (
    <Box sx={{ p: 2.25 }}>
      <Stack spacing={2}>
        <Stack spacing={0.75}>
          <Typography variant="caption" sx={{ color: UI.text3 }}>
            Search
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search station or area\u2026"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(10,10,16,0.04)",
                borderRadius: 3,
              },
            }}
          />
        </Stack>
        <Accordion defaultExpanded sx={accordionSx}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={accordionSummarySx}
          >
            <Typography sx={{ fontWeight: 900, color: UI.text }}>
              Filters
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={accordionDetailsSx}>
            <Stack spacing={2}>
              {!isAuthenticated ? (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: `1px dashed ${UI.border}`,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  }}
                >
                  <Stack spacing={0.75}>
                    <Typography sx={{ fontWeight: 900, color: UI.text }}>
                      Guest mode
                    </Typography>
                    <Typography variant="body2" sx={{ color: UI.text2 }}>
                      Log in to save cars and personalize filters.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={onLogin}
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        borderColor: UI.border,
                        color: UI.text,
                        alignSelf: "flex-start",
                      }}
                    >
                      Log in
                    </Button>
                  </Stack>
                </Box>
              ) : null}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  Availability
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={status}
                  onChange={(_, value) =>
                    onStatusChange((value ?? "") as FilterStatus)
                  }
                  size="small"
                  sx={{
                    mt: 0.5,
                    flexWrap: "wrap",
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      borderColor: UI.border2,
                    },
                  }}
                >
                  <ToggleButton value="">All</ToggleButton>
                  <ToggleButton value="AVAILABLE">Available</ToggleButton>
                  <ToggleButton value="BUSY">Busy</ToggleButton>
                  <ToggleButton value="OFFLINE">Offline</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    Distance
                  </Typography>
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    {Number.isFinite(radiusKm) ? radiusKm : 0} km
                  </Typography>
                </Stack>
                <Slider
                  value={Number.isFinite(radiusKm) ? radiusKm : 0}
                  onChange={(_, value) =>
                    onRadiusKmChange(Array.isArray(value) ? value[0] : value)
                  }
                  step={1}
                  min={1}
                  max={50}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                {isAuthenticated ? (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" sx={{ color: UI.text3 }}>
                      My car
                    </Typography>
                  </Stack>
                ) : null}

                {activeCar ? (
                  <Stack spacing={1} sx={{ mt: 0.75, pt: 0.75 }}>
                    <TextField
                      select
                      size="small"
                      label="Selected car"
                      value={activeCarId ?? ""}
                      onChange={(event) =>
                        onSelectCar(String(event.target.value))
                      }
                      fullWidth
                      sx={{
                        mt: 0.5,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          backgroundColor: "rgba(10,10,16,0.02)",
                        },
                      }}
                    >
                      {cars.map((car) => (
                        <MenuItem key={car.id} value={car.id}>
                          {car.name}
                          {Number.isFinite(car.batteryCapacity)
                            ? ` | ${car.batteryCapacity} kWh`
                            : ""}
                        </MenuItem>
                      ))}
                    </TextField>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useCarFilter}
                          onChange={(event) =>
                            onToggleUseCarFilter(event.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Typography sx={{ color: UI.text2, fontWeight: 700 }}>
                          Use my car to filter stations
                        </Typography>
                      }
                      sx={{ ml: -0.5 }}
                    />
                  </Stack>
                ) : isAuthenticated ? (
                  <Stack spacing={1} sx={{ mt: 0.75 }}>
                    <Typography variant="body2" sx={{ color: UI.text2 }}>
                      Add a car to personalize results.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={onAddCar}
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        borderColor: UI.border,
                        color: UI.text,
                        alignSelf: "flex-start",
                      }}
                    >
                      Add car
                    </Button>
                  </Stack>
                ) : null}
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  Connectors
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: "wrap" }}
                >
                  {CONNECTOR_OPTIONS.map((connector) => {
                    const active = connectorSet.has(connector);
                    const chipBg = active
                      ? "rgba(124,92,255,0.12)"
                      : "transparent";
                    const chipBorder = active
                      ? "rgba(124,92,255,0.35)"
                      : UI.border2;
                    return (
                      <Chip
                        key={connector}
                        clickable
                        label={connector}
                        variant={active ? "filled" : "outlined"}
                        disabled={useCarFilter}
                        onClick={() => onToggleConnector(connector)}
                        sx={{
                          borderRadius: 999,
                          backgroundColor: chipBg,
                          borderColor: chipBorder,
                          color: UI.text,
                          fontWeight: 700,
                          ...(useCarFilter && {
                            "&.Mui-disabled": {
                              opacity: 1,
                              color: UI.text,
                              backgroundColor: chipBg,
                              borderColor: chipBorder,
                            },
                          }),
                        }}
                      />
                    );
                  })}
                </Stack>
                {useCarFilter ? (
                  <Typography
                    variant="caption"
                    sx={{ color: UI.text3, mt: 0.75, display: "block" }}
                  >
                    Connector filters are driven by your car profile.
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
                    Minimum power
                  </Typography>
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    {effectiveMinKW || 0} kW
                  </Typography>
                </Stack>
                <Slider
                  disabled={useCarFilter}
                  value={Number.isFinite(minKW) ? minKW : 0}
                  onChange={(_, value) =>
                    onMinKWChange(Array.isArray(value) ? value[0] : value)
                  }
                  step={10}
                  min={0}
                  max={200}
                  sx={{
                    mt: 1,
                    color: useCarFilter ? "rgba(124,92,255,0.9)" : undefined,
                    ...(useCarFilter && {
                      "&.Mui-disabled": { opacity: 1 },
                    }),
                  }}
                />
                {useCarFilter ? (
                  <Typography
                    variant="caption"
                    sx={{ color: UI.text3, mt: 0.75, display: "block" }}
                  >
                    Connector filters are driven by your car profile.
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ opacity: 0.35, borderColor: UI.border2 }} />

        <StationsList
          stations={stations}
          selectedId={selectedId}
          onFocusStation={onFocusStation}
        />
      </Stack>
    </Box>
  );
}
