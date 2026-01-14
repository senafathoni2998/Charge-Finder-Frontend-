import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import { UI } from "../../../theme/theme";

type AdminHeaderProps = {
  onAddStation: () => void;
  onInviteUser: () => void;
};

// Renders the title, subtitle, and quick actions for the admin page.
export default function AdminHeader({
  onAddStation,
  onInviteUser,
}: AdminHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ md: "center" }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 30 }}>
          Admin Control Center
        </Typography>
        <Typography sx={{ color: UI.text2 }}>
          Manage stations, users, and operational health in one place.
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }} />
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
          icon={<AdminPanelSettingsIcon />}
          label="Role: Admin"
          sx={{
            borderRadius: 999,
            backgroundColor: "rgba(124,92,255,0.12)",
            border: "1px solid rgba(124,92,255,0.35)",
            color: UI.text,
            fontWeight: 700,
          }}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddStation}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            borderColor: UI.border,
            color: UI.text,
            backgroundColor: "rgba(10,10,16,0.01)",
          }}
        >
          Add station
        </Button>
        <Button
          variant="contained"
          startIcon={<PeopleIcon />}
          onClick={onInviteUser}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGrad,
            boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
          }}
        >
          Invite user
        </Button>
      </Stack>
    </Stack>
  );
}
