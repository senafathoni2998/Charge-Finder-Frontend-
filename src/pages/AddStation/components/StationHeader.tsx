import { Box, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

type StationHeaderProps = {
  title?: string;
  subtitle?: string;
};

// Renders the title and supporting copy for the station form flow.
export default function StationHeader({
  title = "Add station",
  subtitle = "Create and maintain station details for the network.",
}: StationHeaderProps) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 28 }}>
        {title}
      </Typography>
      <Typography sx={{ color: UI.text2 }}>{subtitle}</Typography>
    </Box>
  );
}
