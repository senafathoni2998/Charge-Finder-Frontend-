import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Card,
  CardContent,
  Button,
  Divider,
  Tooltip,
  CircularProgress,
  LinearProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import ShareIcon from "@mui/icons-material/Share";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LaunchIcon from "@mui/icons-material/Launch";
import { UI } from "../../theme/theme";
import { MOCK_STATIONS } from "../../data/stations";
import InfoRow from "./components/InfoRow";
import { Availability } from "../../models/model";
import ConnectorRow from "./components/ConnectorRow";
import { minutesAgo } from "../../utils/time";
import { statusColor } from "../../utils/map";
import { formatCurrency, haversineKm, statusLabel } from "../../utils/distance";
import { useGeoLocation } from "../../hooks/useGeolocation";
import SectionCard from "./components/SectionCard";
import StatusChip from "../MainPage/components/StatusChip";
import MiniPhoto from "./components/MiniPhoto";
import { useLocation, useNavigate, useParams } from "react-router";
import { useAppSelector } from "../../app/hooks";

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Card - Visa **** 4242",
    helper: "Instant approval",
  },
  {
    id: "ewallet",
    label: "E-Wallet - GoPay",
    helper: "Balance required",
  },
  {
    id: "bank",
    label: "Bank transfer - BCA",
    helper: "May take 1-3 min",
  },
];

/**
 * ChargeFinder — Station Detail Page (Canvas-safe) — LIGHT MODE
 *
 * Canvas notes:
 * - No react-router required.
 * - No Leaflet.
 * - Uses mock data and safe browser-only actions.
 */

