import { useEffect } from "react";
import { Box } from "@mui/material";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { UI } from "../../../theme/theme";
import "leaflet/dist/leaflet.css";

type LocationPoint = {
  lat: number;
  lng: number;
};

type LocationPickerMapProps = {
  center: LocationPoint;
  selected?: LocationPoint | null;
  onPick?: (lat: number, lng: number) => void;
};

const toLatLng = (point: LocationPoint): [number, number] => [
  point.lat,
  point.lng,
];

function LocationUpdater({
  center,
  selected,
}: {
  center: LocationPoint;
  selected?: LocationPoint | null;
}) {
  const map = useMap();

  useEffect(() => {
    const target = selected ?? center;
    map.setView(toLatLng(target), map.getZoom(), { animate: false });
  }, [center, map, selected]);

  return null;
}

function LocationClickHandler({
  onPick,
}: {
  onPick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick?.(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// Renders an interactive map for selecting station coordinates.
export default function LocationPickerMap({
  center,
  selected,
  onPick,
}: LocationPickerMapProps) {
  const initial = selected ?? center;

  return (
    <Box
      sx={{
        height: 240,
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${UI.border2}`,
        "& .leaflet-container": {
          height: "100%",
          width: "100%",
        },
      }}
    >
      <MapContainer center={toLatLng(initial)} zoom={selected ? 13 : 11}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationUpdater center={center} selected={selected} />
        <LocationClickHandler onPick={onPick} />
        {selected ? (
          <CircleMarker
            center={toLatLng(selected)}
            radius={8}
            pathOptions={{
              color: "rgba(124,92,255,0.9)",
              fillColor: "rgba(124,92,255,0.9)",
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        ) : null}
      </MapContainer>
    </Box>
  );
}
