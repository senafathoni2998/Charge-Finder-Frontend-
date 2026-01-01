import { useEffect, useMemo, useState } from "react";
// NOTE: This page uses react-router for navigation in the full app.
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Drawer,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Stack,
  Chip,
  Card,
  CardContent,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  FormControlLabel,
  Switch,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LaunchIcon from "@mui/icons-material/Launch";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DRAWER_WIDTH, MOCK_STATIONS } from "../../data/stations";
import { UI } from "../../theme/theme";
import MapCanvas from "../../components/Map/MapCanvas";
import StatusChip from "./components/StatusChip";
import ConnectorChip from "./components/ConnectorChip";
import { minutesAgo } from "../../utils/time";
import React from "react";
import StationCard from "./components/StationCard";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setMdMode, setSidebarOpen } from "../../features/app/appSlice";
import { boundsFromStations, filterStations } from "../../utils/distance";
import { useGeoLocation } from "../../hooks/useGeolocation";
import { useNavigate } from "react-router";

/** @typedef {"AVAILABLE"|"BUSY"|"OFFLINE"} Availability */
/** @typedef {"CCS2"|"Type2"|"CHAdeMO"} ConnectorType */

export default function MainPage() {
  // Filters are local state (canvas-safe). In your real app, sync them to URL query.
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(/** @type {""|Availability} */ "");
  const [connectorSet, setConnectorSet] = useState(new Set());
  const [minKW, setMinKW] = useState(0);
  const [useCarFilter, setUseCarFilter] = useState(false);
  const [carFilterTouched, setCarFilterTouched] = useState(false);

  const drawerOpen = useAppSelector((state) => state.app.isSidebarOpen);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);
  const dispatch = useAppDispatch();

  // SSR-safe: prevents MUI from touching matchMedia during non-browser rendering.
  const isMdUp = useMediaQuery("(min-width:900px)", {
    noSsr: true,
    defaultMatches: true,
  });

  useEffect(() => {
    dispatch(setMdMode(isMdUp));
  }, [isMdUp]);

  // const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const stations = MOCK_STATIONS;
  const geo = useGeoLocation();
  const userCenter = geo.loc ?? { lat: -6.2, lng: 106.8167 };
  const activeCar = useMemo(
    () => cars.find((c) => c.id === activeCarId) ?? null,
    [cars, activeCarId]
  );

  useEffect(() => {
    if (!activeCar || !activeCar.connectorTypes.length) {
      setUseCarFilter(false);
      setCarFilterTouched(false);
      return;
    }
    if (!carFilterTouched) setUseCarFilter(true);
  }, [activeCar, carFilterTouched]);

  const carConnectorSet = useMemo(
    () => new Set(activeCar?.connectorTypes ?? []),
    [activeCar]
  );

  const effectiveConnectorSet = useMemo(() => {
    if (useCarFilter && carConnectorSet.size) return carConnectorSet;
    return connectorSet;
  }, [useCarFilter, carConnectorSet, connectorSet]);

  const effectiveMinKW = useMemo(() => {
    const base = Number.isFinite(minKW) ? minKW : 0;
    if (useCarFilter && activeCar && Number.isFinite(activeCar.minKW)) {
      return Math.max(base, activeCar.minKW);
    }
    return base;
  }, [minKW, useCarFilter, activeCar]);

  const filtered = useMemo(() => {
    return filterStations(
      stations,
      {
        q,
        status,
        connectorSet: effectiveConnectorSet,
        minKW: effectiveMinKW,
      },
      userCenter
    );
  }, [stations, q, status, effectiveConnectorSet, effectiveMinKW, userCenter]);

  const selected = useMemo(
    () => filtered.find((s) => s.id === selectedId) || null,
    [filtered, selectedId]
  );

  const bounds = useMemo(
    () => boundsFromStations(filtered.length ? filtered : stations),
    [filtered, stations]
  );

  const focusStation = (s) => {
    // navigate(`/station/${s.id}`);
    setSelectedId(s.id);
  };

  const accordionSx = {
    border: `1px solid ${UI.border2}`,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    boxShadow: "none",
    "&:before": { display: "none" },
  };

  const accordionSummarySx = {
    px: 1.5,
    minHeight: 48,
    "&.Mui-expanded": { minHeight: 48 },
    "& .MuiAccordionSummary-content": { margin: "8px 0" },
  };

  const accordionDetailsSx = { px: 1.5, pb: 1.5, pt: 0 };

  const FiltersPanel = (
    <Box sx={{ p: 2.25 }}>
      <Stack spacing={2}>
        <Stack spacing={0.75}>
          <Typography variant="caption" sx={{ color: UI.text3 }}>
            Search
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search station or area…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(10,10,16,0.04)",
                borderRadius: 3,
              },
            }}
          />
        </Stack>
        <Accordion defaultExpanded sx={accordionSx}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={accordionSummarySx}
          >
            <Typography sx={{ fontWeight: 900, color: UI.text }}>
              Filters
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={accordionDetailsSx}>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  Availability
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={status}
                  onChange={(_, v) => setStatus(v ?? "")}
                  size="small"
                  sx={{
                    mt: 0.5,
                    flexWrap: "wrap",
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      borderColor: UI.border2,
                    },
                  }}
                >
                  <ToggleButton value="">All</ToggleButton>
                  <ToggleButton value="AVAILABLE">Available</ToggleButton>
                  <ToggleButton value="BUSY">Busy</ToggleButton>
                  <ToggleButton value="OFFLINE">Offline</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  Connectors
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: "wrap" }}
                >
                  {
                    /** @type {ConnectorType[]} */ [
                      "CCS2",
                      "Type2",
                      "CHAdeMO",
                    ].map((c) => {
                      const active = connectorSet.has(c);
                      return (
                        <Chip
                          key={c}
                          clickable
                          label={c}
                          variant={active ? "filled" : "outlined"}
                          disabled={useCarFilter}
                          onClick={() => {
                            setConnectorSet((prev) => {
                              const next = new Set(prev);
                              if (next.has(c)) next.delete(c);
                              else next.add(c);
                              return next;
                            });
                          }}
                          sx={{
                            borderRadius: 999,
                            backgroundColor: active
                              ? "rgba(124,92,255,0.12)"
                              : "transparent",
                            borderColor: active
                              ? "rgba(124,92,255,0.35)"
                              : UI.border2,
                            color: UI.text,
                            fontWeight: 700,
                          }}
                        />
                      );
                    })
                  }
                </Stack>
                {useCarFilter ? (
                  <Typography
                    variant="caption"
                    sx={{ color: UI.text3, mt: 0.75, display: "block" }}
                  >
                    Connector filters are driven by your car profile.
                  </Typography>
                ) : null}
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    My car
                  </Typography>
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    {activeCar ? activeCar.name : "Not set"}
                  </Typography>
                </Stack>

                {activeCar ? (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useCarFilter}
                          onChange={(e) => {
                            setUseCarFilter(e.target.checked);
                            setCarFilterTouched(true);
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <Typography sx={{ color: UI.text2, fontWeight: 700 }}>
                          Use my car to filter stations
                        </Typography>
                      }
                      sx={{ mt: 0.5, ml: -0.5 }}
                    />
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 0.75, flexWrap: "wrap" }}
                    >
                      {activeCar.connectorTypes.map((c) => (
                        <Chip
                          key={c}
                          size="small"
                          label={c}
                          sx={{
                            borderRadius: 999,
                            backgroundColor: "rgba(124,92,255,0.12)",
                            borderColor: "rgba(124,92,255,0.35)",
                            color: UI.text,
                            fontWeight: 700,
                          }}
                        />
                      ))}
                    </Stack>
                  </>
                ) : (
                  <Stack spacing={1} sx={{ mt: 0.75 }}>
                    <Typography variant="body2" sx={{ color: UI.text2 }}>
                      Add a car to personalize results.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate("/profile/cars/new")}
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        borderColor: UI.border,
                        color: UI.text,
                        alignSelf: "flex-start",
                      }}
                    >
                      Add car
                    </Button>
                  </Stack>
                )}
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    Minimum power
                  </Typography>
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    {effectiveMinKW || 0} kW
                  </Typography>
                </Stack>
                <Slider
                  value={Number.isFinite(minKW) ? minKW : 0}
                  onChange={(_, v) => setMinKW(Array.isArray(v) ? v[0] : v)}
                  step={10}
                  min={0}
                  max={200}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ opacity: 0.35, borderColor: UI.border2 }} />

        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography sx={{ fontWeight: 900, color: UI.text }}>
              Stations
            </Typography>
            <Chip
              size="small"
              label={`${filtered.length}`}
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.04)",
                border: `1px solid ${UI.border2}`,
                color: UI.text2,
                fontWeight: 750,
              }}
            />
          </Stack>

          <Stack spacing={1.2}>
            {filtered.map((s) => (
              <StationCard
                key={s.id}
                s={s}
                selectedId={selectedId}
                focusStation={focusStation}
              />
            ))}
            {!filtered.length && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px dashed ${UI.border}`,
                  backgroundColor: UI.surface,
                }}
              >
                <Typography sx={{ fontWeight: 900, color: UI.text }}>
                  No stations match your filters.
                </Typography>
                <Typography variant="body2" sx={{ color: UI.text2, mt: 0.5 }}>
                  Try clearing connector or lowering the minimum kW.
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );

  const openGoogleMaps = (s) => {
    if (typeof window === "undefined") return;
    const url = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isMdUp ? `${DRAWER_WIDTH}px 1fr` : "1fr",
          height: "calc(100dvh - 64px)",
        }}
      >
        {isMdUp ? (
          <Box
            sx={{
              borderRight: `1px solid ${UI.border2}`,
              backgroundColor: UI.surface2,
              overflow: "auto",
            }}
          >
            {FiltersPanel}
          </Box>
        ) : (
          <Drawer
            open={drawerOpen}
            onClose={() => dispatch(setSidebarOpen(false))}
            PaperProps={{
              sx: {
                width: "min(92vw, 420px)",
                backgroundColor: UI.surface,
                borderRight: `1px solid ${UI.border2}`,
                color: UI.text,
              },
            }}
          >
            {FiltersPanel}
          </Drawer>
        )}

        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderLeft: isMdUp ? "none" : `1px solid ${UI.border2}`,
              backgroundColor: "transparent",
            }}
          >
            <MapCanvas
              stations={filtered}
              bounds={bounds}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              userLoc={geo.loc}
            />
          </Box>

          <IconButton
            onClick={() => {
              geo.request();
              if (!isMdUp) dispatch(setSidebarOpen(true));
            }}
            disabled={geo.loading}
            sx={{
              zIndex: 9999,
              position: "absolute",
              right: 14,
              bottom: 14,
              border: `1px solid ${UI.border2}`,
              borderRadius: 3,
              backgroundColor: "hsla(0, 0%, 97%, 1.00)",
              color: UI.text,
              boxShadow: UI.shadow,
              ":hover": { backgroundColor: "hsla(0, 0%, 95%, 1.00)" },
            }}
            aria-label="Use my location"
          >
            {geo.loading ? <CircularProgress size={18} /> : <MyLocationIcon />}
          </IconButton>

          {selected && (
            <Card
              elevation={0}
              sx={{
                zIndex: 9999,
                position: "absolute",
                left: 14,
                bottom: 14,
                width: "min(420px, calc(100% - 28px))",
                borderRadius: 4,
                border: `1px solid ${UI.border}`,
                backgroundColor: UI.surface2,
                backdropFilter: "blur(10px)",
                boxShadow: UI.shadow,
              }}
            >
              <CardContent sx={{ p: 2.25 }}>
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 950,
                          lineHeight: 1.1,
                          color: UI.text,
                        }}
                      >
                        {selected.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: UI.text2 }}>
                        {selected.address}
                      </Typography>
                    </Box>
                    <StatusChip status={selected.status} />
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {selected.connectors.map((c, idx) => (
                      <ConnectorChip
                        key={idx}
                        type={c.type}
                        powerKW={c.powerKW}
                      />
                    ))}
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" sx={{ color: UI.text2 }}>
                      {selected.distanceKm.toFixed(1)} km away
                    </Typography>
                    <Typography variant="caption" sx={{ color: UI.text3 }}>
                      Updated {minutesAgo(selected.lastUpdatedISO)}m ago
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      // onClick={() => setDetailOpen(true)}
                      onClick={() => navigate(`/station/${selected.id}`)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        boxShadow: "0 14px 40px rgba(124,92,255,0.14)",
                        background: UI.brandGradStrong,
                        color: "white",
                      }}
                    >
                      View details
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => openGoogleMaps(selected)}
                      sx={{
                        minWidth: 48,
                        borderRadius: 3,
                        borderColor: UI.border,
                        backgroundColor: "rgba(10,10,16,0.02)",
                        color: UI.text,
                      }}
                      aria-label="Open in Google Maps"
                    >
                      <LaunchIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
}
