import type { ChangeEvent, MouseEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import type { ConnectorType, Station } from "../../../models/model";
import { UI } from "../../../theme/theme";
import { CONNECTOR_OPTIONS } from "../../MainPage/constants";
import type { StationFilterStatus } from "../types";
import StationFiltersPanel from "./StationFiltersPanel";
import StationList from "./StationList";

type StationManagementCardProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  filtersActiveCount: number;
  statusFilter: StationFilterStatus;
  onStatusFilterChange: (value: StationFilterStatus) => void;
  connectorSet: Set<ConnectorType>;
  onToggleConnector: (connector: ConnectorType) => void;
  minKW: number;
  onMinKWChange: (value: number) => void;
  onResetFilters: () => void;
  stationActionError: string | null;
  stationsLoading: boolean;
  stationsError: string | null;
  filteredStations: Station[];
  allStationsCount: number;
  onOpenMenu: (event: MouseEvent<HTMLElement>, station: Station) => void;
  onNewStation: () => void;
};

// Renders the station management card with filters and station list.
export default function StationManagementCard({
  query,
  onQueryChange,
  filtersOpen,
  onToggleFilters,
  filtersActiveCount,
  statusFilter,
  onStatusFilterChange,
  connectorSet,
  onToggleConnector,
  minKW,
  onMinKWChange,
  onResetFilters,
  stationActionError,
  stationsLoading,
  stationsError,
  filteredStations,
  allStationsCount,
  onOpenMenu,
  onNewStation,
}: StationManagementCardProps) {
  // Handles the search input change for stations.
  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: UI.shadow,
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                Station management
              </Typography>
              <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                Review availability, edit details, and resolve issues.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={onToggleFilters}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: UI.text,
                  backgroundColor: filtersOpen
                    ? "rgba(124,92,255,0.08)"
                    : "transparent",
                }}
              >
                {filtersActiveCount
                  ? `Filters (${filtersActiveCount})`
                  : "Filters"}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onNewStation}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  background: UI.brandGrad,
                }}
              >
                New station
              </Button>
            </Stack>
          </Stack>

          <TextField
            placeholder="Search stations, IDs, or cities"
            size="small"
            fullWidth
            value={query}
            onChange={handleQueryChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <StationFiltersPanel
            open={filtersOpen}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            connectorOptions={CONNECTOR_OPTIONS}
            connectorSet={connectorSet}
            onToggleConnector={onToggleConnector}
            minKW={minKW}
            onMinKWChange={onMinKWChange}
            filtersActiveCount={filtersActiveCount}
            onResetFilters={onResetFilters}
          />

          {stationActionError ? (
            <Typography sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
              {stationActionError}
            </Typography>
          ) : null}

          <StationList
            stations={filteredStations}
            allStationsCount={allStationsCount}
            isLoading={stationsLoading}
            error={stationsError}
            onOpenMenu={onOpenMenu}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
