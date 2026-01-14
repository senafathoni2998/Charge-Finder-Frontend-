import type { ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

type AdminStat = {
  label: string;
  value: number;
  caption: string;
  icon: ReactNode;
};

type StatsGridProps = {
  stats: AdminStat[];
};

// Displays the grid of admin summary statistics.
export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
      }}
    >
      {stats.map((stat) => (
        <Card
          key={stat.label}
          variant="outlined"
          sx={{
            borderRadius: 4,
            borderColor: UI.border2,
            background: UI.surface,
            boxShadow: "0 12px 30px rgba(10,10,16,0.08)",
          }}
        >
          <CardContent sx={{ p: 2.25 }}>
            <Stack spacing={1}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(124,92,255,0.12)",
                  color: UI.text,
                }}
              >
                {stat.icon}
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: 22, color: UI.text }}>
                {stat.value}
              </Typography>
              <Typography sx={{ color: UI.text2, fontWeight: 600 }}>
                {stat.label}
              </Typography>
              <Typography sx={{ color: UI.text3, fontSize: 13 }}>
                {stat.caption}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
