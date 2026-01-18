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
  TextField,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";
import { formatCurrency } from "../../../utils/distance";
import type { PaymentMethod } from "../types";
import type { ChargingSpeed } from "../../../models/model";
import InfoRow from "./InfoRow";

const SPEED_OPTIONS: Array<{
  value: ChargingSpeed;
  label: string;
  helper: string;
}> = [
  { value: "NORMAL", label: "Normal", helper: "Standard charging speed." },
  { value: "FAST", label: "Fast", helper: "Higher power delivery." },
  { value: "ULTRA_FAST", label: "Ultra fast", helper: "Highest power option." },
];

type PaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  ticketKwh: number;
  ticketKwhInput: string;
  ticketKwhSuggested: number;
  ticketKwhValid: boolean;
  onTicketKwhChange: (value: string) => void;
  chargingSpeed: ChargingSpeed;
  onChargingSpeedChange: (value: ChargingSpeed) => void;
  pricePerKwh: number | null;
  currency: string | null;
  ticketPriceLabel: string;
  selectedPaymentId: string;
  onPaymentChange: (value: string) => void;
  paymentMethods: PaymentMethod[];
  onConfirm: () => void;
  canSubmit: boolean;
  hasTicket: boolean;
  submitError?: string | null;
  isSubmitting?: boolean;
};

// Renders the payment selection dialog for buying a charging ticket.
export default function PaymentDialog({
  open,
  onClose,
  ticketKwh,
  ticketKwhInput,
  ticketKwhSuggested,
  ticketKwhValid,
  onTicketKwhChange,
  chargingSpeed,
  onChargingSpeedChange,
  pricePerKwh,
  currency,
  ticketPriceLabel,
  selectedPaymentId,
  onPaymentChange,
  paymentMethods,
  onConfirm,
  canSubmit,
  hasTicket,
  submitError,
  isSubmitting = false,
}: PaymentDialogProps) {
  const hasTicketKwhInput = ticketKwhInput.trim().length > 0;
  const perKwhLabel =
    Number.isFinite(pricePerKwh) && currency
      ? formatCurrency(currency, Number(pricePerKwh))
      : "—";
  const speedLabel =
    SPEED_OPTIONS.find((option) => option.value === chargingSpeed)?.label ??
    "Normal";
  const confirmLabel = isSubmitting
    ? "Processing..."
    : hasTicket
    ? "Update payment"
    : "Buy ticket";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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
      <DialogTitle sx={{ fontWeight: 950, fontSize: 22 }}>
        Charging ticket
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: UI.text3 }}>
            Choose a payment method for a {ticketKwh} kWh ticket.
          </Typography>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 3,
              border: `1px solid ${UI.border2}`,
              backgroundColor: "rgba(10,10,16,0.02)",
            }}
          >
            <Stack spacing={1.25}>
              <Typography
                variant="subtitle2"
                sx={{ color: UI.text, fontWeight: 800, letterSpacing: 0.3 }}
              >
                Ticket setup
              </Typography>
              <TextField
                label="Ticket size (kWh)"
                type="number"
                value={ticketKwhInput}
                onChange={(event) => onTicketKwhChange(event.target.value)}
                inputProps={{ min: 1, step: 0.1 }}
                error={!ticketKwhValid}
                helperText={
                  !ticketKwhValid
                    ? "Enter a valid kWh amount."
                    : !hasTicketKwhInput
                    ? `Suggested: ${ticketKwhSuggested} kWh`
                    : " "
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(10,10,16,0.02)",
                  },
                }}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: UI.text2, fontWeight: 800, letterSpacing: 0.2 }}
                >
                  Charging speed
                </Typography>
                <RadioGroup
                  value={chargingSpeed}
                  onChange={(event) =>
                    onChargingSpeedChange(event.target.value as ChargingSpeed)
                  }
                  sx={{ gap: 1, mt: 1 }}
                >
                  {SPEED_OPTIONS.map((option) => {
                    const isSelected = chargingSpeed === option.value;
                    return (
                      <Box
                        key={option.value}
                        sx={{
                          p: 1.25,
                          borderRadius: 3,
                          border: `1px solid ${
                            isSelected ? "rgba(0,229,255,0.35)" : UI.border2
                          }`,
                          backgroundColor: isSelected
                            ? "rgba(0,229,255,0.08)"
                            : "rgba(10,10,16,0.02)",
                        }}
                      >
                        <FormControlLabel
                          value={option.value}
                          control={
                            <Radio
                              sx={{
                                color: UI.text3,
                                "&.Mui-checked": { color: UI.text },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                                {option.label}
                              </Typography>
                              <Typography variant="caption" sx={{ color: UI.text3 }}>
                                {option.helper}
                              </Typography>
                            </Box>
                          }
                          sx={{ alignItems: "flex-start", m: 0 }}
                        />
                      </Box>
                    );
                  })}
                </RadioGroup>
              </Box>
            </Stack>
          </Box>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 3,
              border: `1px solid ${UI.border2}`,
              backgroundColor: "rgba(10,10,16,0.02)",
            }}
          >
            <Stack spacing={0.75}>
              <Typography
                variant="subtitle2"
                sx={{ color: UI.text, fontWeight: 800, letterSpacing: 0.3 }}
              >
                Ticket details
              </Typography>
              <InfoRow label="Ticket size" value={`${ticketKwh} kWh`} />
              <InfoRow label="Speed" value={speedLabel} />
              <InfoRow label="Per kWh" value={perKwhLabel} />
              <InfoRow label="Total" value={ticketPriceLabel} />
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                Price based on station rate.
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 3,
              border: `1px solid ${UI.border2}`,
              backgroundColor: "rgba(10,10,16,0.02)",
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="subtitle2"
                sx={{ color: UI.text, fontWeight: 800, letterSpacing: 0.3 }}
              >
                Payment method
              </Typography>
              <RadioGroup
                value={selectedPaymentId}
                onChange={(event) => onPaymentChange(event.target.value)}
                sx={{ gap: 1 }}
              >
                {paymentMethods.map((method) => {
                  const isSelected = selectedPaymentId === method.id;
                  return (
                    <Box
                      key={method.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 3,
                        border: `1px solid ${
                          isSelected ? "rgba(0,229,255,0.35)" : UI.border2
                        }`,
                        backgroundColor: isSelected
                          ? "rgba(0,229,255,0.08)"
                          : "rgba(10,10,16,0.02)",
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={
                          <Radio
                            sx={{
                              color: UI.text3,
                              "&.Mui-checked": { color: UI.text },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: UI.text }}>
                              {method.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: UI.text3 }}>
                              {method.helper}
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: "flex-start", m: 0 }}
                      />
                    </Box>
                  );
                })}
              </RadioGroup>
            </Stack>
          </Box>
          {submitError ? (
            <Box sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
              {submitError}
            </Box>
          ) : null}
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
          disabled={!canSubmit || isSubmitting || !ticketKwhValid}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
