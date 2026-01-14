import { useMemo } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router";
import EvStationIcon from "@mui/icons-material/EvStation";
import PeopleIcon from "@mui/icons-material/People";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { Station } from "../../models/model";
import AdminHeader from "./components/AdminHeader";
import AdminLayout from "./components/AdminLayout";
import OperationalSnapshotCard from "./components/OperationalSnapshotCard";
import StatsGrid from "./components/StatsGrid";
import StationActionsMenu from "./components/StationActionsMenu";
import StationManagementCard from "./components/StationManagementCard";
import UserActionsMenu from "./components/UserActionsMenu";
import UserManagementCard from "./components/UserManagementCard";
import useStationManagement from "./hooks/useStationManagement";
import useUserManagement from "./hooks/useUserManagement";

// Admin dashboard container that wires data hooks and page sections.
export default function AdminPage() {
  const navigate = useNavigate();
  const stationState = useStationManagement();
  const userState = useUserManagement();

  // Builds the summary stats displayed in the dashboard.
  const stats = useMemo(() => {
    const totalStations = stationState.stations.length;
    const availableStations = stationState.stations.filter(
      (s) => s.status === "AVAILABLE"
    ).length;
    const offlineStations = stationState.stations.filter(
      (s) => s.status === "OFFLINE"
    ).length;
    const totalUsers = userState.users.length;
    const activeUsers = userState.users.filter(
      (u) => u.status === "active"
    ).length;
    const adminCount = userState.users.filter((u) => u.role === "admin").length;
    return [
      {
        label: "Stations",
        value: totalStations,
        caption: `${availableStations} online`,
        icon: <EvStationIcon fontSize="small" />,
      },
      {
        label: "Offline alerts",
        value: offlineStations,
        caption: "Need review",
        icon: <WarningAmberIcon fontSize="small" />,
      },
      {
        label: "Users",
        value: totalUsers,
        caption: `${activeUsers} active`,
        icon: <PeopleIcon fontSize="small" />,
      },
      {
        label: "Admins",
        value: adminCount,
        caption: "Privileged access",
        icon: <VerifiedUserIcon fontSize="small" />,
      },
    ];
  }, [stationState.stations, userState.users]);

  // Navigates to the add-station flow.
  const handleAddStation = () => {
    navigate("/admin/stations/new");
  };

  // Navigates to the user invite flow.
  const handleAddUser = () => {
    navigate("/admin/users/new");
  };

  // Navigates to the edit screen for a selected station.
  const handleEditStation = (station: Station) => {
    navigate(`/admin/stations/${station.id}/edit`);
  };

  const isStationDeleting = stationState.stationMenuTarget
    ? !!stationState.stationsDeleting[stationState.stationMenuTarget.id]
    : false;
  const isUserDeleting = userState.userMenuTarget
    ? !!userState.usersDeleting[userState.userMenuTarget.id]
    : false;

  return (
    <AdminLayout>
      <AdminHeader
        onAddStation={handleAddStation}
        onInviteUser={handleAddUser}
      />
      <OperationalSnapshotCard />
      <StatsGrid stats={stats} />
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1.35fr 1fr" },
        }}
      >
        <StationManagementCard
          query={stationState.stationQuery}
          onQueryChange={stationState.onStationQueryChange}
          filtersOpen={stationState.stationFiltersOpen}
          onToggleFilters={stationState.toggleStationFiltersOpen}
          filtersActiveCount={stationState.stationFiltersActiveCount}
          statusFilter={stationState.stationStatusFilter}
          onStatusFilterChange={stationState.onStationStatusFilterChange}
          connectorSet={stationState.stationConnectorSet}
          onToggleConnector={stationState.toggleStationConnector}
          minKW={stationState.stationMinKW}
          onMinKWChange={stationState.onStationMinKWChange}
          onResetFilters={stationState.resetStationFilters}
          stationActionError={stationState.stationActionError}
          stationsLoading={stationState.stationsLoading}
          stationsError={stationState.stationsError}
          filteredStations={stationState.filteredStations}
          allStationsCount={stationState.stations.length}
          onOpenMenu={stationState.openStationMenu}
          onNewStation={handleAddStation}
        />
        <UserManagementCard
          users={userState.users}
          usersLoading={userState.usersLoading}
          usersError={userState.usersError}
          userActionError={userState.userActionError}
          usersUpdating={userState.usersUpdating}
          onStatusAction={userState.handleUserStatusAction}
          onOpenMenu={userState.openUserMenu}
          onAddUser={handleAddUser}
        />
      </Box>
      <StationActionsMenu
        anchorEl={stationState.stationMenuAnchorEl}
        station={stationState.stationMenuTarget}
        isDeleting={isStationDeleting}
        onClose={stationState.closeStationMenu}
        onEdit={handleEditStation}
        onDelete={stationState.handleDeleteStation}
      />
      <UserActionsMenu
        anchorEl={userState.userMenuAnchorEl}
        user={userState.userMenuTarget}
        isDeleting={isUserDeleting}
        onClose={userState.closeUserMenu}
        onDelete={userState.handleDeleteUser}
      />
    </AdminLayout>
  );
}
