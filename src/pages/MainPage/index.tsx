import { useEffect, useMemo, useState } from "react";
// NOTE: This page uses react-router for navigation in the full app.
import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import { fetchStationById, fetchStations } from "../../api/stations";
import { UI } from "../../theme/theme";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setMdMode, setSidebarOpen } from "../../features/app/appSlice";
import { setActiveCar } from "../../features/auth/authSlice";
import { boundsFromStations, filterStations } from "../../utils/distance";
import { useGeoLocation } from "../../hooks/geolocation-hook";
import type { ConnectorType } from "../../models/model";
import type { FilterStatus, Station, StationWithDistance } from "./types";
import { persistActiveCarId } from "./mainPageStorage";
import { buildMapsUrl } from "./utils";
import { DRAWER_WIDTH } from "./constants";
import FiltersPanel from "./components/FiltersPanel";
import MapPanel from "./components/MapPanel";

const CHARGING_STATION_REFRESH_MS = 60000;
const STATION_RADIUS_KM = 5;

export default function MainPage() {
  // Filters are local state (canvas-safe). In your real app, sync them to URL query.
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<FilterStatus>("");
  const [connectorSet, setConnectorSet] = useState<Set<ConnectorType>>(
    new Set()
  );
  const [minKW, setMinKW] = useState(0);
  const [useCarFilter, setUseCarFilter] = useState(false);
  const [carFilterTouched, setCarFilterTouched] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);

  const drawerOpen = useAppSelector((state) => state.app.isSidebarOpen);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);

  // SSR-safe: prevents MUI from touching matchMedia during non-browser rendering.
  const isMdUp = useMediaQuery("(min-width:900px)", {
    noSsr: true,
    defaultMatches: true,
  });

  useEffect(() => {
    dispatch(setMdMode(isMdUp));
  }, [dispatch, isMdUp]);

  const geo = useGeoLocation();
  const userCenter = geo.loc ?? { lat: -6.2, lng: 106.8167 };

  useEffect(() => {
    geo.request();
  }, [geo.request]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadStations = async () => {
      const result = await fetchStations({
        signal: controller.signal,
        lat: userCenter.lat,
        lng: userCenter.lng,
        radiusKm: STATION_RADIUS_KM,
      });
      if (!active) return;
      setStations(result.ok ? result.stations : []);
    };

    loadStations();
    return () => {
      active = false;
      controller.abort();
    };
  }, [geo.requestId, userCenter.lat, userCenter.lng]);
  const activeCar = useMemo(() => {
    if (!isAuthenticated) return null;
    return cars.find((c) => c.id === activeCarId) ?? null;
  }, [cars, activeCarId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !activeCar || !activeCar.connectorTypes.length) {
      setUseCarFilter(false);
      setCarFilterTouched(false);
      return;
    }
    if (!carFilterTouched) setUseCarFilter(true);
  }, [activeCar, carFilterTouched, isAuthenticated]);

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

  const filtered = useMemo<StationWithDistance[]>(() => {
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

  const selectedStation = useMemo(
    () => filtered.find((station) => station.id === selectedId) || null,
    [filtered, selectedId]
  );

  const bounds = useMemo(
    () => boundsFromStations(filtered.length ? filtered : stations),
    [filtered, stations]
  );
  const activeChargingStationId = useMemo(
    () => stations.find((station) => station.isChargingHere)?.id ?? null,
    [stations]
  );

  useEffect(() => {
    if (!activeChargingStationId) return;
    let active = true;
    let controller: AbortController | null = null;
    let isLoading = false;

    const refreshChargingStation = async () => {
      if (isLoading) return;
      isLoading = true;
      const nextController = new AbortController();
      controller = nextController;
      const result = await fetchStationById(
        activeChargingStationId,
        nextController.signal
      );
      if (!active) return;
      if (result.ok && result.station) {
        setStations((prev) =>
          prev.map((station) =>
            station.id === result.station?.id ? result.station : station
          )
        );
      }
      isLoading = false;
    };

    refreshChargingStation();
    const intervalId = window.setInterval(
      refreshChargingStation,
      CHARGING_STATION_REFRESH_MS
    );
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, [activeChargingStationId]);

  const handleFocusStation = (station: StationWithDistance) => {
    setSelectedId(station.id);
  };

  const handleSelectCar = (carId: string) => {
    if (!carId) return;
    dispatch(setActiveCar(carId));
    persistActiveCarId(carId);
  };

  useEffect(() => {
    if (useCarFilter && !activeCar) {
      setUseCarFilter(false);
    } else if (useCarFilter && activeCar && !activeCar.connectorTypes.length) {
      setUseCarFilter(false);
    } else if (useCarFilter && activeCar) {
      setConnectorSet(new Set(activeCar.connectorTypes));
      setMinKW(activeCar.minKW || 0);
    }
  }, [useCarFilter, activeCar]);

  const handleToggleUseCarFilter = (checked: boolean) => {
    setUseCarFilter(checked);
    setCarFilterTouched(true);
  };

  const handleToggleConnector = (connector: ConnectorType) => {
    setConnectorSet((prev) => {
      const next = new Set(prev);
      if (next.has(connector)) next.delete(connector);
      else next.add(connector);
      return next;
    });
  };

  const handleLogin = () => {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    navigate(`/login?next=${next}`);
  };

  const handleAddCar = () => {
    navigate("/profile/cars/new");
  };

  const handleRequestLocation = () => {
    geo.request();
    if (!isMdUp) dispatch(setSidebarOpen(true));
  };

  const openGoogleMaps = (station: StationWithDistance) => {
    if (typeof window === "undefined") return;
    const url = buildMapsUrl(station.lat, station.lng);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
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
          <FiltersPanel
            query={q}
            status={status}
            connectorSet={connectorSet}
            minKW={minKW}
            effectiveMinKW={effectiveMinKW}
            useCarFilter={useCarFilter}
            isAuthenticated={isAuthenticated}
            activeCarId={activeCarId}
            activeCar={activeCar}
            cars={cars}
            stations={filtered}
            selectedId={selectedId}
            onQueryChange={setQ}
            onStatusChange={setStatus}
            onToggleConnector={handleToggleConnector}
            onMinKWChange={setMinKW}
            onSelectCar={handleSelectCar}
            onToggleUseCarFilter={handleToggleUseCarFilter}
            onLogin={handleLogin}
            onAddCar={handleAddCar}
            onFocusStation={handleFocusStation}
          />
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
          <FiltersPanel
            query={q}
            status={status}
            connectorSet={connectorSet}
            minKW={minKW}
            effectiveMinKW={effectiveMinKW}
            useCarFilter={useCarFilter}
            isAuthenticated={isAuthenticated}
            activeCarId={activeCarId}
            activeCar={activeCar}
            cars={cars}
            stations={filtered}
            selectedId={selectedId}
            onQueryChange={setQ}
            onStatusChange={setStatus}
            onToggleConnector={handleToggleConnector}
            onMinKWChange={setMinKW}
            onSelectCar={handleSelectCar}
            onToggleUseCarFilter={handleToggleUseCarFilter}
            onLogin={handleLogin}
            onAddCar={handleAddCar}
            onFocusStation={handleFocusStation}
          />
        </Drawer>
      )}

      <MapPanel
        stations={filtered}
        bounds={bounds}
        selectedId={selectedId}
        onSelectStation={setSelectedId}
        userLoc={geo.loc}
        selectedStation={selectedStation}
        onViewDetails={(stationId) => navigate(`/station/${stationId}`)}
        onOpenMaps={openGoogleMaps}
        isMdUp={isMdUp}
        onRequestLocation={handleRequestLocation}
        locationLoading={geo.loading}
      />
    </Box>
  );
}
