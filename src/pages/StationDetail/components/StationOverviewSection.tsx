import { Box, Button, Chip, Skeleton, Stack, Typography } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { UI } from "../../../theme/theme";
import { minutesAgo } from "../../../utils/time";
import type { Availability } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";
import type { Station } from "../types";
import StatusChip from "../../MainPage/components/StatusChip";
import MiniPhoto from "./MiniPhoto";
import SectionCard from "./SectionCard";

type StationOverviewSectionProps = {
  loading: boolean;
  station: Station | null;
  activeCar: UserCar | null;
  isCompatible: boolean | null;
  distanceKm: number | null;
  onReportIssue: () => void;
};

// Renders the station overview section with photos and quick status.
export default function StationOverviewSection({
  loading,
  station,
  activeCar,
  isCompatible,
  distanceKm,
  onReportIssue,
}: StationOverviewSectionProps) {
  const title = loading ? `Loading\u2026` : station?.name ?? "Station";
  const subtitle = loading ? "" : station?.address;

  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      right={
        loading ? (
          <Skeleton variant="rounded" width={90} height={28} />
        ) : station ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusChip
              status={station.status as Availability}
              isChargingHere={station.isChargingHere}
            />
            {activeCar && activeCar.connectorTypes.length ? (
              <Chip
                size="small"
                label={isCompatible ? "Compatible" : "Not supported"}
                sx={{
                  borderRadius: 999,
                  backgroundColor: isCompatible
                    ? "rgba(0,229,255,0.16)"
                    : "rgba(244,67,54,0.16)",
                  border: `1px solid ${
                    isCompatible
                      ? "rgba(0,229,255,0.35)"
                      : "rgba(244,67,54,0.35)"
                  }`,
                  color: UI.text,
                  fontWeight: 800,
                }}
              />
            ) : null}
          </Stack>
        ) : null
      }
    >
      {loading || !station ? (
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={140} />
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <MiniPhoto
              label={station.photos[0]?.label ?? "Photo"}
              gradient={station.photos[0]?.gradient ?? UI.brandGrad}
            />
            <MiniPhoto
              label={station.photos[1]?.label ?? "Photo"}
              gradient={station.photos[1]?.gradient ?? UI.brandGrad}
            />
            <MiniPhoto
              label={station.photos[2]?.label ?? "Photo"}
              gradient={station.photos[2]?.gradient ?? UI.brandGrad}
            />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
          >
            <Chip
              icon={<LaunchIcon />}
              label={distanceKm ? `${distanceKm.toFixed(1)} km away` : "\u2014"}
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.04)",
                border: `1px solid ${UI.border2}`,
                color: UI.text2,
                fontWeight: 750,
                alignSelf: { xs: "flex-start", sm: "auto" },
              }}
            />
            <Chip
              label={`Updated ${minutesAgo(station.lastUpdatedISO)}m ago`}
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.04)",
                border: `1px solid ${UI.border2}`,
                color: UI.text2,
                fontWeight: 750,
                alignSelf: { xs: "flex-start", sm: "auto" },
              }}
            />
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              onClick={onReportIssue}
              startIcon={<ReportProblemIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
                alignSelf: { xs: "stretch", sm: "auto" },
              }}
            >
              Report issue
            </Button>
          </Stack>

          {station.notes ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                Notes
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2, mt: 0.5 }}>
                {station.notes}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      )}
    </SectionCard>
  );
}
