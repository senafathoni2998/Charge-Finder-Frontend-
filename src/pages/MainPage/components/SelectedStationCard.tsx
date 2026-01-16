import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import { UI } from "../../../theme/theme";
import { minutesAgo } from "../../../utils/time";
import ConnectorChip from "./ConnectorChip";
import StatusChip from "./StatusChip";
import type { StationWithDistance } from "../types";

type SelectedStationCardProps = {
  station: StationWithDistance;
  onViewDetails: () => void;
  onOpenMaps: () => void;
};

// Renders the selected station summary over the map.
export default function SelectedStationCard({
  station,
  onViewDetails,
  onOpenMaps,
}: SelectedStationCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        zIndex: 9999,
        position: "absolute",
        left: 14,
        bottom: 14,
        width: "min(420px, calc(100% - 28px))",
        borderRadius: 4,
        border: `1px solid ${UI.border}`,
        backgroundColor: UI.surface2,
        backdropFilter: "blur(10px)",
        boxShadow: UI.shadow,
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 950,
                  lineHeight: 1.1,
                  color: UI.text,
                }}
              >
                {station.name}
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2 }}>
                {station.address}
              </Typography>
            </Box>
            <StatusChip
              status={station.status}
              isChargingHere={station.isChargingHere}
            />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {station.connectors.map((connector, idx) => (
              <ConnectorChip
                key={idx}
                type={connector.type}
                powerKW={connector.powerKW}
              />
            ))}
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              {station.distanceKm.toFixed(1)} km away
            </Typography>
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Updated {minutesAgo(station.lastUpdatedISO)}m ago
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              fullWidth
              onClick={onViewDetails}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                boxShadow: "0 14px 40px rgba(124,92,255,0.14)",
                background: UI.brandGradStrong,
                color: "white",
              }}
            >
              View details
            </Button>
            <Button
              variant="outlined"
              onClick={onOpenMaps}
              sx={{
                minWidth: 48,
                borderRadius: 3,
                borderColor: UI.border,
                backgroundColor: "rgba(10,10,16,0.02)",
                color: UI.text,
              }}
              aria-label="Open in Google Maps"
            >
              <LaunchIcon fontSize="small" />
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
