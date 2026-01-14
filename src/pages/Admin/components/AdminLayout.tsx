import type { ReactNode } from "react";
import { Box, Stack } from "@mui/material";
import { UI } from "../../../theme/theme";

type AdminLayoutProps = {
  children: ReactNode;
};

// Provides the shared page layout for the admin dashboard.
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Stack spacing={2.5}>{children}</Stack>
      </Box>
    </Box>
  );
}
