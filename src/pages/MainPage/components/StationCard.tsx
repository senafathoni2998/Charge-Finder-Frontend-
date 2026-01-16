import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";
import ConnectorChip from "./ConnectorChip";
import StatusChip from "./StatusChip";
import { minutesAgo } from "../../../utils/time";

const StationCard = ({ s, selectedId, focusStation }) => (
    <Card
      variant="outlined"
      onClick={() => focusStation(s)}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        borderColor: selectedId === s.id ? "rgba(124,92,255,0.35)" : UI.border2,
        backgroundColor:
          selectedId === s.id ? "rgba(124,92,255,0.08)" : UI.surface,
        boxShadow:
          selectedId === s.id ? "none" : "0 10px 22px rgba(10,10,16,0.06)",
        transition:
          "transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: UI.border,
          boxShadow: "0 14px 26px rgba(10,10,16,0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box>
              <Typography
                sx={{ fontWeight: 850, lineHeight: 1.1, color: UI.text }}
              >
                {s.name}
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2 }}>
                {s.address}
              </Typography>
            </Box>
            <StatusChip status={s.status} isChargingHere={s.isChargingHere} />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {s.connectors.slice(0, 3).map((c, idx) => (
              <ConnectorChip key={idx} type={c.type} powerKW={c.powerKW} />
            ))}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              {s.distanceKm.toFixed(1)} km away
            </Typography>
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Updated {minutesAgo(s.lastUpdatedISO)}m ago
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  export default   StationCard;
