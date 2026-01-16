import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { UI } from "../../theme/theme";
import { fetchStationById, fetchStations } from "../../api/stations";
import {
  completeChargingSession,
  startChargingSession,
} from "../../api/charging";
import {
  fetchActiveTicketForStation,
  requestChargingTicket,
} from "../../api/tickets";
import { useGeoLocation } from "../../hooks/geolocation-hook";
import { haversineKm } from "../../utils/distance";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import { clearAuthStorage } from "../Profile/profileStorage";
import {
  PAYMENT_METHODS,
  REPORT_ISSUE_TYPES,
  TICKET_KWH,
  TOTAL_CHARGE_MINUTES,
} from "./constants";
import { buildMapsUrl, getSharePayload, getTicketPriceLabel } from "./utils";
import type { ChargingStatus, Station, Ticket } from "./types";
import type { ConnectorType } from "../../models/model";
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
import { checkSessionStatus } from "../../utils/session";
import StartChargingDialog from "./components/StartChargingDialog";

const toCleanString = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

const toChargingStatus = (value: unknown): ChargingStatus | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "charging") return "charging";
  if (normalized === "done" || normalized === "completed") return "done";
  if (normalized === "idle") return "idle";
  return null;
};

const toProgressPercent = (value: unknown): number | null => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(100, Math.max(0, Math.round(num)));
};

const toDateMs = (value: unknown): number | null => {
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value > 1e12 ? value : value * 1000;
  }
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
};

