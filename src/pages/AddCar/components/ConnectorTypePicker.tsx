import { Box, Chip, Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";
import type { ConnectorType } from "../../../models/model";

type ConnectorTypePickerProps = {
  options: ConnectorType[];
  selected: Set<ConnectorType>;
  onToggle: (connector: ConnectorType) => void;
  error: string | null;
};

// Renders selectable connector chips with inline validation feedback.
export default function ConnectorTypePicker({
  options,
  selected,
  onToggle,
  error,
}: ConnectorTypePickerProps) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: UI.text3 }}>
        Connector types
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
        {options.map((connector) => {
          const active = selected.has(connector);
          return (
            <Chip
              key={connector}
              clickable
              label={connector}
              variant={active ? "filled" : "outlined"}
              onClick={() => onToggle(connector)}
              sx={{
                borderRadius: 999,
                backgroundColor: active
                  ? "rgba(124,92,255,0.12)"
                  : "transparent",
                borderColor: active
                  ? "rgba(124,92,255,0.35)"
                  : UI.border2,
                color: UI.text,
                fontWeight: 700,
              }}
            />
          );
        })}
      </Stack>
      {error ? (
        <Typography
          variant="caption"
          sx={{
            color: "rgba(244,67,54,0.9)",
            mt: 0.75,
            display: "block",
          }}
        >
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
