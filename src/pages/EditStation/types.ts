import type { Availability } from "../../models/model";
import type {
  StationConnectorDraft,
  StationFormValues,
  StationPhotoDraft,
} from "../AddStation/components/StationFormCard";

// Action payload returned by the edit station form submission.
export type EditStationActionData = {
  error?: string;
};

// Form handlers exposed by the edit-station state hook.
export type EditStationFormHandlers = {
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
  onPricingChange: (
    field: keyof StationFormValues["pricing"],
    value: string
  ) => void;
  onAmenitiesChange: (value: string) => void;
  onPhotoChange: (
    id: string,
    field: keyof StationPhotoDraft,
    value: string
  ) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (id: string) => void;
  onNotesChange: (value: string) => void;
};
