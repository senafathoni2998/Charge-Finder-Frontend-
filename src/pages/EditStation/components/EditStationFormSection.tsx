import type { FormEvent } from "react";
import { CONNECTOR_OPTIONS } from "../../MainPage/constants";
import StationFormCard, {
  type StationFormValues,
} from "../../AddStation/components/StationFormCard";
import EditStationHeader from "./EditStationHeader";
import type { EditStationFormHandlers } from "../types";

type EditStationFormSectionProps = {
  values: StationFormValues;
  handlers: EditStationFormHandlers;
  submitError: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  stationId: string;
  locationCenter: { lat: number; lng: number };
  onRequestLocation: () => void;
  onPickLocation: (lat: number, lng: number) => void;
  locationLoading: boolean;
  addressLookupLoading: boolean;
  locationError: string | null;
};

// Renders the edit-station header with the shared form card.
export default function EditStationFormSection({
  values,
  handlers,
  submitError,
  isSubmitting,
  onSubmit,
  onCancel,
  stationId,
  locationCenter,
  onRequestLocation,
  onPickLocation,
  locationLoading,
  addressLookupLoading,
  locationError,
}: EditStationFormSectionProps) {
  return (
    <>
      <EditStationHeader />
      <StationFormCard
        values={values}
        handlers={handlers}
        connectorOptions={CONNECTOR_OPTIONS}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onCancel}
        stationId={stationId}
        submitLabel="Update station"
        submittingLabel="Updating..."
        locationCenter={locationCenter}
        onRequestLocation={onRequestLocation}
        onPickLocation={onPickLocation}
        locationLoading={locationLoading}
        addressLookupLoading={addressLookupLoading}
        locationError={locationError}
      />
    </>
  );
}
