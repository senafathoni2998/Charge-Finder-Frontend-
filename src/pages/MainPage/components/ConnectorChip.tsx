import { Chip } from "@mui/material";
import { UI } from "../../../theme/theme";

export default function ConnectorChip({ type, powerKW }) {
  return (
    <Chip
      size="small"
      label={`${type} • ${powerKW}kW`}
      sx={{
        borderRadius: 999,
        backgroundColor: "rgba(10,10,16,0.04)",
        border: `1px solid ${UI.border2}`,
        color: UI.text,
        fontWeight: 650,
      }}
    />
  );
}