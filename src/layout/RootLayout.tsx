import { NavLink, Outlet } from "react-router";
import { AppBar, Box, Toolbar, Typography, IconButton, Tooltip, useMediaQuery, CircularProgress } from "@mui/material";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FilterListIcon from "@mui/icons-material/FilterList";
import { UI } from "../theme/theme";
import { useGeoLocation } from "../pages/MainPage/utils/useGeoLocation";
import { useState } from "react";

export default function RootLayout() {
      const geo = useGeoLocation();
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
            ChargeFinder
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={geo.error || "Use my location"}>
            <span>
              <IconButton
                onClick={() => {
                  geo.request();
                //   if (!isMdUp) setDrawerOpen(true);
                }}
                disabled={geo.loading}
                sx={{
                  border: `1px solid ${UI.border2}`,
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.03)",
                  color: UI.text,
                }}
                aria-label="Use my location"
              >
                {geo.loading ? (
                  <CircularProgress size={18} />
                ) : (
                  <MyLocationIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>

          {/* {!isMdUp && (
            <Tooltip title="Filters">
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  border: `1px solid ${UI.border2}`,
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.03)",
                  color: UI.text,
                }}
                aria-label="Open filters"
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )} */}
        </Toolbar>
      </AppBar>

      <Outlet />

      </Box>
  );
}