import { Box, Button, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";
import EditCarHeader from "./EditCarHeader";

type EditCarNotFoundProps = {
  onBack: () => void;
};

// Shows the fallback message when the selected car cannot be found.
export default function EditCarNotFound({ onBack }: EditCarNotFoundProps) {
  return (
    <>
      <EditCarHeader />
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px dashed ${UI.border}`,
          backgroundColor: "rgba(10,10,16,0.02)",
        }}
      >
        <Typography sx={{ fontWeight: 900, color: UI.text }}>
          Car not found.
        </Typography>
        <Typography sx={{ color: UI.text2, mt: 0.5 }}>
          Head back to your profile to choose a different car.
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
          Back to profile
        </Button>
      </Box>
    </>
  );
}
