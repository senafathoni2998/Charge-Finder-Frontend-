import type { FormEvent } from "react";
import AddCarFormCard from "../../AddCar/components/AddCarFormCard";
import {
  CONNECTOR_OPTIONS,
  POWER_MAX,
  POWER_MIN,
  POWER_STEP,
} from "../../AddCar/constants";
import type { EditCarFormHandlers, EditCarFormValues } from "../types";
import EditCarHeader from "./EditCarHeader";

type EditCarFormSectionProps = {
  values: EditCarFormValues;
  handlers: EditCarFormHandlers;
  submitError: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  userId: string;
  email: string;
  vehicleId: string;
};

// Renders the edit-car header with the shared form card.
export default function EditCarFormSection({
  values,
  handlers,
  submitError,
  isSubmitting,
  onSubmit,
  onCancel,
  userId,
  email,
  vehicleId,
}: EditCarFormSectionProps) {
  return (
    <>
      <EditCarHeader />
      <AddCarFormCard
        values={values}
        handlers={handlers}
        connectorOptions={CONNECTOR_OPTIONS}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onCancel}
        userId={userId}
        email={email}
        vehicleId={vehicleId}
        submitLabel="Update car"
        submittingLabel="Updating..."
        minPower={{ min: POWER_MIN, max: POWER_MAX, step: POWER_STEP }}
      />
    </>
  );
}
