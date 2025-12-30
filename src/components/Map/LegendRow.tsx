import { Box, Stack, Typography } from "@mui/material";
import { UI } from "../../theme/theme";

export default function LegendRow({ label, color }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: 999,
          backgroundColor: color,
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 6px 16px rgba(10,10,16,0.14)",
        }}
      />
      <Typography variant="caption" sx={{ color: UI.text2, fontWeight: 650 }}>
        {label}
      </Typography>
    </Stack>
  );
}
