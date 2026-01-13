import { Box, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

type AddUserHeaderProps = {
  title?: string;
  subtitle?: string;
};

// Renders the title and supporting copy for the add user flow.
export default function AddUserHeader({
  title = "Add user",
  subtitle = "Invite a teammate and set their access level.",
}: AddUserHeaderProps) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 28 }}>
        {title}
      </Typography>
      <Typography sx={{ color: UI.text2 }}>{subtitle}</Typography>
    </Box>
  );
}
