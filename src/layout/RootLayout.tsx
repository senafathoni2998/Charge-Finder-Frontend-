import { Outlet, useLocation, useNavigate } from "react-router";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import PersonIcon from "@mui/icons-material/Person";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { UI } from "../theme/theme";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setSidebarOpen } from "../features/app/appSlice";

export default function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const showBack = location.pathname !== "/";
  const isMdUp = useAppSelector((state) => state.app.isMdMode);
  const dispatch = useAppDispatch();
  const navTitle = (() => {
    const path = location.pathname;
    if (path === "/") return "ChargeFinder";
    if (path.startsWith("/station/")) return "Station Details";
    if (path.startsWith("/profile/cars/new")) return "Add Car";
    if (path.startsWith("/profile")) return "Profile";
    return "ChargeFinder";
  })();

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
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
          {showBack && (
            <Tooltip title="Back">
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  border: `1px solid ${UI.border2}`,
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.03)",
                  color: UI.text,
                }}
                aria-label="Go back"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              background: UI.brandGrad,
              boxShadow: "0 12px 30px rgba(124,92,255,0.14)",
              mr: 0.5,
              color: "white",
            }}
          >
            <ElectricCarIcon fontSize="small" />
          </Box>
          <Typography
            sx={{ fontWeight: 950, letterSpacing: 0.2, color: UI.text }}
          >
            {navTitle}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Profile">
            <IconButton
              onClick={() => navigate("/profile")}
              sx={{
                borderRadius: 3,
                color: UI.text,
                ":hover": {
                  border: `1px solid ${UI.border2}`,
                  backgroundColor: "rgba(10,10,16,0.03)",
                },
              }}
              aria-label="Open profile"
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>

          {!isMdUp && (
            <Tooltip title="Filters">
              <IconButton
                onClick={() => dispatch(setSidebarOpen(true))}
                sx={{
                  borderRadius: 3,
                  color: UI.text,
                  ":hover": {
                    border: `1px solid ${UI.border2}`,
                    backgroundColor: "rgba(10,10,16,0.03)",
                  },
                }}
                aria-label="Open filters"
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Outlet />
    </Box>
  );
}
