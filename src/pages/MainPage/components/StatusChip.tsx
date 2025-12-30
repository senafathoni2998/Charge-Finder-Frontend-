import { Chip } from "@mui/material";
import { UI } from "../../../theme/theme";

export default function StatusChip({ status }) {
  const map = {
    AVAILABLE: {
      label: "Available",
      sx: {
        borderColor: "rgba(0, 229, 255, 0.55)",
        backgroundColor: "rgba(0, 229, 255, 0.14)",
      },
    },
    BUSY: {
      label: "Busy",
      sx: {
        borderColor: "rgba(255, 193, 7, 0.55)",
        backgroundColor: "rgba(255, 193, 7, 0.14)",
      },
    },
    OFFLINE: {
      label: "Offline",
      sx: {
        borderColor: "rgba(244, 67, 54, 0.55)",
        backgroundColor: "rgba(244, 67, 54, 0.14)",
      },
    },
  };

  return (
    <Chip
      size="small"
      variant="outlined"
      label={map[status].label}
      sx={{
        borderRadius: 999,
        color: UI.text,
        fontWeight: 700,
        ...map[status].sx,
      }}
    />
  );
}