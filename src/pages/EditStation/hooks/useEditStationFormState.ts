import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { reverseGeocode } from "../../../api/geocode";
import { useGeoLocation } from "../../../hooks/geolocation-hook";
import type { ConnectorType, Station } from "../../../models/model";
import type {
  StationConnectorDraft,
  StationFormValues,
  StationPhotoDraft,
} from "../../AddStation/components/StationFormCard";
import type { EditStationFormHandlers } from "../types";
import {
  buildEditStationDefaults,
  createDefaultConnector,
  createDefaultPhoto,
  getMapCenter,
  validateStationForm,
} from "../utils";

type EditStationFormState = {
  values: StationFormValues;
  handlers: EditStationFormHandlers;
  onSubmit: (event: FormEvent) => void;
  formError: string | null;
  locationCenter: { lat: number; lng: number };
  onRequestLocation: () => void;
  onPickLocation: (lat: number, lng: number) => void;
  addressLookupLoading: boolean;
  locationLoading: boolean;
  locationError: string | null;
};

// Manages edit-station form state, validation, and location lookups.
export default function useEditStationFormState(
  station: Station | null,
  defaultConnectorType: ConnectorType
): EditStationFormState {
  const geo = useGeoLocation();
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [values, setValues] = useState<StationFormValues>(() =>
    buildEditStationDefaults(station, defaultConnectorType)
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [addressLookupError, setAddressLookupError] = useState<string | null>(
    null
  );
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const addressLookupAbort = useRef<AbortController | null>(null);
  const addressLookupId = useRef(0);

  // Syncs form values when the selected station changes.
  useEffect(() => {
    setValues(buildEditStationDefaults(station, defaultConnectorType));
  }, [defaultConnectorType, station]);

  // Updates the name field in the form.
  const handleNameChange = (value: string) => {
    setValues((prev) => ({ ...prev, name: value }));
  };

  // Updates the address field in the form.
  const handleAddressChange = (value: string) => {
    setValues((prev) => ({ ...prev, address: value }));
  };

  // Updates the station status selection.
  const handleStatusChange = (value: StationFormValues["status"]) => {
    setValues((prev) => ({ ...prev, status: value }));
  };

  // Updates the latitude field in the form.
  const handleLatChange = (value: string) => {
    setValues((prev) => ({ ...prev, lat: value }));
  };

  // Updates the longitude field in the form.
  const handleLngChange = (value: string) => {
    setValues((prev) => ({ ...prev, lng: value }));
  };

  // Updates a connector draft field.
  const handleConnectorChange = (
    id: string,
    field: keyof StationConnectorDraft,
    value: string
  ) => {
    setFormError(null);
    setValues((prev) => ({
      ...prev,
      connectors: prev.connectors.map((connector) =>
        connector.id === id ? { ...connector, [field]: value } : connector
      ),
    }));
  };

  // Adds a new connector draft row.
  const handleAddConnector = () => {
    setFormError(null);
    setValues((prev) => ({
      ...prev,
      connectors: [
        ...prev.connectors,
        createDefaultConnector(defaultConnectorType),
      ],
    }));
  };

  // Removes a connector draft row while keeping at least one entry.
  const handleRemoveConnector = (id: string) => {
    setValues((prev) => {
      if (prev.connectors.length === 1) return prev;
      return {
        ...prev,
        connectors: prev.connectors.filter((connector) => connector.id !== id),
      };
    });
  };

  // Updates a pricing field in the form.
  const handlePricingChange = (
    field: keyof StationFormValues["pricing"],
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: value },
    }));
  };

  // Updates the amenities text input in the form.
  const handleAmenitiesChange = (value: string) => {
    setValues((prev) => ({ ...prev, amenities: value }));
  };

  // Updates a photo draft field.
  const handlePhotoChange = (
    id: string,
    field: keyof StationPhotoDraft,
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === id ? { ...photo, [field]: value } : photo
      ),
    }));
  };

  // Adds a new photo draft entry.
  const handleAddPhoto = () => {
    setValues((prev) => ({
      ...prev,
      photos: [...prev.photos, createDefaultPhoto()],
    }));
  };

  // Removes a photo draft entry.
  const handleRemovePhoto = (id: string) => {
    setValues((prev) => ({
      ...prev,
      photos: prev.photos.filter((photo) => photo.id !== id),
    }));
  };

  // Updates the notes field in the form.
  const handleNotesChange = (value: string) => {
    setValues((prev) => ({ ...prev, notes: value }));
  };

  // Validates the form before submitting.
  const handleSubmit = (event: FormEvent) => {
    const error = validateStationForm(values);
    if (error) {
      event.preventDefault();
      setFormError(error);
      return;
    }
    if (formError) setFormError(null);
  };

  // Requests the user's current location for the form.
  const handleRequestLocation = () => {
    setUseMyLocation(true);
    geo.request();
  };

  // Resolves the address for the selected map coordinates.
  const handlePickLocation = useCallback(
    async (latValue: number, lngValue: number) => {
      addressLookupAbort.current?.abort();
      const controller = new AbortController();
      addressLookupAbort.current = controller;
      const lookupId = (addressLookupId.current += 1);
      setAddressLookupLoading(true);
      setAddressLookupError(null);

      const result = await reverseGeocode(
        latValue,
        lngValue,
        controller.signal
      );
      if (controller.signal.aborted || lookupId !== addressLookupId.current) {
        return;
      }
      setAddressLookupLoading(false);
      if (result.ok && result.address) {
        setValues((prev) => ({ ...prev, address: result.address }));
        return;
      }
      setAddressLookupError(result.error || "Could not resolve address.");
    },
    []
  );

  // Syncs lat/lng when the user requests their current location.
  useEffect(() => {
    if (!useMyLocation || !geo.loc) return;
    setValues((prev) => ({
      ...prev,
      lat: geo.loc.lat.toFixed(6),
      lng: geo.loc.lng.toFixed(6),
    }));
    handlePickLocation(geo.loc.lat, geo.loc.lng);
    setUseMyLocation(false);
  }, [geo.loc, handlePickLocation, useMyLocation]);

  // Cancels any in-flight address lookups when the form unmounts.
  useEffect(() => {
    return () => {
      addressLookupAbort.current?.abort();
    };
  }, []);

  // Computes the map center from form coordinates or geolocation.
  const locationCenter = useMemo(
    () => getMapCenter(values.lat, values.lng, geo.loc ?? undefined),
    [geo.loc, values.lat, values.lng]
  );

  const handlers: EditStationFormHandlers = {
    onNameChange: handleNameChange,
    onAddressChange: handleAddressChange,
    onStatusChange: handleStatusChange,
    onLatChange: handleLatChange,
    onLngChange: handleLngChange,
    onConnectorChange: handleConnectorChange,
    onAddConnector: handleAddConnector,
    onRemoveConnector: handleRemoveConnector,
    onPricingChange: handlePricingChange,
    onAmenitiesChange: handleAmenitiesChange,
    onPhotoChange: handlePhotoChange,
    onAddPhoto: handleAddPhoto,
    onRemovePhoto: handleRemovePhoto,
    onNotesChange: handleNotesChange,
  };

  return {
    values,
    handlers,
    onSubmit: handleSubmit,
    formError,
    locationCenter,
    onRequestLocation: handleRequestLocation,
    onPickLocation: handlePickLocation,
    addressLookupLoading,
    locationLoading: geo.loading,
    locationError: addressLookupError || geo.error || null,
  };
}
