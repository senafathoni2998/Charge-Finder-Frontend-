import { Box, Chip, Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";
import StationCard from "./StationCard";
import type { StationWithDistance } from "../types";

type StationsListProps = {
  stations: StationWithDistance[];
  selectedId: string | null;
  onFocusStation: (station: StationWithDistance) => void;
};

// Renders the filtered station list with a count badge.
export default function StationsList({
  stations,
  selectedId,
  onFocusStation,
}: StationsListProps) {
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 900, color: UI.text }}>Stations</Typography>
        <Chip
          size="small"
          label={`${stations.length}`}
          sx={{
            borderRadius: 999,
            backgroundColor: "rgba(10,10,16,0.04)",
            border: `1px solid ${UI.border2}`,
            color: UI.text2,
            fontWeight: 750,
          }}
        />
      </Stack>

      <Stack spacing={1.2}>
        {stations.map((station) => (
          <StationCard
            key={station.id}
            s={station}
            selectedId={selectedId}
            focusStation={onFocusStation}
          />
        ))}
        {!stations.length && (
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px dashed ${UI.border}`,
              backgroundColor: UI.surface,
            }}
          >
            <Typography sx={{ fontWeight: 900, color: UI.text }}>
              No stations match your filters.
            </Typography>
            <Typography variant="body2" sx={{ color: UI.text2, mt: 0.5 }}>
              Try increasing distance, clearing connector, or lowering the minimum kW.
            </Typography>
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
