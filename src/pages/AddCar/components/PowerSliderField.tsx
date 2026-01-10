import { Box, Slider, Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

type PowerSliderFieldProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
};

// Renders the min power preference slider with a live value label.
export default function PowerSliderField({
  value,
  onChange,
  min,
  max,
  step,
}: PowerSliderFieldProps) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" sx={{ color: UI.text3 }}>
          Preferred minimum power
        </Typography>
        <Typography variant="caption" sx={{ color: UI.text2 }}>
          {safeValue} kW
        </Typography>
      </Stack>
      <Slider
        value={safeValue}
        onChange={(_, nextValue) =>
          onChange(Array.isArray(nextValue) ? nextValue[0] : nextValue)
        }
        step={step}
        min={min}
        max={max}
        sx={{ mt: 1 }}
      />
    </Box>
  );
}
