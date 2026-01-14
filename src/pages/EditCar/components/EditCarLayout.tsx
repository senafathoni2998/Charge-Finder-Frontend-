import type { ReactNode } from "react";
import { Box, Stack } from "@mui/material";
import { UI } from "../../../theme/theme";

type EditCarLayoutProps = {
  children: ReactNode;
};

// Provides the shared page layout for edit-car screens.
export default function EditCarLayout({ children }: EditCarLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack spacing={2.5}>{children}</Stack>
      </Box>
    </Box>
  );
}
