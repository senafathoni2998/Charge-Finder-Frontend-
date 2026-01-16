import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";
import type { ChargingStatus, Ticket } from "../types";

type ChargingDialogProps = {
  open: boolean;
  onClose: () => void;
  onStop: () => void;
  chargingStatus: ChargingStatus;
  chargingCancelled?: boolean;
  chargingProgress: number;
  displayProgress?: number;
  ticket: Ticket | null;
  ticketKwh: number;
  deliveredKwh: number;
  remainingMinutes: number;
  estimatedRemainingMinutes?: number | null;
};

// Renders the live charging progress dialog.
export default function ChargingDialog({
  open,
  onClose,
  onStop,
  chargingStatus,
  chargingCancelled = false,
  chargingProgress,
  displayProgress,
  ticket,
  ticketKwh,
  deliveredKwh,
  remainingMinutes,
  estimatedRemainingMinutes,
}: ChargingDialogProps) {
  const isCharging = chargingStatus === "charging";
  const isCancelled = chargingStatus === "done" && chargingCancelled;
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const progressPercent =
    typeof displayProgress === "number" && Number.isFinite(displayProgress)
      ? displayProgress
      : chargingProgress;
  const effectiveRemainingMinutes =
    typeof estimatedRemainingMinutes === "number" &&
    Number.isFinite(estimatedRemainingMinutes)
      ? Math.max(0, estimatedRemainingMinutes)
      : remainingMinutes;

  useEffect(() => {
    if (!open || !isCharging) {
      setConfirmStopOpen(false);
    }
  }, [open, isCharging]);

  const handleStopRequest = () => {
    setConfirmStopOpen(true);
  };

  const handleConfirmStop = () => {
    setConfirmStopOpen(false);
    onStop();
  };

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
      <DialogTitle sx={{ fontWeight: 950 }}>
        {isCancelled
          ? "Charging stopped"
          : chargingStatus === "done"
          ? "Charging complete"
          : "Charging in progress"}
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: UI.text2 }}>
            {isCancelled
              ? "Charging stopped. You can unplug when it is safe."
              : chargingStatus === "done"
              ? "Session complete. You can unplug when it is safe."
              : "Keep the connector plugged in while we deliver your ticket."}
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: `1px solid ${UI.border2}`,
              backgroundColor: "rgba(10,10,16,0.02)",
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography sx={{ fontWeight: 900, color: UI.text }}>
                  Battery {progressPercent}%
                </Typography>
                {!isCharging ? (
                  <Typography variant="caption" sx={{ color: UI.text2 }}>
                    {deliveredKwh} / {ticketKwh} kWh
                  </Typography>
                ) : null}
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "rgba(10,10,16,0.08)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    background: UI.brandGradStrong,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                {chargingStatus === "done"
                  ? isCancelled
                    ? "Charging stopped."
                    : "Charging complete."
                  : `Estimated time remaining: ${
                      effectiveRemainingMinutes || ""
                    } ${effectiveRemainingMinutes > 0 ? "min" : ""} `}
              </Typography>
            </Stack>
          </Box>
          {ticket ? (
            <Box
              sx={{
                p: 1.25,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  Ticket ID
                </Typography>
                <Chip
                  size="small"
                  label={ticket.id}
                  sx={{
                    borderRadius: 999,
                    backgroundColor: "rgba(10,10,16,0.04)",
                    border: `1px solid ${UI.border2}`,
                    color: UI.text,
                    fontWeight: 800,
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: UI.text2, mt: 0.75 }}>
                Paid with {ticket.methodLabel}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {isCharging ? (
          <>
            <Button
              variant="outlined"
              onClick={handleStopRequest}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
              }}
            >
              Stop charging
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                background: UI.brandGradStrong,
                color: "white",
              }}
            >
              Hide
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: UI.brandGradStrong,
              color: "white",
            }}
          >
            Done
          </Button>
        )}
      </DialogActions>
      <Dialog
        open={confirmStopOpen}
        onClose={() => setConfirmStopOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 950 }}>Stop charging?</DialogTitle>
        <DialogContent dividers sx={{ borderColor: UI.border2 }}>
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              Stopping ends this session and the ticket cannot be reused.
            </Typography>
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              You will need to buy a new ticket to charge again.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmStopOpen(false)}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: UI.border,
              color: UI.text,
            }}
          >
            Keep charging
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmStop}
            sx={{
              textTransform: "none",
              borderRadius: 3,
            }}
          >
            Stop charging
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
