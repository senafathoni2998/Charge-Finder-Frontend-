import { Box, Stack, Typography } from "@mui/material";
import { useRef } from "react";
import LegendRow from "./LegendRow";
import MapGrid from "./MapGrid";
import MarkerDot from "./MarkedDot";
import { UI } from "../../theme/theme";
import { normalizeToCanvas, statusColor } from "./utils/canvasFunc";

export default function MapCanvas({ stations, bounds, selectedId, onSelect, userLoc }) {
  const containerRef = useRef(null);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(900px 520px at 20% 10%, rgba(124,92,255,0.10), rgba(255,255,255,0) 60%),\n           radial-gradient(900px 520px at 70% 70%, rgba(0,229,255,0.08), rgba(255,255,255,0) 60%),\n           linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))",
        border: `1px solid ${UI.border2}`,
        borderRadius: 0,
      }}
    >
      <MapGrid />

      {/* Markers */}
      {stations.map((s) => {
        const p = normalizeToCanvas(s.lat, s.lng, bounds);
        return (
          <MarkerDot
            key={s.id}
            x={p.x}
            y={p.y}
            color={statusColor(s.status)}
            active={selectedId === s.id}
            label={`${s.name} • ${s.status}`}
            onClick={() => onSelect(s.id)}
          />
        );
      })}

      {userLoc && (
        <MarkerDot
          x={normalizeToCanvas(userLoc.lat, userLoc.lng, bounds).x}
          y={normalizeToCanvas(userLoc.lat, userLoc.lng, bounds).y}
          color="rgba(124,92,255,0.98)"
          active={false}
          label="Your location"
          onClick={() => {}}
        />
      )}

      {/* Legend */}
      <Box
        sx={{
          position: "absolute",
          left: 12,
          bottom: 12,
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