export default function StationDetailPage() {
  const isMdUp = useMediaQuery("(min-width:900px)", {
    noSsr: true,
    defaultMatches: true,
  });

  const { id: stationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);

  // Demo selector for canvas. In your app, stationId will come from route params.
  //   const [stationId, setStationId] = useState("st-001");
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportType, setReportType] = useState("Broken connector");
  const [reportNote, setReportNote] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    PAYMENT_METHODS[0].id
  );
  const [ticket, setTicket] = useState<{
    id: string;
    methodId: string;
    methodLabel: string;
    priceLabel: string;
    purchasedAt: string;
  } | null>(null);
  const [chargingOpen, setChargingOpen] = useState(false);
  const [chargingProgress, setChargingProgress] = useState(0);
  const [chargingStatus, setChargingStatus] = useState<
    "idle" | "charging" | "done"
  >("idle");

  const geo = useGeoLocation();
  const userCenter = geo.loc ?? { lat: -6.2, lng: 106.8167 };

  // Simulate async load
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, [stationId]);

  const station = useMemo(() => {
    return MOCK_STATIONS.find((s) => s.id === stationId) ?? null;
  }, [stationId]);

  console.log("Station detail for ID:", stationId, station);

  const selectedPayment = useMemo(
    () =>
      PAYMENT_METHODS.find((method) => method.id === selectedPaymentId) ??
      PAYMENT_METHODS[0],
    [selectedPaymentId]
  );

  const ticketKwh = 20;
  const ticketPriceLabel = station
    ? formatCurrency(station.pricing.currency, station.pricing.perKwh * ticketKwh)
    : "N/A";
  const totalChargeMinutes = 18;
  const remainingMinutes = Math.max(
    0,
    Math.ceil(((100 - chargingProgress) / 100) * totalChargeMinutes)
  );
  const deliveredKwh = Math.round((ticketKwh * chargingProgress) / 100);

  const distanceKm = useMemo(() => {
    if (!station) return null;
    return haversineKm(userCenter, { lat: station.lat, lng: station.lng });
  }, [station, userCenter]);

  const activeCar = useMemo(
    () => cars.find((c) => c.id === activeCarId) ?? null,
    [cars, activeCarId]
  );

  const isCompatible = useMemo(() => {
    if (!activeCar || !station || !activeCar.connectorTypes.length) return null;
    return station.connectors.some((c) =>
      activeCar.connectorTypes.includes(c.type)
    );
  }, [activeCar, station]);

  const canCharge =
    isAuthenticated &&
    station?.status === "AVAILABLE" &&
    (isCompatible ?? true) &&
    !!ticket;
  const canStartCharging = canCharge && chargingStatus !== "charging";
  const chargingActionLabel =
    chargingStatus === "charging" ? "View charging" : "Start charging";
  const paymentActionLabel = !isAuthenticated
    ? "Log in to buy ticket"
    : ticket
      ? "Change payment"
      : "Buy charging ticket";

  const handleLoginRedirect = () => {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    navigate(`/login?next=${next}`);
  };

  const handleBuyTicket = () => {
    if (!station || !isAuthenticated) return;
    const ticketId = `TICKET-${Date.now()}`;
    const methodLabel = selectedPayment.label;
    setTicket({
      id: ticketId,
      methodId: selectedPayment.id,
      methodLabel,
      priceLabel: ticketPriceLabel,
      purchasedAt: new Date().toISOString(),
    });
    setPaymentOpen(false);
  };

  const handleStartCharging = () => {
    if (!canStartCharging) return;
    setChargingProgress(0);
    setChargingStatus("charging");
    setChargingOpen(true);
  };

  const handleChargingAction = () => {
    if (chargingStatus === "charging") {
      setChargingOpen(true);
      return;
    }
    handleStartCharging();
  };

  const handlePaymentOpen = () => {
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }
    setPaymentOpen(true);
  };

  const handleCloseCharging = () => {
    setChargingOpen(false);
    if (chargingStatus === "done") {
      setChargingStatus("idle");
      setChargingProgress(0);
    }
  };

  const handleStopCharging = () => {
    setChargingOpen(false);
    setChargingStatus("idle");
    setChargingProgress(0);
  };

  useEffect(() => {
    if (chargingStatus !== "charging") return;
    const interval = window.setInterval(() => {
      setChargingProgress((prev) => {
        const next = Math.min(100, prev + 4);
        if (next >= 100) setChargingStatus("done");
        return next;
      });
    }, 700);
    return () => window.clearInterval(interval);
  }, [chargingStatus]);

  useEffect(() => {
    if (isAuthenticated) return;
    setPaymentOpen(false);
    setTicket(null);
    setChargingOpen(false);
    setChargingProgress(0);
    setChargingStatus("idle");
  }, [isAuthenticated]);

  const openGoogleMaps = () => {
    if (!station || typeof window === "undefined") return;
    const url = `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const share = async () => {
    if (!station) return;
    const shareText = `${station.name} — ${station.address}`;
    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`;

    try {
      // Prefer native share

      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: station.name,
          text: shareText,
          url: shareUrl,
        });
        return;
      }
      setShareOpen(true);
    } catch {
      setShareOpen(true);
    }
  };

  const submitReport = () => {
    // Canvas-safe demo: just close and reset.
    setReportOpen(false);
    setReportNote("");
  };

  console.log("Rendering StationDetailPage for station:", station, loading);

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          display: "grid",
          gap: 2,
          gridTemplateColumns: isMdUp ? "1.2fr 0.8fr" : "1fr",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <Stack spacing={2}>
          <SectionCard
            title={loading ? "Loading…" : station?.name ?? "Station"}
            subtitle={loading ? "" : station?.address}
            right={
              loading ? (
                <Skeleton variant="rounded" width={90} height={28} />
              ) : station ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusChip status={station.status as Availability} />
                  {activeCar && activeCar.connectorTypes.length ? (
                    <Chip
                      size="small"
                      label={isCompatible ? "Compatible" : "Not supported"}
                      sx={{
                        borderRadius: 999,
                        backgroundColor: isCompatible
                          ? "rgba(0,229,255,0.16)"
                          : "rgba(244,67,54,0.16)",
                        border: `1px solid ${
                          isCompatible
                            ? "rgba(0,229,255,0.35)"
                            : "rgba(244,67,54,0.35)"
                        }`,
                        color: UI.text,
                        fontWeight: 800,
                      }}
                    />
                  ) : null}
                </Stack>
              ) : null
            }
          >
            {loading || !station ? (
              <Stack spacing={1.25}>
                <Skeleton variant="rounded" height={140} />
                <Skeleton variant="rounded" height={140} />
              </Stack>
            ) : (
              <Stack spacing={1.25}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <MiniPhoto
                    label={station.photos[0]?.label ?? "Photo"}
                    gradient={station.photos[0]?.gradient ?? UI.brandGrad}
                  />
                  <MiniPhoto
                    label={station.photos[1]?.label ?? "Photo"}
                    gradient={station.photos[1]?.gradient ?? UI.brandGrad}
                  />
                  <MiniPhoto
                    label={station.photos[2]?.label ?? "Photo"}
                    gradient={station.photos[2]?.gradient ?? UI.brandGrad}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                >
                  <Chip
                    icon={<LaunchIcon />}
                    label={
                      distanceKm ? `${distanceKm.toFixed(1)} km away` : "—"
                    }
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(10,10,16,0.04)",
                      border: `1px solid ${UI.border2}`,
                      color: UI.text2,
                      fontWeight: 750,
                      alignSelf: { xs: "flex-start", sm: "auto" },
                    }}
                  />
                  <Chip
                    label={`Updated ${minutesAgo(station.lastUpdatedISO)}m ago`}
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(10,10,16,0.04)",
                      border: `1px solid ${UI.border2}`,
                      color: UI.text2,
                      fontWeight: 750,
                      alignSelf: { xs: "flex-start", sm: "auto" },
                    }}
                  />
                  <Box sx={{ flex: 1 }} />
                  <Button
                    variant="outlined"
                    onClick={() => setReportOpen(true)}
                    startIcon={<ReportProblemIcon />}
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      borderColor: UI.border,
                      color: UI.text,
                      alignSelf: { xs: "stretch", sm: "auto" },
                    }}
                  >
                    Report issue
                  </Button>
                </Stack>

                {station.notes ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: `1px dashed ${UI.border}`,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, color: UI.text }}>
                      Notes
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: UI.text2, mt: 0.5 }}
                    >
                      {station.notes}
                    </Typography>
                  </Box>
                ) : null}
              </Stack>
            )}
          </SectionCard>

          <SectionCard
            title="Connectors"
            subtitle="Compatibility + real‑time availability per connector type"
          >
            {loading || !station ? (
              <Stack spacing={1.2}>
                <Skeleton variant="rounded" height={72} />
                <Skeleton variant="rounded" height={72} />
              </Stack>
            ) : (
              <Stack spacing={1.2}>
                {station.connectors.map((c) => (
                  <ConnectorRow key={c.type} c={c as any} />
                ))}
              </Stack>
            )}
          </SectionCard>

          <SectionCard
            title="Amenities"
            subtitle="Helpful things near this station"
          >
            {loading || !station ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" width={92} height={28} />
                ))}
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {station.amenities.map((a) => (
                  <Chip
                    key={a}
                    label={a}
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(10,10,16,0.04)",
                      border: `1px solid ${UI.border2}`,
                      color: UI.text2,
                      fontWeight: 750,
                    }}
                  />
                ))}
              </Stack>
            )}
          </SectionCard>
        </Stack>

        {/* Right column */}
        <Stack spacing={2}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 4,
              borderColor: UI.border2,
              backgroundColor: UI.surface2,
              backdropFilter: "blur(10px)",
              boxShadow: UI.shadow,
            }}
          >
            <CardContent sx={{ p: 2.25 }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 950, color: UI.text }}>
                  Actions
                </Typography>
                <Button
                  variant="contained"
                  disabled={!canCharge}
                  startIcon={<ElectricBoltIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    background: canCharge ? UI.brandGradStrong : UI.brandGradDisabled,
                    color: "white",
                    boxShadow: "0 14px 40px rgba(124,92,255,0.14)",
                  }}
                  onClick={handleChargingAction}
                >
                  {chargingActionLabel}
                </Button>
                {!isAuthenticated ? (
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    Log in to buy a ticket and start charging.
                  </Typography>
                ) : !ticket ? (
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    Buy a ticket to start charging.
                  </Typography>
                ) : null}
                {activeCar && isCompatible === false ? (
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    Not compatible with your car's connector types.
                  </Typography>
                ) : null}

                <Button
                  variant="outlined"
                  onClick={openGoogleMaps}
                  startIcon={<LaunchIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                  }}
                >
                  Open in Google Maps
                </Button>

                <Divider sx={{ borderColor: UI.border2 }} />

                <Stack spacing={0.75}>
                  <Typography
                    variant="caption"
                    sx={{ color: UI.text3, fontWeight: 750 }}
                  >
                    Charging status
                  </Typography>
                  {loading || !station ? (
                    <Skeleton variant="rounded" height={44} />
                  ) : (
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 3,
                        border: `1px solid ${UI.border2}`,
                        backgroundColor: "rgba(10,10,16,0.02)",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            backgroundColor: statusColor(
                              station.status as Availability
                            ),
                            boxShadow: "0 8px 18px rgba(10,10,16,0.14)",
                            border: "1px solid rgba(255,255,255,0.95)",
                          }}
                        />
                        <Typography sx={{ fontWeight: 900, color: UI.text }}>
                          {statusLabel(station.status as Availability)}
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Typography
                          variant="caption"
                          sx={{ color: UI.text3, fontWeight: 750 }}
                        >
                          {minutesAgo(station.lastUpdatedISO)}m
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {!loading && station?.status !== "AVAILABLE" ? (
                    <Typography variant="body2" sx={{ color: UI.text2 }}>
                      {station.status === "BUSY"
                        ? "All ports are currently in use. You can still navigate here and queue."
                        : "This station is currently offline. Use “Open in Google Maps” for alternatives."}
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <SectionCard
            title="Pricing"
            subtitle="Estimated cost info (may vary by operator)"
          >
            {loading || !station ? (
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={18} />
                <Skeleton variant="rounded" height={18} />
                <Skeleton variant="rounded" height={18} />
              </Stack>
            ) : (
              <Stack spacing={1.25}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    border: `1px solid ${UI.border2}`,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="caption" sx={{ color: UI.text3 }}>
                        Charging ticket
                      </Typography>
                      {ticket ? (
                        <Chip
                          size="small"
                          label="Ready"
                          sx={{
                            borderRadius: 999,
                            backgroundColor: "rgba(0,229,255,0.12)",
                            border: "1px solid rgba(0,229,255,0.3)",
                            color: UI.text,
                            fontWeight: 800,
                          }}
                        />
                      ) : null}
                    </Stack>

                    <Typography sx={{ fontWeight: 900, color: UI.text }}>
                      {ticket ? ticket.priceLabel : ticketPriceLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ color: UI.text2 }}>
                      {ticket
                        ? `Paid with ${ticket.methodLabel}`
                        : `Estimated ${ticketKwh} kWh pack`}
                    </Typography>
                    <Button
                      variant={ticket ? "outlined" : "contained"}
                      onClick={handlePaymentOpen}
                      disabled={!station}
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        borderColor: UI.border,
                        color: ticket ? UI.text : "white",
                        background: ticket ? "transparent" : UI.brandGradStrong,
                      }}
                    >
                      {paymentActionLabel}
                    </Button>
                  </Stack>
                </Box>
                <Divider sx={{ borderColor: UI.border2 }} />
                <InfoRow
                  label="Per kWh"
                  value={
                    station.pricing.perKwh
                      ? formatCurrency(
                          station.pricing.currency,
                          station.pricing.perKwh
                        )
                      : "—"
                  }
                />
                <InfoRow
                  label="Per minute"
                  value={
                    station.pricing.perMinute
                      ? formatCurrency(
                          station.pricing.currency,
                          station.pricing.perMinute
                        )
                      : "—"
                  }
                />
                <InfoRow
                  label="Parking"
                  value={station.pricing.parkingFee ?? "—"}
                />
              </Stack>
            )}
          </SectionCard>

          <SectionCard
            title="Coordinates"
            subtitle="For debugging and precise navigation"
          >
            {loading || !station ? (
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={18} />
                <Skeleton variant="rounded" height={18} />
              </Stack>
            ) : (
              <Stack spacing={1.1}>
                <InfoRow label="Latitude" value={station.lat.toFixed(5)} />
                <InfoRow label="Longitude" value={station.lng.toFixed(5)} />
              </Stack>
            )}
          </SectionCard>
        </Stack>
      </Box>

      {/* Payment dialog */}
      <Dialog
        open={paymentOpen && isAuthenticated}
        onClose={() => setPaymentOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: UI.surface,
            border: `1px solid ${UI.border}`,
            color: UI.text,
            boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Charging ticket</DialogTitle>
        <DialogContent dividers sx={{ borderColor: UI.border2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              Choose a payment method for a {ticketKwh} kWh ticket.
            </Typography>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 3,
                border: `1px solid ${UI.border2}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  Total
                </Typography>
                <Typography sx={{ fontWeight: 900, color: UI.text }}>
                  {ticketPriceLabel}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                Price based on station rate.
              </Typography>
            </Box>
            <RadioGroup
              value={selectedPaymentId}
              onChange={(event) => setSelectedPaymentId(event.target.value)}
              sx={{ gap: 1 }}
            >
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPaymentId === method.id;
                return (
                  <Box
                    key={method.id}
                    sx={{
                      p: 1.25,
                      borderRadius: 3,
                      border: `1px solid ${
                        isSelected ? "rgba(0,229,255,0.35)" : UI.border2
                      }`,
                      backgroundColor: isSelected
                        ? "rgba(0,229,255,0.08)"
                        : "rgba(10,10,16,0.02)",
                    }}
                  >
                    <FormControlLabel
                      value={method.id}
                      control={
                        <Radio
                          sx={{
                            color: UI.text3,
                            "&.Mui-checked": { color: UI.text },
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: UI.text }}>
                            {method.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: UI.text3 }}>
                            {method.helper}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </Box>
                );
              })}
            </RadioGroup>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setPaymentOpen(false)}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: UI.border,
              color: UI.text,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBuyTicket}
            disabled={!station || !isAuthenticated}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: UI.brandGradStrong,
              color: "white",
            }}
          >
            {ticket ? "Update payment" : "Buy ticket"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Charging dialog */}
      <Dialog
        open={chargingOpen}
        onClose={handleCloseCharging}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: UI.surface,
            border: `1px solid ${UI.border}`,
            color: UI.text,
            boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>
          {chargingStatus === "done"
            ? "Charging complete"
            : "Charging in progress"}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: UI.border2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              {chargingStatus === "done"
                ? "Session complete. You can unplug when it is safe."
                : "Keep the connector plugged in while we deliver your ticket."}
            </Typography>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px solid ${UI.border2}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={{ fontWeight: 900, color: UI.text }}>
                    {chargingProgress}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: UI.text2 }}>
                    {deliveredKwh} / {ticketKwh} kWh
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={chargingProgress}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: "rgba(10,10,16,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      background: UI.brandGradStrong,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  {chargingStatus === "done"
                    ? "Charging complete."
                    : `Estimated time remaining: ${remainingMinutes} min`}
                </Typography>
              </Stack>
            </Box>
            {ticket ? (
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 3,
                  border: `1px dashed ${UI.border}`,
                  backgroundColor: "rgba(10,10,16,0.02)",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    Ticket ID
                  </Typography>
                  <Chip
                    size="small"
                    label={ticket.id}
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(10,10,16,0.04)",
                      border: `1px solid ${UI.border2}`,
                      color: UI.text,
                      fontWeight: 800,
                    }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: UI.text2, mt: 0.75 }}>
                  Paid with {ticket.methodLabel}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {chargingStatus === "charging" ? (
            <>
              <Button
                variant="outlined"
                onClick={handleStopCharging}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: UI.text,
                }}
              >
                Stop charging
              </Button>
              <Button
                variant="contained"
                onClick={handleCloseCharging}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  background: UI.brandGradStrong,
                  color: "white",
                }}
              >
                Hide
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleCloseCharging}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                background: UI.brandGradStrong,
                color: "white",
              }}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Report dialog */}
      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: UI.surface,
            border: `1px solid ${UI.border}`,
            color: UI.text,
            boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Report an issue</DialogTitle>
        <DialogContent dividers sx={{ borderColor: UI.border2 }}>
          <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              Help improve data quality — your report will update station trust.
            </Typography>
            <TextField
              select
              label="Issue type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              fullWidth
            >
              {[
                "Broken connector",
                "Occupied but shown available",
                "Payment problem",
                "Station offline",
                "Other",
              ].map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Notes (optional)"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              placeholder="Example: CCS2 #2 not working, error code 14"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setReportOpen(false)}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: UI.border,
              color: UI.text,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitReport}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: UI.brandGradStrong,
              color: "white",
            }}
          >
            Submit report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share fallback dialog */}
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: UI.surface,
            border: `1px solid ${UI.border}`,
            color: UI.text,
            boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Share</DialogTitle>
        <DialogContent dividers sx={{ borderColor: UI.border2 }}>
          <Typography variant="body2" sx={{ color: UI.text2 }}>
            Your browser doesn’t support native share here. Copy the details
            manually.
          </Typography>
          <Box
            sx={{
              mt: 1.25,
              p: 1.5,
              borderRadius: 3,
              border: `1px dashed ${UI.border}`,
              backgroundColor: "rgba(10,10,16,0.02)",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>
              {station?.name ?? "—"}
            </Typography>
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              {station?.address ?? "—"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setShareOpen(false)}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: UI.brandGradStrong,
              color: "white",
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
