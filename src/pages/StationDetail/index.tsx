import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { UI } from "../../theme/theme";
import { fetchStations } from "../../api/stations";
import { useGeoLocation } from "../../hooks/geolocation-hook";
import { haversineKm } from "../../utils/distance";
import { useAppSelector } from "../../app/hooks";
import {
  PAYMENT_METHODS,
  REPORT_ISSUE_TYPES,
  TICKET_KWH,
  TOTAL_CHARGE_MINUTES,
} from "./constants";
import { buildMapsUrl, getSharePayload, getTicketPriceLabel } from "./utils";
import type { ChargingStatus, Station, Ticket } from "./types";
import StationOverviewSection from "./components/StationOverviewSection";
import ConnectorsSection from "./components/ConnectorsSection";
import AmenitiesSection from "./components/AmenitiesSection";
import ActionsCard from "./components/ActionsCard";
import PricingSection from "./components/PricingSection";
import CoordinatesSection from "./components/CoordinatesSection";
import PaymentDialog from "./components/PaymentDialog";
import ChargingDialog from "./components/ChargingDialog";
import ReportDialog from "./components/ReportDialog";
import ShareDialog from "./components/ShareDialog";

/**
 * ChargeFinder - Station Detail Page (Canvas-safe) - LIGHT MODE
 *
 * Canvas notes:
 * - No react-router required.
 * - No Leaflet.
 * - Uses safe browser-only actions.
 */

export default function StationDetailPage() {
  const isMdUp = useMediaQuery("(min-width:900px)", {
    noSsr: true,
    defaultMatches: true,
  });

  const { id: stationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);

  // Demo selector for canvas. In your app, stationId will come from route params.
  //   const [stationId, setStationId] = useState("st-001");
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportType, setReportType] = useState(REPORT_ISSUE_TYPES[0]);
  const [reportNote, setReportNote] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    PAYMENT_METHODS[0].id
  );
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [chargingOpen, setChargingOpen] = useState(false);
  const [chargingProgress, setChargingProgress] = useState(0);
  const [chargingStatus, setChargingStatus] = useState<ChargingStatus>("idle");

  const geo = useGeoLocation();
  const userCenter = geo.loc ?? { lat: -6.2, lng: 106.8167 };

  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<Station | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      setStation(null);
      setLoading(false);
      setLoadError("Station ID is missing.");
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadStation = async () => {
      setLoading(true);
      setLoadError(null);
      const result = await fetchStations(controller.signal);
      if (!active) return;
      if (!result.ok) {
        setStation(null);
        setLoadError(result.error || "Could not load station data.");
        setLoading(false);
        return;
      }
      const match = result.stations.find((s) => s.id === stationId) ?? null;
      if (!match) {
        setLoadError("Station not found.");
      }
      setStation(match);
      setLoading(false);
    };

    loadStation();
    return () => {
      active = false;
      controller.abort();
    };
  }, [stationId]);

  console.log("Station detail for ID:", stationId, station);

  const selectedPayment = useMemo(
    () =>
      PAYMENT_METHODS.find((method) => method.id === selectedPaymentId) ??
      PAYMENT_METHODS[0],
    [selectedPaymentId]
  );

  const ticketPriceLabel = getTicketPriceLabel(station, TICKET_KWH);
  const remainingMinutes = Math.max(
    0,
    Math.ceil(((100 - chargingProgress) / 100) * TOTAL_CHARGE_MINUTES)
  );
  const deliveredKwh = Math.round((TICKET_KWH * chargingProgress) / 100);

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

  // Redirects unauthenticated users to login while preserving return path.
  const handleLoginRedirect = () => {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    navigate(`/login?next=${next}`);
  };

  // Creates a charging ticket for the selected payment method.
  const handleBuyTicket = () => {
    if (!station || !isAuthenticated) return;
    const ticketId = `TICKET-${Date.now()}`;
    setTicket({
      id: ticketId,
      methodId: selectedPayment.id,
      methodLabel: selectedPayment.label,
      priceLabel: ticketPriceLabel,
      purchasedAt: new Date().toISOString(),
    });
    setPaymentOpen(false);
  };

  // Starts the charging progress simulation.
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

  // Opens the payment dialog or redirects to login if needed.
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
    window.open(buildMapsUrl(station.lat, station.lng), "_blank", "noopener,noreferrer");
  };

  const share = async () => {
    if (!station) return;
    const payload = getSharePayload(station);

    try {
      // Prefer native share.
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(payload);
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

  if (!loading && !station) {
    return (
      <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            maxWidth: 720,
            mx: "auto",
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: UI.border2,
              background: UI.surface,
              boxShadow: UI.shadow,
            }}
          >
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: 22 }}>
                  Station unavailable
                </Typography>
                <Typography sx={{ color: UI.text2 }}>
                  {loadError || "We couldn't load this station right now."}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                    alignSelf: "flex-start",
                  }}
                >
                  Back to map
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

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
        <Stack spacing={2}>
          <StationOverviewSection
            loading={loading}
            station={station}
            activeCar={activeCar}
            isCompatible={isCompatible}
            distanceKm={distanceKm}
            onReportIssue={() => setReportOpen(true)}
          />
          <ConnectorsSection loading={loading} station={station} />
          <AmenitiesSection loading={loading} station={station} />
        </Stack>

        <Stack spacing={2}>
          <ActionsCard
            loading={loading}
            station={station}
            isAuthenticated={isAuthenticated}
            hasTicket={!!ticket}
            activeCar={activeCar}
            isCompatible={isCompatible}
            canCharge={canCharge}
            chargingActionLabel={chargingActionLabel}
            onChargingAction={handleChargingAction}
            onOpenMaps={openGoogleMaps}
          />
          <PricingSection
            loading={loading}
            station={station}
            ticket={ticket}
            ticketPriceLabel={ticketPriceLabel}
            ticketKwh={TICKET_KWH}
            paymentActionLabel={paymentActionLabel}
            onPaymentOpen={handlePaymentOpen}
          />
          <CoordinatesSection loading={loading} station={station} />
        </Stack>
      </Box>

      <PaymentDialog
        open={paymentOpen && isAuthenticated}
        onClose={() => setPaymentOpen(false)}
        ticketKwh={TICKET_KWH}
        ticketPriceLabel={ticketPriceLabel}
        selectedPaymentId={selectedPaymentId}
        onPaymentChange={setSelectedPaymentId}
        paymentMethods={PAYMENT_METHODS}
        onConfirm={handleBuyTicket}
        canSubmit={!!station && isAuthenticated}
        hasTicket={!!ticket}
      />

      <ChargingDialog
        open={chargingOpen}
        onClose={handleCloseCharging}
        onStop={handleStopCharging}
        chargingStatus={chargingStatus}
        chargingProgress={chargingProgress}
        ticket={ticket}
        ticketKwh={TICKET_KWH}
        deliveredKwh={deliveredKwh}
        remainingMinutes={remainingMinutes}
      />

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reportType={reportType}
        reportNote={reportNote}
        onReportTypeChange={setReportType}
        onReportNoteChange={setReportNote}
        onSubmit={submitReport}
        issueTypes={REPORT_ISSUE_TYPES}
      />

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        station={station}
      />
    </Box>
  );
}
