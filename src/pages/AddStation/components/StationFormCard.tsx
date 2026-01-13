import { type FormEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";
import type { Availability, ConnectorType } from "../../../models/model";
import LocationPickerMap from "./LocationPickerMap";

export type StationConnectorDraft = {
  id: string;
  type: ConnectorType;
  powerKW: string;
  ports: string;
  availablePorts: string;
};

export type StationPhotoDraft = {
  id: string;
  label: string;
  gradient: string;
};

type StationPricingDraft = {
  currency: string;
  perKwh: string;
  perMinute: string;
  parkingFee: string;
};

export type StationFormValues = {
  name: string;
  address: string;
  status: Availability;
  lat: string;
  lng: string;
  connectors: StationConnectorDraft[];
  pricing: StationPricingDraft;
  amenities: string;
  photos: StationPhotoDraft[];
  notes: string;
};

type StationFormHandlers = {
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onStatusChange: (value: Availability) => void;
  onLatChange: (value: string) => void;
  onLngChange: (value: string) => void;
  onConnectorChange: (
    id: string,
    field: keyof StationConnectorDraft,
    value: string
  ) => void;
  onAddConnector: () => void;
  onRemoveConnector: (id: string) => void;
  onPricingChange: (field: keyof StationPricingDraft, value: string) => void;
  onAmenitiesChange: (value: string) => void;
  onPhotoChange: (id: string, field: keyof StationPhotoDraft, value: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (id: string) => void;
  onNotesChange: (value: string) => void;
};

type StationFormCardProps = {
  values: StationFormValues;
  handlers: StationFormHandlers;
  connectorOptions: ConnectorType[];
  submitError: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  stationId?: string | null;
  submitLabel?: string;
  submittingLabel?: string;
  locationCenter?: { lat: number; lng: number };
  onPickLocation?: (lat: number, lng: number) => void;
  onRequestLocation?: () => void;
  locationLoading?: boolean;
  addressLookupLoading?: boolean;
  locationError?: string | null;
};

const STATUS_OPTIONS: Availability[] = ["AVAILABLE", "BUSY", "OFFLINE"];

const toNumber = (value: string) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

// Renders the station form card with inputs and connector definitions.
export default function StationFormCard({
  values,
  handlers,
  connectorOptions,
  submitError,
  isSubmitting,
  onSubmit,
  onCancel,
  stationId,
  submitLabel = "Save station",
  submittingLabel = "Saving...",
  locationCenter,
  onPickLocation,
  onRequestLocation,
  locationLoading,
  addressLookupLoading,
  locationError,
}: StationFormCardProps) {
  const latValue = values.lat.trim() ? Number(values.lat) : Number.NaN;
  const lngValue = values.lng.trim() ? Number(values.lng) : Number.NaN;
  const hasCoords = Number.isFinite(latValue) && Number.isFinite(lngValue);
  const selectedPoint = hasCoords ? { lat: latValue, lng: lngValue } : null;
  const mapCenter =
    locationCenter ?? selectedPoint ?? { lat: -6.2, lng: 106.8167 };

  const handleMapPick = (lat: number, lng: number) => {
    handlers.onLatChange(lat.toFixed(6));
    handlers.onLngChange(lng.toFixed(6));
    onPickLocation?.(lat, lng);
  };

  const connectorsPayload = values.connectors.map((connector) => ({
    type: connector.type,
    powerKW: toNumber(connector.powerKW),
    ports: toNumber(connector.ports),
    availablePorts: toNumber(connector.availablePorts),
  }));

  const pricingPayload = {
    currency: values.pricing.currency.trim(),
    perKwh: toNumber(values.pricing.perKwh),
    perMinute: toNumber(values.pricing.perMinute),
    parkingFee: values.pricing.parkingFee.trim(),
  };

  const amenitiesPayload = values.amenities
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const photosPayload = values.photos
    .map((photo) => ({
      label: photo.label.trim(),
      gradient: photo.gradient.trim(),
    }))
    .filter((photo) => photo.label || photo.gradient);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: "0 18px 50px rgba(10,10,16,0.10)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ height: 8, background: UI.brandGradStrong }} />
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Box component={Form} method="post" onSubmit={onSubmit} noValidate>
          {stationId ? (
            <input type="hidden" name="stationId" value={stationId} />
          ) : null}
          <input
            type="hidden"
            name="connectors"
            value={JSON.stringify(connectorsPayload)}
          />
          <input
            type="hidden"
            name="pricing"
            value={JSON.stringify(pricingPayload)}
          />
          <input
            type="hidden"
            name="amenities"
            value={JSON.stringify(amenitiesPayload)}
          />
          <input
            type="hidden"
            name="photos"
            value={JSON.stringify(photosPayload)}
          />
          <Stack spacing={2.5}>
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Basics
              </Typography>
              <TextField
                label="Station name"
                name="name"
                value={values.name}
                onChange={(event) => handlers.onNameChange(event.target.value)}
                placeholder="e.g. Central Plaza Fast Charge"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />
              <TextField
                label="Address"
                name="address"
                value={values.address}
                onChange={(event) => handlers.onAddressChange(event.target.value)}
                placeholder="Street, city, region"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />
              <TextField
                label="Status"
                name="status"
                value={values.status}
                onChange={(event) =>
                  handlers.onStatusChange(event.target.value as Availability)
                }
                select
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Location
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Latitude"
                  name="lat"
                  type="number"
                  value={values.lat}
                  onChange={(event) => handlers.onLatChange(event.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    },
                  }}
                />
                <TextField
                  label="Longitude"
                  name="lng"
                  type="number"
                  value={values.lng}
                  onChange={(event) => handlers.onLngChange(event.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    },
                  }}
                />
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
              >
                <Typography sx={{ color: UI.text3, fontSize: 13 }}>
                  Click the map to set coordinates.
                </Typography>
                <Box sx={{ flex: 1 }} />
                {onRequestLocation ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onRequestLocation}
                    disabled={locationLoading}
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      borderColor: UI.border,
                      color: UI.text,
                    }}
                  >
                    {locationLoading ? "Locating..." : "Use my location"}
                  </Button>
                ) : null}
              </Stack>
              {addressLookupLoading ? (
                <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                  Looking up address...
                </Typography>
              ) : null}
              {locationError ? (
                <Typography sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
                  {locationError}
                </Typography>
              ) : null}
              <LocationPickerMap
                center={mapCenter}
                selected={selectedPoint}
                onPick={handleMapPick}
              />
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800, color: UI.text }}>
                  Connectors
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handlers.onAddConnector}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                  }}
                >
                  Add connector
                </Button>
              </Stack>

              <Stack spacing={2}>
                {values.connectors.map((connector, index) => (
                  <Box
                    key={connector.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: `1px solid ${UI.border2}`,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          sx={{ fontWeight: 700, color: UI.text2, fontSize: 14 }}
                        >
                          Connector {index + 1}
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        {values.connectors.length > 1 ? (
                          <IconButton
                            size="small"
                            onClick={() => handlers.onRemoveConnector(connector.id)}
                            sx={{
                              borderRadius: 2,
                              border: `1px solid ${UI.border2}`,
                            }}
                            aria-label="Remove connector"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          label="Type"
                          value={connector.type}
                          onChange={(event) =>
                            handlers.onConnectorChange(
                              connector.id,
                              "type",
                              event.target.value
                            )
                          }
                          select
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              backgroundColor: "rgba(10,10,16,0.02)",
                            },
                          }}
                        >
                          {connectorOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          label="Power (kW)"
                          type="number"
                          value={connector.powerKW}
                          onChange={(event) =>
                            handlers.onConnectorChange(
                              connector.id,
                              "powerKW",
                              event.target.value
                            )
                          }
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              backgroundColor: "rgba(10,10,16,0.02)",
                            },
                          }}
                        />
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          label="Ports"
                          type="number"
                          value={connector.ports}
                          onChange={(event) =>
                            handlers.onConnectorChange(
                              connector.id,
                              "ports",
                              event.target.value
                            )
                          }
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              backgroundColor: "rgba(10,10,16,0.02)",
                            },
                          }}
                        />
                        <TextField
                          label="Available ports"
                          type="number"
                          value={connector.availablePorts}
                          onChange={(event) =>
                            handlers.onConnectorChange(
                              connector.id,
                              "availablePorts",
                              event.target.value
                            )
                          }
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              backgroundColor: "rgba(10,10,16,0.02)",
                            },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Pricing
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Currency"
                  value={values.pricing.currency}
                  onChange={(event) =>
                    handlers.onPricingChange("currency", event.target.value)
                  }
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    },
                  }}
                />
                <TextField
                  label="Per kWh"
                  type="number"
                  value={values.pricing.perKwh}
                  onChange={(event) =>
                    handlers.onPricingChange("perKwh", event.target.value)
                  }
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    },
                  }}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Per minute (optional)"
                  type="number"
                  value={values.pricing.perMinute}
                  onChange={(event) =>
                    handlers.onPricingChange("perMinute", event.target.value)
                  }
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    },
                  }}
                />
                <TextField
                  label="Parking fee (optional)"
                  value={values.pricing.parkingFee}
                  onChange={(event) =>
                    handlers.onPricingChange("parkingFee", event.target.value)
                  }
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "rgba(10,10,16,0.02)",
                    },
                  }}
                />
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Amenities
              </Typography>
              <TextField
                label="Amenities"
                value={values.amenities}
                onChange={(event) => handlers.onAmenitiesChange(event.target.value)}
                helperText="Comma-separated list (e.g. Restroom, Coffee, Wi-Fi)"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800, color: UI.text }}>
                  Photos
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handlers.onAddPhoto}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                  }}
                >
                  Add photo
                </Button>
              </Stack>
              <Stack spacing={2}>
                {values.photos.length ? (
                  values.photos.map((photo) => (
                    <Box
                      key={photo.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: `1px solid ${UI.border2}`,
                        backgroundColor: "rgba(10,10,16,0.02)",
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            sx={{ fontWeight: 700, color: UI.text2, fontSize: 14 }}
                          >
                            Photo
                          </Typography>
                          <Box sx={{ flex: 1 }} />
                          <IconButton
                            size="small"
                            onClick={() => handlers.onRemovePhoto(photo.id)}
                            sx={{
                              borderRadius: 2,
                              border: `1px solid ${UI.border2}`,
                            }}
                            aria-label="Remove photo"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                          <TextField
                            label="Label"
                            value={photo.label}
                            onChange={(event) =>
                              handlers.onPhotoChange(
                                photo.id,
                                "label",
                                event.target.value
                              )
                            }
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                backgroundColor: "rgba(10,10,16,0.02)",
                              },
                            }}
                          />
                          <TextField
                            label="Gradient"
                            value={photo.gradient}
                            onChange={(event) =>
                              handlers.onPhotoChange(
                                photo.id,
                                "gradient",
                                event.target.value
                              )
                            }
                            placeholder="linear-gradient(135deg, ...)"
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                backgroundColor: "rgba(10,10,16,0.02)",
                              },
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                    No photos added yet.
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Notes
              </Typography>
              <TextField
                label="Notes"
                name="notes"
                value={values.notes}
                onChange={(event) => handlers.onNotesChange(event.target.value)}
                multiline
                minRows={3}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />
            </Stack>

            {submitError ? (
              <Typography sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
                {submitError}
              </Typography>
            ) : null}

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: UI.text,
                  backgroundColor: "rgba(10,10,16,0.01)",
                }}
              >
                Cancel
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  background: UI.brandGrad,
                  boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
                }}
              >
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
