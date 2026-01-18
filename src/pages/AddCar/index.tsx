import { useState, type FormEvent } from "react";
import { Box, Stack } from "@mui/material";
import { useActionData, useNavigate, useNavigation } from "react-router";
import { UI } from "../../theme/theme";
import { useAppSelector } from "../../app/hooks";
import type { ConnectorType } from "../../models/model";
import type { AddCarActionData } from "./types";
import { CONNECTOR_OPTIONS, POWER_MAX, POWER_MIN, POWER_STEP } from "./constants";
import AddCarHeader from "./components/AddCarHeader";
import AddCarFormCard from "./components/AddCarFormCard";

export { addCarAction } from "./addCarRoute";

// Add car page container that wires form state and layout components.
export default function AddCarPage() {
  const navigate = useNavigate();
  const actionData = useActionData() as AddCarActionData | undefined;
  const navigation = useNavigation();
  const email = useAppSelector((state) => state.auth.email) || "";
  const userId = useAppSelector((state) => state.auth.userId) || "";

  const [carName, setCarName] = useState("");
  const [carConnectors, setCarConnectors] = useState<Set<ConnectorType>>(
    new Set()
  );
  const [carMinKW, setCarMinKW] = useState(0);
  const [carBatteryCapacity, setCarBatteryCapacity] = useState("");
  const [carError, setCarError] = useState<string | null>(null);

  // Performs client-side validation before submitting the form.
  const handleSubmit = (event: FormEvent) => {
    if (!carConnectors.size) {
      event.preventDefault();
      setCarError("Select at least one connector type.");
      return;
    }
    if (carError) setCarError(null);
  };

  const handleToggleConnector = (connector: ConnectorType) => {
    setCarError(null);
    setCarConnectors((prev) => {
      const next = new Set(prev);
      if (next.has(connector)) next.delete(connector);
      else next.add(connector);
      return next;
    });
  };

  const submitError = carError || actionData?.error || null;
  const isSubmitting = navigation.state === "submitting";

  const formValues = {
    name: carName,
    connectors: carConnectors,
    minKW: carMinKW,
    batteryCapacity: carBatteryCapacity,
  };
  const formHandlers = {
    onNameChange: (value: string) => setCarName(value),
    onToggleConnector: handleToggleConnector,
    onMinKWChange: (value: number) => setCarMinKW(value),
    onBatteryCapacityChange: (value: string) => setCarBatteryCapacity(value),
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
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack spacing={2.5}>
          <AddCarHeader />
          <AddCarFormCard
            values={formValues}
            handlers={formHandlers}
            connectorOptions={CONNECTOR_OPTIONS}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/profile")}
            userId={userId}
            email={email}
            minPower={{ min: POWER_MIN, max: POWER_MAX, step: POWER_STEP }}
          />
        </Stack>
      </Box>
    </Box>
  );
}
