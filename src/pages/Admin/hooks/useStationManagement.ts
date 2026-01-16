import { useEffect, useMemo, useState, type MouseEvent } from "react";
import type { ConnectorType, Station } from "../../../models/model";
import { fetchStations } from "../../../api/stations";
import { deleteStation } from "../../../api/adminStations";
import type { StationFilterStatus } from "../types";

type StationManagementState = {
  stations: Station[];
  filteredStations: Station[];
  stationsLoading: boolean;
  stationsError: string | null;
  stationActionError: string | null;
  stationsDeleting: Record<string, boolean>;
  stationMenuAnchorEl: HTMLElement | null;
  stationMenuTarget: Station | null;
  stationQuery: string;
  stationStatusFilter: StationFilterStatus;
  stationConnectorSet: Set<ConnectorType>;
  stationMinKW: number;
  stationFiltersOpen: boolean;
  stationFiltersActiveCount: number;
  onStationQueryChange: (value: string) => void;
  onStationStatusFilterChange: (value: StationFilterStatus) => void;
  onStationMinKWChange: (value: number) => void;
  toggleStationFiltersOpen: () => void;
  openStationMenu: (event: MouseEvent<HTMLElement>, station: Station) => void;
  closeStationMenu: () => void;
  toggleStationConnector: (connector: ConnectorType) => void;
  resetStationFilters: () => void;
  handleDeleteStation: (station: Station) => Promise<void>;
};

// Manages stations, filters, and station-level actions for the admin page.
export default function useStationManagement(): StationManagementState {
  const [stations, setStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState<string | null>(null);
  const [stationActionError, setStationActionError] = useState<string | null>(
    null
  );
  const [stationsDeleting, setStationsDeleting] = useState<
    Record<string, boolean>
  >({});
  const [stationMenuAnchorEl, setStationMenuAnchorEl] =
    useState<HTMLElement | null>(null);
  const [stationMenuTarget, setStationMenuTarget] = useState<Station | null>(
    null
  );
  const [stationQuery, setStationQuery] = useState("");
  const [stationStatusFilter, setStationStatusFilter] =
    useState<StationFilterStatus>("");
  const [stationConnectorSet, setStationConnectorSet] = useState<
    Set<ConnectorType>
  >(new Set());
  const [stationMinKW, setStationMinKW] = useState(0);
  const [stationFiltersOpen, setStationFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // Fetches the station list on mount.
    const loadStations = async () => {
      setStationsLoading(true);
      setStationsError(null);
      const result = await fetchStations({ signal: controller.signal });
      if (!active) return;
      if (result.ok) {
        setStations(result.stations);
      } else {
        setStations([]);
        setStationsError(result.error || "Could not load stations.");
      }
      setStationsLoading(false);
    };

    loadStations();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  // Deletes a station after confirmation and updates local state.
  const handleDeleteStation = async (station: Station) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Delete station ${station.name}? This cannot be undone.`
      );
      if (!confirmed) return;
    }
    setStationActionError(null);
    setStationsDeleting((prev) => ({ ...prev, [station.id]: true }));

    const result = await deleteStation(station.id);
    if (!result.ok) {
      setStationActionError(result.error || "Could not delete station.");
      setStationsDeleting((prev) => ({ ...prev, [station.id]: false }));
      return;
    }

    setStations((prev) =>
      prev.filter((existing) => existing.id !== station.id)
    );
    setStationsDeleting((prev) => ({ ...prev, [station.id]: false }));
  };

  // Opens the station action menu for a selected station.
  const openStationMenu = (
    event: MouseEvent<HTMLElement>,
    station: Station
  ) => {
    setStationMenuAnchorEl(event.currentTarget);
    setStationMenuTarget(station);
  };

  // Closes the station action menu and clears its target.
  const closeStationMenu = () => {
    setStationMenuAnchorEl(null);
    setStationMenuTarget(null);
  };

  // Toggles a connector filter value on or off.
  const toggleStationConnector = (connector: ConnectorType) => {
    setStationConnectorSet((prev) => {
      const next = new Set(prev);
      if (next.has(connector)) next.delete(connector);
      else next.add(connector);
      return next;
    });
  };

  // Resets all station filters back to their defaults.
  const resetStationFilters = () => {
    setStationStatusFilter("");
    setStationConnectorSet(new Set());
    setStationMinKW(0);
  };

  // Toggles the visibility of the station filters panel.
  const toggleStationFiltersOpen = () => {
    setStationFiltersOpen((prev) => !prev);
  };

  // Updates the station search query.
  const handleStationQueryChange = (value: string) => {
    setStationQuery(value);
  };

  // Updates the selected status filter.
  const handleStationStatusFilterChange = (value: StationFilterStatus) => {
    setStationStatusFilter(value);
  };

  // Updates the minimum power filter value.
  const handleStationMinKWChange = (value: number) => {
    setStationMinKW(value);
  };

  // Counts how many station filters are currently active.
  const stationFiltersActiveCount = useMemo(() => {
    let count = 0;
    if (stationStatusFilter) count += 1;
    if (stationConnectorSet.size) count += 1;
    if (stationMinKW > 0) count += 1;
    return count;
  }, [stationStatusFilter, stationConnectorSet, stationMinKW]);

  // Applies all filters to the station list for display.
  const filteredStations = useMemo(() => {
    const query = stationQuery.trim().toLowerCase();
    return stations.filter((station) => {
      const matchesQuery = !query
        ? true
        : station.name.toLowerCase().includes(query) ||
          station.address.toLowerCase().includes(query) ||
          station.id.toLowerCase().includes(query);

      const matchesStatus = !stationStatusFilter
        ? true
        : station.status === stationStatusFilter;

      const matchesConnector = stationConnectorSet.size
        ? station.connectors.some((c) => stationConnectorSet.has(c.type))
        : true;

      const matchesMinKw = stationMinKW
        ? station.connectors.some((c) => c.powerKW >= stationMinKW)
        : true;

      return matchesQuery && matchesStatus && matchesConnector && matchesMinKw;
    });
  }, [
    stations,
    stationQuery,
    stationStatusFilter,
    stationConnectorSet,
    stationMinKW,
  ]);

  return {
    stations,
    filteredStations,
    stationsLoading,
    stationsError,
    stationActionError,
    stationsDeleting,
    stationMenuAnchorEl,
    stationMenuTarget,
    stationQuery,
    stationStatusFilter,
    stationConnectorSet,
    stationMinKW,
    stationFiltersOpen,
    stationFiltersActiveCount,
    onStationQueryChange: handleStationQueryChange,
    onStationStatusFilterChange: handleStationStatusFilterChange,
    onStationMinKWChange: handleStationMinKWChange,
    toggleStationFiltersOpen,
    openStationMenu,
    closeStationMenu,
    toggleStationConnector,
    resetStationFilters,
    handleDeleteStation,
  };
}
