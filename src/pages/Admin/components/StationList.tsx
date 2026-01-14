import type { MouseEvent } from "react";
import { Stack, Typography } from "@mui/material";
import type { Station } from "../../../models/model";
import { UI } from "../../../theme/theme";
import StationListItem from "./StationListItem";

type StationListProps = {
  stations: Station[];
  allStationsCount: number;
  isLoading: boolean;
  error: string | null;
  onOpenMenu: (event: MouseEvent<HTMLElement>, station: Station) => void;
};

// Displays the station list, loading state, or empty message.
export default function StationList({
  stations,
  allStationsCount,
  isLoading,
  error,
  onOpenMenu,
}: StationListProps) {
  if (isLoading) {
    return (
      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
        Loading stations\u2026
      </Typography>
    );
  }

  if (!stations.length) {
    return (
      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
        {error ||
          (allStationsCount
            ? "No stations match the current filters."
            : "No stations found.")}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {stations.map((station) => (
        <StationListItem
          key={station.id}
          station={station}
          onOpenMenu={onOpenMenu}
        />
      ))}
    </Stack>
  );
}
