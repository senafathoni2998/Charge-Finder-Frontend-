import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LaunchIcon from "@mui/icons-material/Launch";
import { UI } from "../../../theme/theme";
import { minutesAgo } from "../../../utils/time";
import { statusColor } from "../../../utils/map";
import { statusLabel } from "../../../utils/distance";
import type { Availability } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";
import type { Station } from "../types";

type ActionsCardProps = {
  loading: boolean;
  station: Station | null;
  isAuthenticated: boolean;
  hasTicket: boolean;
  activeCar: UserCar | null;
  isCompatible: boolean | null;
  canCharge: boolean;
  chargingActionLabel: string;
  onChargingAction: () => void;
  onOpenMaps: () => void;
  chargingError?: string | null;
  chargingLoading?: boolean;
};

// Shows the primary action buttons and live station status.
export default function ActionsCard({
  loading,
  station,
  isAuthenticated,
  hasTicket,
  activeCar,
  isCompatible,
  canCharge,
  chargingActionLabel,
  onChargingAction,
  onOpenMaps,
  chargingError,
  chargingLoading = false,
}: ActionsCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: UI.border2,
        backgroundColor: UI.surface2,
        backdropFilter: "blur(10px)",
        boxShadow: UI.shadow,
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 950, color: UI.text }}>Actions</Typography>
          <Button
            variant="contained"
            disabled={!canCharge || chargingLoading}
            startIcon={<ElectricBoltIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: canCharge ? UI.brandGradStrong : UI.brandGradDisabled,
              color: "white",
              boxShadow: "0 14px 40px rgba(124,92,255,0.14)",
            }}
            onClick={onChargingAction}
          >
            {chargingActionLabel}
          </Button>
          {chargingError ? (
            <Typography variant="caption" sx={{ color: "rgba(244,67,54,0.9)" }}>
              {chargingError}
            </Typography>
          ) : null}
          {!isAuthenticated ? (
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Log in to buy a ticket and start charging.
            </Typography>
          ) : !hasTicket ? (
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Buy a ticket to start charging.
            </Typography>
          ) : null}
          {activeCar && isCompatible === false ? (
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Not compatible with your car's connector types.
            </Typography>
          ) : null}

          <Button
            variant="outlined"
            onClick={onOpenMaps}
            startIcon={<LaunchIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: UI.border,
              color: UI.text,
            }}
          >
            Open in Google Maps
          </Button>

          <Divider sx={{ borderColor: UI.border2 }} />

          <Stack spacing={0.75}>
            <Typography variant="caption" sx={{ color: UI.text3, fontWeight: 750 }}>
              Charging status
            </Typography>
            {loading || !station ? (
              <Skeleton variant="rounded" height={44} />
            ) : (
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 3,
                  border: `1px solid ${UI.border2}`,
                  backgroundColor: "rgba(10,10,16,0.02)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: statusColor(station.status as Availability),
                      boxShadow: "0 8px 18px rgba(10,10,16,0.14)",
                      border: "1px solid rgba(255,255,255,0.95)",
                    }}
                  />
                  <Typography sx={{ fontWeight: 900, color: UI.text }}>
                    {statusLabel(station.status as Availability)}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="caption" sx={{ color: UI.text3, fontWeight: 750 }}>
                    {minutesAgo(station.lastUpdatedISO)}m
                  </Typography>
                </Stack>
              </Box>
            )}

            {!loading && station?.status !== "AVAILABLE" ? (
              <Typography variant="body2" sx={{ color: UI.text2 }}>
                {station.status === "BUSY"
                  ? "All ports are currently in use. You can still navigate here and queue."
                  : "This station is currently offline. Use \u201cOpen in Google Maps\u201d for alternatives."}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
