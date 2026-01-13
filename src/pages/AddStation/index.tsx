import { useEffect, useRef, useState, type FormEvent } from "react";
import { Box, Stack } from "@mui/material";
import { useActionData, useNavigate, useNavigation } from "react-router";
import { reverseGeocode } from "../../api/geocode";
import { UI } from "../../theme/theme";
import type { Availability, ConnectorType } from "../../models/model";
import { useGeoLocation } from "../../hooks/geolocation-hook";
import { CONNECTOR_OPTIONS } from "../MainPage/constants";
import type { AddStationActionData } from "./types";
import StationHeader from "./components/StationHeader";
import StationFormCard, {
  StationConnectorDraft,
  StationFormValues,
  StationPhotoDraft,
} from "./components/StationFormCard";

export { addStationAction } from "./addStationRoute";

const DEFAULT_CONNECTOR = (connectorType: ConnectorType): StationConnectorDraft => ({
  id: `connector-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  type: connectorType,
  powerKW: "50",
  ports: "2",
  availablePorts: "2",
});

const DEFAULT_PHOTO = (): StationPhotoDraft => ({
  id: `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  label: "",
  gradient: "",
});

// Add station page container that wires form state and layout components.
export default function AddStationPage() {
  const navigate = useNavigate();
  const actionData = useActionData() as AddStationActionData | undefined;
  const navigation = useNavigation();
  const geo = useGeoLocation();
  const [useMyLocation, setUseMyLocation] = useState(false);

  const defaultConnectorType = CONNECTOR_OPTIONS[0] ?? "CCS2";

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Availability>("AVAILABLE");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [connectors, setConnectors] = useState<StationConnectorDraft[]>([
    DEFAULT_CONNECTOR(defaultConnectorType),
  ]);
  const [pricing, setPricing] = useState({
    currency: "IDR",
    perKwh: "",
    perMinute: "",
    parkingFee: "",
  });
  const [amenities, setAmenities] = useState("");
  const [photos, setPhotos] = useState<StationPhotoDraft[]>([DEFAULT_PHOTO()]);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [addressLookupError, setAddressLookupError] = useState<string | null>(
    null
  );
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const addressLookupAbort = useRef<AbortController | null>(null);
  const addressLookupId = useRef(0);

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
    setConnectors((prev) => [...prev, DEFAULT_CONNECTOR(defaultConnectorType)]);
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
          <StationHeader />
          <StationFormCard
            values={formValues}
            handlers={formHandlers}
            connectorOptions={CONNECTOR_OPTIONS}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin")}
            submitLabel="Create station"
            submittingLabel="Creating..."
            locationCenter={mapCenter}
            onPickLocation={handlePickLocation}
            onRequestLocation={handleRequestLocation}
            locationLoading={geo.loading}
            addressLookupLoading={addressLookupLoading}
            locationError={addressLookupError || geo.error || null}
          />
        </Stack>
      </Box>
    </Box>
  );
}
