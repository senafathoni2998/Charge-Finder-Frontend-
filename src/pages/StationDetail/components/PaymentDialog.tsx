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
import type { PaymentMethod } from "../types";

type PaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  ticketKwh: number;
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
      <DialogTitle sx={{ fontWeight: 950 }}>Charging ticket</DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: UI.text2 }}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                Total
              </Typography>
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                {ticketPriceLabel}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Price based on station rate.
            </Typography>
          </Box>
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
          disabled={!canSubmit || isSubmitting}
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
