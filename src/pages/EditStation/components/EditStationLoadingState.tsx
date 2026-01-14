import { Box, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";
import EditStationHeader from "./EditStationHeader";

// Shows a loading placeholder while station data is fetched.
export default function EditStationLoadingState() {
  return (
    <>
      <EditStationHeader subtitle="Loading station data..." />
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px dashed ${UI.border}`,
          backgroundColor: "rgba(10,10,16,0.02)",
        }}
      >
        <Typography sx={{ fontWeight: 900, color: UI.text }}>
          Loading station details...
        </Typography>
      </Box>
    </>
  );
}
