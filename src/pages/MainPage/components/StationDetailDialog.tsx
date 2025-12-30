// imports
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Stack,
  Skeleton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {UI} from "../../../theme/theme";
import StatusChip from "./StatusChip";
import ConnectorChip from "./ConnectorChip";
import { minutesAgo } from "../../../utils/time";

type Connector = {
  type: string;
  powerKW: number;
};

type Station = {
  id: string | number;
  name?: string;
  address?: string;
  status?: string;
  lastUpdatedISO?: string;
  connectors: Connector[];
  lat: number;
  lng: number;
};

type StationDetailDialogProps = {
  open: boolean;
  station?: Station | null;
  onClose: () => void;
  onOpenMaps: () => void;
};

export default function StationDetailDialog({ open, station, onClose, onOpenMaps }: StationDetailDialogProps) {
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
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 950, lineHeight: 1.1, color: UI.text }}>
            {station?.name || "Station"}
          </Typography>
          <Typography variant="body2" sx={{ color: UI.text2, mt: 0.25 }}>
            {station?.address || ""}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ color: UI.text2 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        {!station ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={18} />
            <Skeleton variant="rounded" height={18} />
            <Skeleton variant="rounded" height={18} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip status={station.status} />
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                Updated {minutesAgo(station.lastUpdatedISO)}m ago
              </Typography>
            </Stack>

            <Box>
              <Typography sx={{ fontWeight: 900, mb: 0.75, color: UI.text }}>
                Connectors
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {station.connectors.map((c, idx) => (
                  <ConnectorChip key={idx} type={c.type} powerKW={c.powerKW} />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 900, mb: 0.75, color: UI.text }}>
                Coordinates
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2 }}>
                {station.lat.toFixed(5)}, {station.lng.toFixed(5)}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                Next step
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2, mt: 0.5 }}>
                In your real app, this dialog can be replaced by navigation to
                <b> /stations/{station.id}</b>.
              </Typography>
            </Box>
          </Stack>
        )}
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
          Close
        </Button>
        <Button
          variant="contained"
          onClick={onOpenMaps}
          disabled={!station}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          Open in Maps
        </Button>
      </DialogActions>
    </Dialog>
  );
}