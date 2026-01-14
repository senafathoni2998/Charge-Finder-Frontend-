import { Box, Button, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";
import EditStationHeader from "./EditStationHeader";

type EditStationNotFoundStateProps = {
  errorMessage?: string | null;
  onBack: () => void;
};

// Shows a fallback message when the station cannot be loaded.
export default function EditStationNotFoundState({
  errorMessage,
  onBack,
}: EditStationNotFoundStateProps) {
  return (
    <>
      <EditStationHeader />
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px dashed ${UI.border}`,
          backgroundColor: "rgba(10,10,16,0.02)",
        }}
      >
        <Typography sx={{ fontWeight: 900, color: UI.text }}>
          {errorMessage || "Station not found."}
        </Typography>
        <Typography sx={{ color: UI.text2, mt: 0.5 }}>
          Head back to the admin console to select another station.
        </Typography>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            mt: 1.5,
            textTransform: "none",
            borderRadius: 3,
            borderColor: UI.border,
            color: UI.text,
            backgroundColor: "rgba(10,10,16,0.01)",
          }}
        >
          Back to admin
        </Button>
      </Box>
    </>
  );
}
