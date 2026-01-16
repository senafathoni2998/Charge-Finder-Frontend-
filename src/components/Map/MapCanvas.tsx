import { Box, Stack, Typography } from "@mui/material";
import { Fragment, useEffect, useMemo, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import LegendRow from "./LegendRow";
import { UI } from "../../theme/theme";
import { CHARGING_COLOR, statusColor } from "../../utils/map";
import "leaflet/dist/leaflet.css";

function FitBounds({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (
      !bounds ||
      !Number.isFinite(bounds.minLat) ||
      !Number.isFinite(bounds.minLng) ||
      !Number.isFinite(bounds.maxLat) ||
      !Number.isFinite(bounds.maxLng)
    )
      return;
    map.fitBounds(
      [
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng],
      ],
      { padding: [40, 40] }
    );
  }, [map, bounds]);

  return null;
}

function FocusStation({ selectedId, stations, zoom = 15 }) {
  const map = useMap();
  const lastIdRef = useRef(null);

  useEffect(() => {
    if (!selectedId) {
      lastIdRef.current = null;
      return;
    }
    if (lastIdRef.current === selectedId) return;
    const target = stations.find((s) => s.id === selectedId);
    if (!target) return;
    if (!Number.isFinite(target.lat) || !Number.isFinite(target.lng)) return;
    lastIdRef.current = selectedId;
    map.setView([target.lat, target.lng], Math.max(map.getZoom(), zoom), {
      animate: false,
    });
  }, [map, selectedId, stations, zoom]);

  return null;
}

export default function MapCanvas({
  stations = [],
  bounds,
  selectedId,
  onSelect,
  userLoc,
}) {
  const mapBounds = useMemo<LatLngBoundsExpression>(() => {
    if (
      !bounds ||
      !Number.isFinite(bounds.minLat) ||
      !Number.isFinite(bounds.minLng) ||
      !Number.isFinite(bounds.maxLat) ||
      !Number.isFinite(bounds.maxLng)
    ) {
      return [
        [0, 0],
        [0, 0],
      ];
    }
    return [
      [bounds.minLat, bounds.minLng],
      [bounds.maxLat, bounds.maxLng],
    ];
  }, [bounds]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        border: `1px solid ${UI.border2}`,
        borderRadius: 0,
        "& .leaflet-container": {
          height: "100%",
          width: "100%",
          fontFamily: "inherit",
        },
        "& .cf-marker-core, & .cf-user-core": {
          filter: "drop-shadow(0 6px 12px rgba(10,10,16,0.25))",
          transformBox: "fill-box",
          transformOrigin: "center",
          transition: "transform 140ms ease",
        },
        "& .cf-marker-core.is-active": {
          transform: "scale(1.08)",
        },
        "& .cf-marker-halo.is-active": {
          transformBox: "fill-box",
          transformOrigin: "center",
          animation: "cf-pulse 1.6s ease-out infinite",
        },
        "& .cf-user-halo": {
          transformBox: "fill-box",
          transformOrigin: "center",
          animation: "cf-user-pulse 2s ease-out infinite",
        },
        "& .cf-charging-halo": {
          transformBox: "fill-box",
          transformOrigin: "center",
          animation: "cf-charging-pulse 1.4s ease-out infinite",
        },
        "@keyframes cf-pulse": {
          "0%": { transform: "scale(1)", opacity: 0.7 },
          "70%": { transform: "scale(1.25)", opacity: 0.2 },
          "100%": { transform: "scale(1.32)", opacity: 0 },
        },
        "@keyframes cf-user-pulse": {
          "0%": { transform: "scale(1)", opacity: 0.6 },
          "70%": { transform: "scale(1.35)", opacity: 0.18 },
          "100%": { transform: "scale(1.45)", opacity: 0 },
        },
        "@keyframes cf-charging-pulse": {
          "0%": { transform: "scale(1)", opacity: 0.7 },
          "70%": { transform: "scale(1.4)", opacity: 0.2 },
          "100%": { transform: "scale(1.55)", opacity: 0 },
        },
      }}
    >
      <MapContainer bounds={mapBounds}>
        <TileLayer
          // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        <FocusStation selectedId={selectedId} stations={stations} />

        {stations.map((s) => {
          const isActive = selectedId === s.id;
          const isCharging = Boolean(s.isChargingHere);
          const color = statusColor(s.status, isCharging);
          return (
            <Fragment key={s.id}>
              {isCharging ? (
                <CircleMarker
                  center={[s.lat, s.lng]}
                  radius={isActive ? 22 : 18}
                  interactive={false}
                  pathOptions={{
                    color: CHARGING_COLOR,
                    fillColor: CHARGING_COLOR,
                    fillOpacity: 0.18,
                    weight: 2,
                    className: "cf-charging-halo",
                  }}
                />
              ) : null}
              <CircleMarker
                center={[s.lat, s.lng]}
                radius={isActive ? 18 : 14}
                interactive={false}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isActive ? 0.18 : 0.12,
                  weight: 0,
                  className: `cf-marker-halo ${isActive ? "is-active" : ""}`,
                }}
              />
              <CircleMarker
                center={[s.lat, s.lng]}
                radius={isActive ? 9 : 7}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: color,
                  fillOpacity: 0.95,
                  weight: 2,
                  className: `cf-marker-core ${isActive ? "is-active" : ""}`,
                }}
                eventHandlers={{
                  click: () => onSelect?.(s.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
                  {s.name} •{" "}
                  {isCharging ? `Charging • ${s.status}` : s.status}
                </Tooltip>
              </CircleMarker>
            </Fragment>
          );
        })}

        {userLoc && (
          <>
            <CircleMarker
              center={[userLoc.lat, userLoc.lng]}
              radius={16}
              interactive={false}
              pathOptions={{
                color: "rgba(124,92,255,0.9)",
                fillColor: "rgba(124,92,255,0.6)",
                fillOpacity: 0.12,
                weight: 2,
                className: "cf-user-halo",
              }}
            />
            <CircleMarker
              center={[userLoc.lat, userLoc.lng]}
              radius={6}
              pathOptions={{
                color: "#ffffff",
                fillColor: "rgba(124,92,255,0.98)",
                fillOpacity: 0.98,
                weight: 2,
                className: "cf-user-core",
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
                Your location
              </Tooltip>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      {/* Legend */}
      <Box
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 1000,
          p: 1.25,
          borderRadius: 3,
          border: `1px solid ${UI.border}`,
          backgroundColor: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 24px rgba(10,10,16,0.08)",
        }}
      >
        <Stack spacing={0.75}>
          <Typography sx={{ fontWeight: 950, fontSize: 13, color: UI.text }}>
            Map Explorer
          </Typography>
          <LegendRow label="Available" color="rgba(0,229,255,0.95)" />
          <LegendRow label="Busy" color="rgba(255,193,7,0.95)" />
          <LegendRow label="Offline" color="rgba(244,67,54,0.95)" />
          <LegendRow label="Charging" color={CHARGING_COLOR} />
          <LegendRow label="You" color="rgba(124,92,255,0.98)" />
        </Stack>
      </Box>

      {/* Hint overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            border: `1px solid ${UI.border}`,
            backgroundColor: "rgba(255,255,255,0.70)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 24px rgba(10,10,16,0.06)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: UI.text2, fontWeight: 650 }}
          >
            Click a marker to preview a station
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
