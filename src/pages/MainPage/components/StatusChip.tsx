import { Chip } from "@mui/material";
import { UI } from "../../../theme/theme";

export default function StatusChip({ status, isChargingHere }) {
  const map = {
    CHARGING: {
      label: "Charging",
      sx: {
        borderColor: "rgba(0, 200, 83, 0.55)",
        backgroundColor: "rgba(0, 200, 83, 0.14)",
      },
    },
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

  const key = isChargingHere ? "CHARGING" : status;
  const config = map[key] ?? map.OFFLINE;

  return (
    <Chip
      size="small"
      variant="outlined"
      label={config.label}
      sx={{
        borderRadius: 999,
        color: UI.text,
        fontWeight: 700,
        ...config.sx,
      }}
    />
  );
}
