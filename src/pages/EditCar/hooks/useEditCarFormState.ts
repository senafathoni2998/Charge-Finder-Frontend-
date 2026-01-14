import { useEffect, useState, type FormEvent } from "react";
import type { ConnectorType } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";
import type { EditCarFormHandlers, EditCarFormValues } from "../types";
import { getCarFormDefaults } from "../utils";

type EditCarFormState = {
  values: EditCarFormValues;
  handlers: EditCarFormHandlers;
  onSubmit: (event: FormEvent) => void;
  clientError: string | null;
};

// Ensures the connector selection is valid before submit.
const validateConnectorSelection = (
  connectors: Set<ConnectorType>
): string | null => {
  if (connectors.size) return null;
  return "Select at least one connector type.";
};

// Manages edit-car form values and client-side validation.
export default function useEditCarFormState(
  car: UserCar | null
): EditCarFormState {
  const [values, setValues] = useState<EditCarFormValues>(() =>
    getCarFormDefaults(car)
  );
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    // Syncs the form inputs whenever the selected car changes.
    setValues(getCarFormDefaults(car));
    setClientError(null);
  }, [car]);

  // Updates the car name field as the user types.
  const handleNameChange = (value: string) => {
    setValues((prev) => ({ ...prev, name: value }));
  };

  // Updates the minimum power requirement.
  const handleMinKWChange = (value: number) => {
    setValues((prev) => ({ ...prev, minKW: value }));
  };

  // Adds or removes a connector type from the selection.
  const handleToggleConnector = (connector: ConnectorType) => {
    setClientError(null);
    setValues((prev) => {
      const nextConnectors = new Set(prev.connectors);
      if (nextConnectors.has(connector)) nextConnectors.delete(connector);
      else nextConnectors.add(connector);
      return { ...prev, connectors: nextConnectors };
    });
  };

  // Validates the connector selection before allowing submit.
  const handleSubmit = (event: FormEvent) => {
    const error = validateConnectorSelection(values.connectors);
    if (error) {
      event.preventDefault();
      setClientError(error);
      return;
    }
    if (clientError) setClientError(null);
  };

  const handlers: EditCarFormHandlers = {
    onNameChange: handleNameChange,
    onToggleConnector: handleToggleConnector,
    onMinKWChange: handleMinKWChange,
  };

  return { values, handlers, onSubmit: handleSubmit, clientError };
}
