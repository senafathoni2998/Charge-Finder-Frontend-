import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

// Shows the operational snapshot hero card.
export default function OperationalSnapshotCard() {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: UI.shadow,
        overflow: "hidden",
      }}
    >
      <Box sx={{ height: 6, background: UI.brandGradStrong }} />
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, color: UI.text, fontSize: 20 }}>
              Operational snapshot
            </Typography>
            <Typography sx={{ color: UI.text2 }}>
              Review key signals and keep the network healthy.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
          >
            <Chip
              label="Stations synced"
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(0,229,255,0.12)",
                border: "1px solid rgba(0,229,255,0.35)",
                color: UI.text,
                fontWeight: 700,
              }}
            />
            <Chip
              label="Security checks passed"
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.05)",
                border: `1px solid ${UI.border2}`,
                color: UI.text,
                fontWeight: 700,
              }}
            />
            <Chip
              label="Last sync 5m ago"
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(124,92,255,0.12)",
                border: "1px solid rgba(124,92,255,0.35)",
                color: UI.text,
                fontWeight: 700,
              }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
