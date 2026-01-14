import type { ConnectorType } from "../../models/model";

// Action payload returned by the edit car form submission.
export type EditCarActionData = {
  error?: string;
};

// Values managed by the edit car form fields.
export type EditCarFormValues = {
  name: string;
  connectors: Set<ConnectorType>;
  minKW: number;
};

// Event handlers exposed by the edit car form state hook.
export type EditCarFormHandlers = {
  onNameChange: (value: string) => void;
  onToggleConnector: (connector: ConnectorType) => void;
  onMinKWChange: (value: number) => void;
};
