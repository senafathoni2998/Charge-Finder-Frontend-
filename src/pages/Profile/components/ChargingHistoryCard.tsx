import {
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";

export type ChargingHistoryItem = {
  id: string;
  endedAt: number | null;
  outcome: string | null;
  stationName: string;
  stationAddress: string;
  vehicleName: string;
  progressPercent: number | null;
  batteryPercentage: number | null;
  connectorType: string | null;
};

type ChargingHistoryCardProps = {
  items: ChargingHistoryItem[];
  loading?: boolean;
  error?: string | null;
};

const formatHistoryTime = (timestamp: number | null) => {
  if (!timestamp || !Number.isFinite(timestamp)) return "Unknown time";
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return "Unknown time";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const outcomeLabel = (outcome: string | null) => {
  if (!outcome) return "Ended";
  const normalized = outcome.trim().toUpperCase();
  if (normalized === "COMPLETED") return "Completed";
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "Cancelled";
  return outcome.trim();
};

const outcomeStyles = (outcome: string | null) => {
  const normalized = outcome?.trim().toUpperCase();
  if (normalized === "COMPLETED") {
    return {
      backgroundColor: "rgba(0,200,83,0.12)",
      borderColor: "rgba(0,200,83,0.35)",
    };
  }
  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return {
      backgroundColor: "rgba(244,67,54,0.12)",
      borderColor: "rgba(244,67,54,0.35)",
    };
  }
  return {
    backgroundColor: "rgba(10,10,16,0.06)",
    borderColor: UI.border2,
  };
};

// Shows the recent charging history for the signed-in driver.
export default function ChargingHistoryCard({
  items,
  loading = false,
  error,
}: ChargingHistoryCardProps) {
  const hasItems = items.length > 0;

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
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 900, color: UI.text }}>
              Charging history
            </Typography>
            <Typography sx={{ color: UI.text2 }}>
              Sessions from the last 3 days.
            </Typography>
          </Box>

          {loading ? (
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={72} />
              <Skeleton variant="rounded" height={72} />
            </Stack>
          ) : error ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: UI.text }}>
                Unable to load history
              </Typography>
              <Typography sx={{ color: UI.text2, mt: 0.5 }}>
                {error}
              </Typography>
            </Box>
          ) : hasItems ? (
            <Stack spacing={1.5}>
              {items.map((item) => {
                const progressLabel =
                  item.progressPercent != null
                    ? `Progress ${item.progressPercent}%`
                    : null;
                const batteryLabel =
                  item.batteryPercentage != null
                    ? `Battery ${item.batteryPercentage}%`
                    : null;
                const metaLabels = [
                  item.vehicleName ? `Vehicle: ${item.vehicleName}` : null,
                  item.connectorType ? `Connector: ${item.connectorType}` : null,
                  progressLabel,
                  batteryLabel,
                ].filter(Boolean) as string[];
                const label = outcomeLabel(item.outcome);
                const chipStyle = outcomeStyles(item.outcome);
                return (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: `1px solid ${UI.border2}`,
                      backgroundColor: "rgba(10,10,16,0.01)",
                    }}
                  >
                    <Stack spacing={0.75}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ sm: "center" }}
                        spacing={1}
                      >
                        <Typography sx={{ fontWeight: 900, color: UI.text }}>
                          {item.stationName || "Charging session"}
                        </Typography>
                        <Chip
                          size="small"
                          label={label}
                          sx={{
                            borderRadius: 999,
                            border: `1px solid ${chipStyle.borderColor}`,
                            backgroundColor: chipStyle.backgroundColor,
                            color: UI.text,
                            fontWeight: 800,
                          }}
                        />
                        <Box sx={{ flex: 1 }} />
                        <Typography variant="caption" sx={{ color: UI.text3 }}>
                          {formatHistoryTime(item.endedAt)}
                        </Typography>
                      </Stack>
                      {item.stationAddress ? (
                        <Typography variant="body2" sx={{ color: UI.text2 }}>
                          {item.stationAddress}
                        </Typography>
                      ) : null}
                      {metaLabels.length ? (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                          {metaLabels.map((meta) => (
                            <Chip
                              key={meta}
                              size="small"
                              label={meta}
                              sx={{
                                borderRadius: 999,
                                backgroundColor: "rgba(10,10,16,0.04)",
                                border: `1px solid ${UI.border2}`,
                                color: UI.text,
                                fontWeight: 700,
                              }}
                            />
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                No recent charging sessions.
              </Typography>
              <Typography sx={{ color: UI.text2, mt: 0.5 }}>
                Your last 3 days of charging will appear here.
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
