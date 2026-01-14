import type { MouseEvent } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { ConnectorType } from "../../../models/model";
import type { StationFilterStatus } from "../types";
import { UI } from "../../../theme/theme";

type StationFiltersPanelProps = {
  open: boolean;
  statusFilter: StationFilterStatus;
  onStatusFilterChange: (value: StationFilterStatus) => void;
  connectorOptions: ConnectorType[];
  connectorSet: Set<ConnectorType>;
  onToggleConnector: (connector: ConnectorType) => void;
  minKW: number;
  onMinKWChange: (value: number) => void;
  filtersActiveCount: number;
  onResetFilters: () => void;
};

// Renders the collapsible station filters section.
export default function StationFiltersPanel({
  open,
  statusFilter,
  onStatusFilterChange,
  connectorOptions,
  connectorSet,
  onToggleConnector,
  minKW,
  onMinKWChange,
  filtersActiveCount,
  onResetFilters,
}: StationFiltersPanelProps) {
  // Handles the availability toggle change.
  const handleStatusChange = (
    _event: MouseEvent<HTMLElement>,
    value: StationFilterStatus | null
  ) => {
    onStatusFilterChange((value ?? "") as StationFilterStatus);
  };

  // Normalizes slider values into a single numeric value.
  const handleMinKWChange = (_event: Event, value: number | number[]) => {
    onMinKWChange(Array.isArray(value) ? value[0] : value);
  };

  return (
    <Collapse in={open}>
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px solid ${UI.border2}`,
          backgroundColor: "rgba(10,10,16,0.02)",
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Filters
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={onResetFilters}
              disabled={!filtersActiveCount}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                color: UI.text2,
              }}
            >
              Reset filters
            </Button>
          </Stack>

          <Box
            sx={{
              display: "inline-flex",
              justifyContent: "space-between",
              flexDirection: "column",
            }}
          >
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Availability
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={statusFilter}
              onChange={handleStatusChange}
              size="small"
              sx={{
                mt: 1,
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
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Connectors
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              {connectorOptions.map((connector) => {
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
                    onClick={() => onToggleConnector(connector)}
                    sx={{
                      borderRadius: 999,
                      backgroundColor: chipBg,
                      borderColor: chipBorder,
                      color: UI.text,
                      fontWeight: 700,
                    }}
                  />
                );
              })}
            </Stack>
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
                {minKW || 0} kW
              </Typography>
            </Stack>
            <Slider
              value={Number.isFinite(minKW) ? minKW : 0}
              onChange={handleMinKWChange}
              step={10}
              min={0}
              max={200}
              sx={{ mt: 1 }}
            />
          </Box>
        </Stack>
      </Box>
    </Collapse>
  );
}
