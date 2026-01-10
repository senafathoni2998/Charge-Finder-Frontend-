import { type FormEvent } from "react";
import { Box, Card, CardContent, Divider, Stack, TextField } from "@mui/material";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";
import type { ConnectorType } from "../../../models/model";
import ConnectorTypePicker from "./ConnectorTypePicker";
import PowerSliderField from "./PowerSliderField";
import AddCarActions from "./AddCarActions";

type AddCarFormValues = {
  name: string;
  connectors: Set<ConnectorType>;
  minKW: number;
};

type AddCarFormHandlers = {
  onNameChange: (value: string) => void;
  onToggleConnector: (connector: ConnectorType) => void;
  onMinKWChange: (value: number) => void;
};

type AddCarFormCardProps = {
  values: AddCarFormValues;
  handlers: AddCarFormHandlers;
  connectorOptions: ConnectorType[];
  submitError: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  userId: string;
  email: string;
  minPower: {
    min: number;
    max: number;
    step: number;
  };
};

// Renders the add-car form card with inputs and connector selections.
export default function AddCarFormCard({
  values,
  handlers,
  connectorOptions,
  submitError,
  isSubmitting,
  onSubmit,
  onCancel,
  userId,
  email,
  minPower,
}: AddCarFormCardProps) {
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
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="email" value={email} />
          {Array.from(values.connectors).map((connector) => (
            <input
              key={connector}
              type="hidden"
              name="connectorTypes"
              value={connector}
            />
          ))}
          <input
            type="hidden"
            name="minKW"
            value={Number.isFinite(values.minKW) ? values.minKW : 0}
          />
          <Stack spacing={2}>
            <TextField
              label="Car name"
              name="name"
              value={values.name}
              onChange={(event) => handlers.onNameChange(event.target.value)}
              placeholder="e.g. Hyundai Ioniq 5"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
            />

            <ConnectorTypePicker
              options={connectorOptions}
              selected={values.connectors}
              onToggle={handlers.onToggleConnector}
              error={submitError}
            />

            <PowerSliderField
              value={values.minKW}
              onChange={handlers.onMinKWChange}
              min={minPower.min}
              max={minPower.max}
              step={minPower.step}
            />

            <Divider sx={{ borderColor: UI.border2 }} />

            <AddCarActions isSubmitting={isSubmitting} onCancel={onCancel} />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