// Builds the WebSocket URL for charging progress updates.
const buildChargingSocketUrl = (stationId: string): string | null => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  const query = `stationId=${encodeURIComponent(stationId)}`;

  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      const protocol = url.protocol === "https:" ? "wss" : "ws";
      return `${protocol}://${url.host}/ws/charging-progress?${query}`;
    } catch {
      return null;
    }
  }

  if (typeof window === "undefined") return null;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/charging-progress?${query}`;
};

const buildTicketFromServer = (
  payload: Record<string, unknown>,
  priceLabel: string
): Ticket => {
  const ticketId =
    toCleanString(payload.id ?? payload._id) || `TICKET-${Date.now()}`;
  const status = toCleanString(payload.status).toUpperCase();
  const purchasedAt =
    typeof payload.createdAt === "string"
      ? payload.createdAt
      : new Date().toISOString();
  const methodLabel = "ChargeFinder account";
  const chargingStatus =
    toChargingStatus(payload.chargingStatus) ??
    toChargingStatus(payload.charging_state) ??
    null;
  const progressPercent =
    toProgressPercent(payload.progressPercent) ??
    toProgressPercent(payload.progress_percent) ??
    null;
  const chargingStartedAt =
    typeof payload.chargingStartedAt === "string"
      ? payload.chargingStartedAt
      : typeof payload.charging_started_at === "string"
      ? payload.charging_started_at
      : undefined;
  const chargingUpdatedAt =
    typeof payload.chargingUpdatedAt === "string"
      ? payload.chargingUpdatedAt
      : typeof payload.charging_updated_at === "string"
      ? payload.charging_updated_at
      : undefined;
  const chargingCompletedAt =
    typeof payload.chargingCompletedAt === "string"
      ? payload.chargingCompletedAt
      : typeof payload.charging_completed_at === "string"
      ? payload.charging_completed_at
      : undefined;

  return {
    id: ticketId,
    methodId: status ? status.toLowerCase() : "ticket",
    methodLabel,
    priceLabel,
    purchasedAt,
    chargingStatus: chargingStatus ?? undefined,
    progressPercent: progressPercent ?? undefined,
    chargingStartedAt,
    chargingUpdatedAt,
    chargingCompletedAt,
  };
};

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
  const dispatch = useAppDispatch();
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
  const [ticketRequestError, setTicketRequestError] = useState<string | null>(
    null
  );
  const [ticketRequestLoading, setTicketRequestLoading] = useState(false);
  const [chargingOpen, setChargingOpen] = useState(false);
  const [chargingProgress, setChargingProgress] = useState(0);
  const [chargingStatus, setChargingStatus] = useState<ChargingStatus>("idle");
  const [chargingRequestLoading, setChargingRequestLoading] = useState(false);
  const [chargingRequestError, setChargingRequestError] = useState<
    string | null
  >(null);
  const [startChargingOpen, setStartChargingOpen] = useState(false);
  const [selectedConnectorType, setSelectedConnectorType] = useState<
    ConnectorType | null
  >(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    activeCarId ?? null
  );
  const [estimatedCompletionAt, setEstimatedCompletionAt] = useState<
    number | null
  >(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const chargingCompleteRequested = useRef(false);

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
  const estimatedRemainingMinutes = useMemo(() => {
    if (!estimatedCompletionAt) return null;
    const diffMs = estimatedCompletionAt - Date.now();
    if (!Number.isFinite(diffMs)) return null;
    return Math.max(0, Math.ceil(diffMs / 60000));
  }, [chargingProgress, chargingStatus, estimatedCompletionAt]);
  const deliveredKwh = Math.round((TICKET_KWH * chargingProgress) / 100);

  const distanceKm = useMemo(() => {
    if (!station) return null;
    return haversineKm(userCenter, { lat: station.lat, lng: station.lng });
  }, [station, userCenter]);

  const activeCar = useMemo(
    () => cars.find((c) => c.id === activeCarId) ?? null,
    [cars, activeCarId]
  );
  const activeStationId = station?.id ?? null;

  const preferredConnectorType = useMemo(() => {
    if (!station) return undefined;
    const stationConnectorTypes = station.connectors.map(
      (connector) => connector.type
    );
    if (!stationConnectorTypes.length) return undefined;
    if (activeCar?.connectorTypes?.length) {
      const match = activeCar.connectorTypes.find((type) =>
        stationConnectorTypes.includes(type)
      );
      if (match) return match;
    }
    return stationConnectorTypes[0];
  }, [station, activeCar]);
  const availableConnectorTypes = useMemo(() => {
    if (!station) return [];
    const types = station.connectors.map((connector) => connector.type);
    return Array.from(new Set(types));
  }, [station]);

  useEffect(() => {
    if (!availableConnectorTypes.length) {
      setSelectedConnectorType(null);
      return;
    }
    if (
      selectedConnectorType &&
      availableConnectorTypes.includes(selectedConnectorType)
    ) {
      return;
    }
    setSelectedConnectorType(
      preferredConnectorType ?? availableConnectorTypes[0]
    );
  }, [availableConnectorTypes, preferredConnectorType, selectedConnectorType]);

  useEffect(() => {
    if (!startChargingOpen) return;
    if (activeCarId && cars.some((car) => car.id === activeCarId)) {
      setSelectedVehicleId(activeCarId);
      return;
    }
    if (!cars.length) {
      setSelectedVehicleId(null);
      return;
    }
    setSelectedVehicleId(cars[0].id);
  }, [activeCarId, cars, startChargingOpen]);

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

  useEffect(() => {
    if (!activeStationId || !isAuthenticated) return;
    const controller = new AbortController();
    let active = true;

    const loadActiveTicket = async () => {
      const result = await fetchActiveTicketForStation(
        activeStationId,
        controller.signal
      );
      if (!active) return;
      if (!result.ok) return;

      if (!result.ticket) {
        setTicket(null);
        return;
      }

      const payload =
        result.ticket && typeof result.ticket === "object"
          ? (result.ticket as Record<string, unknown>)
          : {};

      const normalizedTicket = buildTicketFromServer(payload, ticketPriceLabel);
      setTicket(normalizedTicket);
    if (normalizedTicket.progressPercent != null) {
      setChargingProgress(normalizedTicket.progressPercent);
    }
    if (normalizedTicket.chargingStatus) {
      setChargingStatus(normalizedTicket.chargingStatus);
    }
  };

    loadActiveTicket();
    return () => {
      active = false;
      controller.abort();
    };
  }, [activeStationId, isAuthenticated, ticketPriceLabel]);

  // Redirects unauthenticated users to login while preserving return path.
  const handleLoginRedirect = () => {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    navigate(`/login?next=${next}`);
  };

  const invalidateSession = useCallback(
    (message: string | null) => {
      if (message) setSessionMessage(message);
      clearAuthStorage({ setLogoutRedirect: false });
      dispatch(logout());
    },
    [dispatch]
  );

  const ensureSessionValid = useCallback(() => {
    if (!isAuthenticated) return true;
    const result = checkSessionStatus();
    if (result.status === "valid") return true;
    invalidateSession(result.message);
    return false;
  }, [invalidateSession, isAuthenticated]);

  const refreshStation = useCallback(async () => {
    if (!stationId) return;
    const result = await fetchStationById(stationId);
    if (result.ok && result.station) {
      setStation(result.station);
    }
  }, [stationId]);

  // Creates a charging ticket for the selected payment method.
  const handleBuyTicket = async () => {
    if (!ensureSessionValid() || !station || !isAuthenticated) return;
    setTicketRequestError(null);
    setTicketRequestLoading(true);

    const result = await requestChargingTicket({
      stationId: station.id,
      connectorType: preferredConnectorType,
    });

    if (!result.ok) {
      setTicketRequestError(result.error || "Could not request ticket.");
      setTicketRequestLoading(false);
      return;
    }

    const payload = result.ticket ?? {};
    const payloadRecord =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {};
    const ticketId =
      toCleanString(payloadRecord.id ?? payloadRecord._id) ||
      `TICKET-${Date.now()}`;
    const purchasedAt =
      typeof payloadRecord.createdAt === "string"
        ? payloadRecord.createdAt
        : new Date().toISOString();

    setTicket({
      id: ticketId,
      methodId: selectedPayment.id,
      methodLabel: selectedPayment.label,
      priceLabel: ticketPriceLabel,
      purchasedAt,
    });
    setPaymentOpen(false);
    setTicketRequestLoading(false);
  };

  // Starts charging by calling the backend endpoint.
  const handleStartCharging = async (
    connectorType?: ConnectorType | null,
    vehicleId?: string | null
  ) => {
    if (!ensureSessionValid()) return;
    if (!canStartCharging || !station || chargingRequestLoading) return;
    setChargingRequestLoading(true);
    setChargingRequestError(null);

    const result = await startChargingSession({
      stationId: station.id,
      connectorType: connectorType ?? undefined,
      vehicleId: vehicleId ?? undefined,
    });
    if (!result.ok) {
      setChargingRequestError(result.error || "Could not start charging.");
      setChargingRequestLoading(false);
      return;
    }

    if (result.ticket && typeof result.ticket === "object") {
      const normalizedTicket = buildTicketFromServer(
        result.ticket as Record<string, unknown>,
        ticketPriceLabel
      );
      setTicket(normalizedTicket);
      if (normalizedTicket.progressPercent != null) {
        setChargingProgress(normalizedTicket.progressPercent);
      } else {
        setChargingProgress(0);
      }
      if (normalizedTicket.chargingStatus) {
        setChargingStatus(normalizedTicket.chargingStatus);
      } else {
        setChargingStatus("charging");
      }
    } else {
      setChargingProgress(0);
      setChargingStatus("charging");
    }

    chargingCompleteRequested.current = false;
    await refreshStation();
    setEstimatedCompletionAt(null);
    setChargingOpen(true);
    setChargingRequestLoading(false);
  };

  const handleChargingAction = () => {
    if (chargingStatus === "charging") {
      setChargingOpen(true);
      return;
    }
    if (!ensureSessionValid()) return;
    if (!availableConnectorTypes.length) {
      setChargingRequestError("No connectors available for this station.");
      return;
    }
    setChargingRequestError(null);
    setStartChargingOpen(true);
  };

  const handleConfirmStartCharging = async () => {
    if (!selectedConnectorType) return;
    setStartChargingOpen(false);
    await handleStartCharging(selectedConnectorType, selectedVehicleId);
  };

  // Opens the payment dialog or redirects to login if needed.
  const handlePaymentOpen = () => {
    if (!ensureSessionValid()) return;
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }
    setTicketRequestError(null);
    setPaymentOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentOpen(false);
    setTicketRequestError(null);
  };

  const handleCloseCharging = () => {
    setChargingOpen(false);
    if (chargingStatus === "done") {
      setChargingStatus("idle");
      setChargingProgress(0);
    }
  };

  // Stops charging by completing the active session.
  const handleStopCharging = async () => {
    if (!ensureSessionValid()) return;
    if (!station || chargingRequestLoading) return;
    setChargingRequestLoading(true);
    setChargingRequestError(null);

    const result = await completeChargingSession({ stationId: station.id });
    if (!result.ok) {
      setChargingRequestError(result.error || "Could not complete charging.");
      setChargingRequestLoading(false);
      return;
    }

    chargingCompleteRequested.current = true;
    setChargingOpen(false);
    setChargingStatus("done");
    setChargingProgress(100);
    setTicket(null);
    setEstimatedCompletionAt(null);
    await refreshStation();
    setChargingRequestLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) return;
    setPaymentOpen(false);
    setTicket(null);
    setTicketRequestError(null);
    setTicketRequestLoading(false);
    setChargingOpen(false);
    setChargingProgress(0);
    setChargingStatus("idle");
    setChargingRequestError(null);
    setChargingRequestLoading(false);
    setEstimatedCompletionAt(null);
    chargingCompleteRequested.current = false;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!stationId) return;
    const socketUrl = buildChargingSocketUrl(stationId);
    if (!socketUrl) return;

    const socket = new WebSocket(socketUrl);

    // Applies WebSocket payloads to charging state.
    const handleChargingPayload = (payload: Record<string, unknown>) => {
      const type = toCleanString(payload.type).toLowerCase();
      const ticketPayload =
        payload.ticket && typeof payload.ticket === "object"
          ? (payload.ticket as Record<string, unknown>)
          : null;
      const completedTicketPayload =
        payload.completedTicket && typeof payload.completedTicket === "object"
          ? (payload.completedTicket as Record<string, unknown>)
          : null;
      const progressFromPayload =
        toProgressPercent(payload.progressPercent) ??
        toProgressPercent(ticketPayload?.progressPercent) ??
        toProgressPercent(completedTicketPayload?.progressPercent) ??
        null;
      const estimatedCompletionMs =
        toDateMs(payload.estimatedCompletionAt) ??
        toDateMs(payload.estimateeedCompletionAt) ??
        toDateMs(payload.estimated_completion_at) ??
        toDateMs(ticketPayload?.estimatedCompletionAt) ??
        toDateMs(ticketPayload?.estimateeedCompletionAt) ??
        toDateMs(ticketPayload?.estimated_completion_at) ??
        null;

      if (type === "completed") {
        setChargingStatus("done");
        setChargingProgress(progressFromPayload ?? 100);
        setTicket(null);
        setEstimatedCompletionAt(null);
        chargingCompleteRequested.current = true;
        return;
      }

      if (type === "initial" && !ticketPayload) {
        setTicket(null);
        setChargingStatus("idle");
        setChargingProgress(0);
        setEstimatedCompletionAt(null);
        chargingCompleteRequested.current = false;
        return;
      }

      if (ticketPayload) {
        const normalizedTicket = buildTicketFromServer(
          ticketPayload,
          ticketPriceLabel
        );
        setTicket(normalizedTicket);
        if (normalizedTicket.progressPercent != null) {
          setChargingProgress(normalizedTicket.progressPercent);
        }
        if (normalizedTicket.chargingStatus) {
          setChargingStatus(normalizedTicket.chargingStatus);
        }
      }

      if (progressFromPayload != null) {
        setChargingProgress(progressFromPayload);
        if (progressFromPayload >= 100) {
          setChargingStatus("done");
          if (!chargingCompleteRequested.current) {
            chargingCompleteRequested.current = true;
            completeChargingSession({ stationId }).catch(() => {
              // ignore background completion errors
            });
          }
        }
      }

      if (estimatedCompletionMs != null) {
        setEstimatedCompletionAt(estimatedCompletionMs);
      }

      if (type === "started") {
        setChargingStatus("charging");
        setChargingOpen(true);
        chargingCompleteRequested.current = false;
      }

      if (type === "progress" && progressFromPayload != null) {
        setChargingStatus("charging");
      }
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as Record<string, unknown>;
        handleChargingPayload(payload);
      } catch {
        // ignore malformed WebSocket payloads
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    return () => {
      socket.close();
    };
  }, [stationId, ticketPriceLabel]);

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
            chargingError={chargingRequestError}
            chargingLoading={chargingRequestLoading}
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
        onClose={handleClosePayment}
        ticketKwh={TICKET_KWH}
        ticketPriceLabel={ticketPriceLabel}
        selectedPaymentId={selectedPaymentId}
        onPaymentChange={setSelectedPaymentId}
        paymentMethods={PAYMENT_METHODS}
        onConfirm={handleBuyTicket}
        canSubmit={!!station && isAuthenticated}
        hasTicket={!!ticket}
        submitError={ticketRequestError}
        isSubmitting={ticketRequestLoading}
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
        estimatedRemainingMinutes={estimatedRemainingMinutes}
      />

      <StartChargingDialog
        open={startChargingOpen}
        onClose={() => setStartChargingOpen(false)}
        connectorTypes={availableConnectorTypes}
        selectedConnectorType={selectedConnectorType}
        onConnectorChange={setSelectedConnectorType}
        vehicles={cars}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={setSelectedVehicleId}
        onConfirm={handleConfirmStartCharging}
        isSubmitting={chargingRequestLoading}
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

      <Snackbar
        open={!!sessionMessage}
        autoHideDuration={4000}
        onClose={() => setSessionMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSessionMessage(null)}
          severity="warning"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {sessionMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
