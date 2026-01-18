import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";
import type { ConnectorType } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";

type StartChargingDialogProps = {
  open: boolean;
  connectorTypes: ConnectorType[];
  selectedConnectorType: ConnectorType | null;
  onConnectorChange: (value: ConnectorType) => void;
  vehicles: UserCar[];
  selectedVehicleId: string | null;
  onVehicleChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
};

// Prompts the user to select a connector before starting a charge.
export default function StartChargingDialog({
  open,
  connectorTypes,
  selectedConnectorType,
  onConnectorChange,
  vehicles,
  selectedVehicleId,
  onVehicleChange,
  onClose,
  onConfirm,
  isSubmitting = false,
}: StartChargingDialogProps) {
  const hasOptions = connectorTypes.length > 0;
  const hasVehicles = vehicles.length > 0;
  const canSubmit =
    hasOptions &&
    !!selectedConnectorType &&
    (!hasVehicles || !!selectedVehicleId) &&
    !isSubmitting;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: UI.surface,
          border: `1px solid ${UI.border}`,
          color: UI.text,
          boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 950 }}>
        Choose connector
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Stack spacing={2}>
          {hasVehicles ? (
            <Box>
              <Typography
                variant="caption"
                sx={{ color: UI.text3, fontWeight: 700 }}
              >
                Vehicle
              </Typography>
              <RadioGroup
                value={selectedVehicleId ?? ""}
                onChange={(event) => onVehicleChange(event.target.value)}
              >
                <Stack spacing={0.75}>
                  {vehicles.map((vehicle) => (
                    <FormControlLabel
                      key={vehicle.id}
                      value={vehicle.id}
                      control={<Radio />}
                      label={
                        Number.isFinite(vehicle.batteryCapacity)
                          ? `${vehicle.name} | ${vehicle.batteryCapacity} kWh`
                          : vehicle.name
                      }
                    />
                  ))}
                </Stack>
              </RadioGroup>
            </Box>
          ) : null}

          {hasOptions ? (
            <Box>
              <Typography
                variant="caption"
                sx={{ color: UI.text3, fontWeight: 700 }}
              >
                Connector
              </Typography>
              <RadioGroup
                value={selectedConnectorType ?? ""}
                onChange={(event) =>
                  onConnectorChange(event.target.value as ConnectorType)
                }
              >
                <Stack spacing={0.75}>
                  {connectorTypes.map((type) => (
                    <FormControlLabel
                      key={type}
                      value={type}
                      control={<Radio />}
                      label={type}
                    />
                  ))}
                </Stack>
              </RadioGroup>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              No connectors are available for this station.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            borderColor: UI.border,
            color: UI.text,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={!canSubmit}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          Start charging
        </Button>
      </DialogActions>
    </Dialog>
  );
}
