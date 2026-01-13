import { useEffect, useRef, useState, type FormEvent } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router";
import { reverseGeocode } from "../../api/geocode";
import { fetchStations } from "../../api/stations";
import { UI } from "../../theme/theme";
import type { Availability, ConnectorType, Station } from "../../models/model";
import { useGeoLocation } from "../../hooks/geolocation-hook";
import { CONNECTOR_OPTIONS } from "../MainPage/constants";
import type { EditStationActionData } from "./types";
import StationHeader from "../AddStation/components/StationHeader";
import StationFormCard, {
  StationConnectorDraft,
  StationFormValues,
  StationPhotoDraft,
} from "../AddStation/components/StationFormCard";

export { editStationAction } from "./editStationRoute";

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const DEFAULT_PHOTO = (): StationPhotoDraft => ({
  id: makeId("photo"),
  label: "",
  gradient: "",
});

// Edit station page container that wires form state and layout components.
export default function EditStationPage() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData() as EditStationActionData | undefined;
  const { stationId } = useParams();
  const geo = useGeoLocation();
  const [useMyLocation, setUseMyLocation] = useState(false);

  const defaultConnectorType = CONNECTOR_OPTIONS[0] ?? "CCS2";

  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Availability>("AVAILABLE");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [connectors, setConnectors] = useState<StationConnectorDraft[]>([]);
  const [pricing, setPricing] = useState({
    currency: "IDR",
    perKwh: "",
    perMinute: "",
    parkingFee: "",
  });
  const [amenities, setAmenities] = useState("");
  const [photos, setPhotos] = useState<StationPhotoDraft[]>([]);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [addressLookupError, setAddressLookupError] = useState<string | null>(
    null
  );
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const addressLookupAbort = useRef<AbortController | null>(null);
  const addressLookupId = useRef(0);

  useEffect(() => {
    if (!stationId) {
      setLoadError("Station ID is missing.");
      setLoading(false);
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
        setLoadError(result.error || "Could not load stations.");
        setLoading(false);
        return;
      }
      const match = result.stations.find((item) => item.id === stationId) ?? null;
      if (!match) {
        setStation(null);
        setLoadError("Station not found.");
        setLoading(false);
        return;
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

  useEffect(() => {
    if (!station) return;
    setName(station.name || "");
    setAddress(station.address || "");
    setStatus(station.status || "AVAILABLE");
    setLat(Number.isFinite(station.lat) ? String(station.lat) : "");
    setLng(Number.isFinite(station.lng) ? String(station.lng) : "");
    setConnectors(
      station.connectors?.length
        ? station.connectors.map((connector) => ({
            id: makeId("connector"),
            type: connector.type,
            powerKW: String(connector.powerKW ?? ""),
            ports: String(connector.ports ?? ""),
            availablePorts: String(connector.availablePorts ?? ""),
          }))
        : [
            {
              id: makeId("connector"),
              type: defaultConnectorType as ConnectorType,
              powerKW: "50",
              ports: "2",
              availablePorts: "2",
            },
          ]
    );
    setPricing({
      currency: station.pricing?.currency || "IDR",
      perKwh: station.pricing?.perKwh != null ? String(station.pricing.perKwh) : "",
      perMinute:
        station.pricing?.perMinute != null ? String(station.pricing.perMinute) : "",
      parkingFee: station.pricing?.parkingFee || "",
    });
    setAmenities(station.amenities?.join(", ") || "");
    setPhotos(
      station.photos?.length
        ? station.photos.map((photo) => ({
            id: makeId("photo"),
            label: photo.label || "",
            gradient: photo.gradient || "",
          }))
        : [DEFAULT_PHOTO()]
    );
    setNotes(station.notes || "");
  }, [defaultConnectorType, station]);

  useEffect(() => {
    if (!useMyLocation || !geo.loc) return;
    setLat(geo.loc.lat.toFixed(6));
    setLng(geo.loc.lng.toFixed(6));
    handlePickLocation(geo.loc.lat, geo.loc.lng);
    setUseMyLocation(false);
  }, [geo.loc, useMyLocation]);

  useEffect(() => {
    return () => {
      addressLookupAbort.current?.abort();
    };
  }, []);

  const handleSubmit = (event: FormEvent) => {
    if (!name.trim()) {
      event.preventDefault();
      setFormError("Station name is required.");
      return;
    }
    if (!address.trim()) {
      event.preventDefault();
      setFormError("Address is required.");
      return;
    }
    if (
      !lat.trim() ||
      !lng.trim() ||
      !Number.isFinite(Number(lat)) ||
      !Number.isFinite(Number(lng))
    ) {
      event.preventDefault();
      setFormError("Latitude and longitude must be valid numbers.");
      return;
    }
    const invalidConnector = connectors.some((connector) => {
      const power = Number(connector.powerKW);
      const ports = Number(connector.ports);
      const available = Number(connector.availablePorts);
      return (
        !connector.type ||
        !Number.isFinite(power) ||
        power <= 0 ||
        !Number.isFinite(ports) ||
        ports <= 0 ||
        !Number.isFinite(available) ||
        available < 0
      );
    });
    if (!connectors.length || invalidConnector) {
      event.preventDefault();
      setFormError("Add at least one valid connector entry.");
      return;
    }
    if (
      !pricing.currency.trim() ||
      !pricing.perKwh.trim() ||
      !Number.isFinite(Number(pricing.perKwh))
    ) {
      event.preventDefault();
      setFormError("Pricing currency and per kWh are required.");
      return;
    }
    if (formError) setFormError(null);
  };

  const handleConnectorChange = (
    id: string,
    field: keyof StationConnectorDraft,
    value: string
  ) => {
    setFormError(null);
    setConnectors((prev) =>
      prev.map((connector) =>
        connector.id === id ? { ...connector, [field]: value } : connector
      )
    );
  };

  const handleAddConnector = () => {
    setFormError(null);
    setConnectors((prev) => [
      ...prev,
      {
        id: makeId("connector"),
        type: defaultConnectorType as ConnectorType,
        powerKW: "50",
        ports: "2",
        availablePorts: "2",
      },
    ]);
  };

  const handleRemoveConnector = (id: string) => {
    setConnectors((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((connector) => connector.id !== id);
    });
  };

  const handlePhotoChange = (
    id: string,
    field: keyof StationPhotoDraft,
    value: string
  ) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, [field]: value } : photo))
    );
  };

  const handleAddPhoto = () => {
    setPhotos((prev) => [...prev, DEFAULT_PHOTO()]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const handleRequestLocation = () => {
    setUseMyLocation(true);
    geo.request();
  };

  const handlePickLocation = async (latValue: number, lngValue: number) => {
    addressLookupAbort.current?.abort();
    const controller = new AbortController();
    addressLookupAbort.current = controller;
    const lookupId = (addressLookupId.current += 1);
    setAddressLookupLoading(true);
    setAddressLookupError(null);

    const result = await reverseGeocode(latValue, lngValue, controller.signal);
    if (controller.signal.aborted || lookupId !== addressLookupId.current) {
      return;
    }
    setAddressLookupLoading(false);
    if (result.ok && result.address) {
      setAddress(result.address);
      return;
    }
    setAddressLookupError(result.error || "Could not resolve address.");
  };

  const submitError = formError || actionData?.error || null;
  const isSubmitting = navigation.state === "submitting";

  const formValues: StationFormValues = {
    name,
    address,
    status,
    lat,
    lng,
    connectors,
    pricing,
    amenities,
    photos,
    notes,
  };

  const latNum = lat.trim() ? Number(lat) : Number.NaN;
  const lngNum = lng.trim() ? Number(lng) : Number.NaN;
  const hasCoords = Number.isFinite(latNum) && Number.isFinite(lngNum);
  const mapCenter = hasCoords
    ? { lat: latNum, lng: lngNum }
    : geo.loc ?? { lat: -6.2, lng: 106.8167 };

  const formHandlers = {
    onNameChange: (value: string) => setName(value),
    onAddressChange: (value: string) => setAddress(value),
    onStatusChange: (value: Availability) => setStatus(value),
    onLatChange: (value: string) => setLat(value),
    onLngChange: (value: string) => setLng(value),
    onConnectorChange: handleConnectorChange,
    onAddConnector: handleAddConnector,
    onRemoveConnector: handleRemoveConnector,
    onPricingChange: (field: keyof typeof pricing, value: string) =>
      setPricing((prev) => ({ ...prev, [field]: value })),
    onAmenitiesChange: (value: string) => setAmenities(value),
    onPhotoChange: handlePhotoChange,
    onAddPhoto: handleAddPhoto,
    onRemovePhoto: handleRemovePhoto,
    onNotesChange: (value: string) => setNotes(value),
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "calc(100dvh - 64px)",
          backgroundColor: UI.bg,
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Stack spacing={2.5}>
            <StationHeader title="Edit station" subtitle="Loading station data..." />
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                Loading station details...
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (!station) {
    return (
      <Box
        sx={{
          minHeight: "calc(100dvh - 64px)",
          backgroundColor: UI.bg,
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Stack spacing={2.5}>
            <StationHeader
              title="Edit station"
              subtitle="Update station details and keep the network accurate."
            />
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                {loadError || "Station not found."}
              </Typography>
              <Typography sx={{ color: UI.text2, mt: 0.5 }}>
                Head back to the admin console to select another station.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin")}
                sx={{
                  mt: 1.5,
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: UI.text,
                  backgroundColor: "rgba(10,10,16,0.01)",
                }}
              >
                Back to admin
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Stack spacing={2.5}>
          <StationHeader
            title="Edit station"
            subtitle="Update station details and keep the network accurate."
          />
          <StationFormCard
            values={formValues}
            handlers={formHandlers}
            connectorOptions={CONNECTOR_OPTIONS}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin")}
            stationId={stationId}
            submitLabel="Update station"
            submittingLabel="Updating..."
            locationCenter={mapCenter}
            onRequestLocation={handleRequestLocation}
            onPickLocation={handlePickLocation}
            locationLoading={geo.loading}
            addressLookupLoading={addressLookupLoading}
            locationError={addressLookupError || geo.error || null}
          />
        </Stack>
      </Box>
    </Box>
  );
}
