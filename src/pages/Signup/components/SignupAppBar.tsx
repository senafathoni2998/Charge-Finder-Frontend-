import { AppBar, Box, Chip, Toolbar, Typography } from "@mui/material";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import { UI } from "../../../theme/theme";

// Renders the signup page header with branding.
export default function SignupAppBar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: UI.glass,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${UI.border2}`,
        color: UI.text,
      }}
    >
      <Toolbar sx={{ gap: 1.25 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            background: UI.brandGrad,
            boxShadow: "0 12px 30px rgba(124,92,255,0.14)",
            color: "white",
          }}
          aria-label="ChargeFinder"
        >
          <ElectricBoltIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 950, color: UI.text, lineHeight: 1.1 }} noWrap>
            ChargeFinder
          </Typography>
          <Typography variant="caption" sx={{ color: UI.text3 }}>
            Create your account
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Chip
          size="small"
          label="Light mode"
          sx={{
            borderRadius: 999,
            backgroundColor: "rgba(10,10,16,0.04)",
            border: `1px solid ${UI.border2}`,
            color: UI.text2,
            fontWeight: 750,
          }}
        />
      </Toolbar>
    </AppBar>
  );
}
