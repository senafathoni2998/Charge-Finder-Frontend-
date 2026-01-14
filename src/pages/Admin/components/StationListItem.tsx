import type { MouseEvent } from "react";
import { Box, Chip, Divider, IconButton, Stack, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { Station } from "../../../models/model";
import { UI } from "../../../theme/theme";
import { minutesAgo } from "../../../utils/time";
import { statusChipStyles } from "../utils";

type StationListItemProps = {
  station: Station;
  onOpenMenu: (event: MouseEvent<HTMLElement>, station: Station) => void;
};

// Calculates the port summary and connector labels for a station.
const getStationDisplayMeta = (station: Station) => {
  const totalPorts = station.connectors.reduce((sum, c) => sum + c.ports, 0);
  const availablePorts = station.connectors.reduce(
    (sum, c) => sum + c.availablePorts,
    0
  );
  const connectorLabels = station.connectors.map((c) => c.type).join(", ");
  return { totalPorts, availablePorts, connectorLabels };
};

// Renders the station row with status and menu actions.
export default function StationListItem({
  station,
  onOpenMenu,
}: StationListItemProps) {
  const { totalPorts, availablePorts, connectorLabels } =
    getStationDisplayMeta(station);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ md: "center" }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, color: UI.text, fontSize: 16 }}>
            {station.name}
          </Typography>
          <Typography sx={{ color: UI.text2, fontSize: 13 }}>
            {station.address}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ mt: 0.5 }}
          >
            <Chip
              label={`${availablePorts}/${totalPorts} ports`}
              size="small"
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.05)",
                border: `1px solid ${UI.border2}`,
                color: UI.text,
              }}
            />
            <Typography sx={{ color: UI.text3, fontSize: 12 }}>
              {connectorLabels}
            </Typography>
            <Typography sx={{ color: UI.text3, fontSize: 12 }}>
              Updated {minutesAgo(station.lastUpdatedISO)}m ago
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            label={station.status}
            size="small"
            sx={{
              borderRadius: 999,
              fontWeight: 700,
              ...statusChipStyles(station.status),
            }}
          />
          <IconButton
            onClick={(event) => onOpenMenu(event, station)}
            sx={{ borderRadius: 2.5, border: `1px solid ${UI.border2}` }}
            aria-label="Station actions"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Divider sx={{ my: 2, borderColor: UI.border2 }} />
    </Box>
  );
}
