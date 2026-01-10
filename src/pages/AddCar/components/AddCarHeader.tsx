import { Box, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

// Renders the title and supporting copy for the add-car flow.
export default function AddCarHeader() {
  return (
    <Box>
      <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 28 }}>
        Add a car
      </Typography>
      <Typography sx={{ color: UI.text2 }}>
        Save your connector types to personalize compatible stations.
      </Typography>
    </Box>
  );
}
