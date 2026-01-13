import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  InputAdornment,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EvStationIcon from "@mui/icons-material/EvStation";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import type { Availability, ConnectorType, Station } from "../../models/model";
import { fetchStations } from "../../api/stations";
import { fetchUsers, patchUser, deleteUser } from "../../api/users";
import { deleteStation } from "../../api/adminStations";
import { UI } from "../../theme/theme";
import { minutesAgo } from "../../utils/time";
import { CONNECTOR_OPTIONS } from "../MainPage/constants";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending" | "suspended";
  lastActive: string;
};

type StationFilterStatus = "" | Availability;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object";

const toCleanString = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

const normalizeRoleValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string");
    return first ? first.trim().toLowerCase() : "";
  }
  if (typeof value === "string") return value.trim().toLowerCase();
  return "";
};

const formatNameFromEmail = (email: string) => {
  const [prefix] = email.split("@");
  const cleaned = prefix.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  return cleaned || "User";
};

const formatLastActive = (value: unknown): string => {
  if (typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return `${minutesAgo(parsed.toISOString())}m ago`;
    }
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "N/A";
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return `${minutesAgo(new Date(parsed).toISOString())}m ago`;
    }
    return trimmed;
  }
  return "N/A";
};

const normalizeUserStatus = (
  raw: Record<string, unknown>
): AdminUser["status"] => {
  const statusValue = raw.status ?? raw.state;
  if (typeof statusValue === "string") {
    const normalized = statusValue.trim().toLowerCase();
    if (normalized === "active" || normalized === "enabled") return "active";
    if (normalized === "pending" || normalized === "invited") return "pending";
    if (
      normalized === "suspended" ||
      normalized === "blocked" ||
      normalized === "disabled"
    )
      return "suspended";
  }
  if (typeof statusValue === "boolean") {
    return statusValue ? "active" : "suspended";
  }
  const isActive = raw.is_active ?? raw.active ?? raw.isActive;
  if (typeof isActive === "boolean") {
    return isActive ? "active" : "suspended";
  }
  const isSuspended =
    raw.suspended ?? raw.isSuspended ?? raw.disabled ?? raw.isDisabled;
  if (typeof isSuspended === "boolean") {
    return isSuspended ? "suspended" : "active";
  }
  return "active";
};

const normalizeAdminUser = (data: unknown): AdminUser | null => {
  if (!isRecord(data)) return null;
  const id = toCleanString(data.id ?? data.userId ?? data._id);
  if (!id) return null;
  const email = toCleanString(data.email ?? data.mail ?? data.userEmail);
  const name = toCleanString(
    data.name ?? data.fullName ?? data.displayName ?? data.username
  );
  const role =
    normalizeRoleValue(data.role ?? data.roles ?? data.userRole) || "user";
  const status = normalizeUserStatus(data);
  const lastActive = formatLastActive(
    data.lastActive ??
      data.last_active ??
      data.lastLogin ??
      data.last_login ??
      data.lastSeen ??
      data.updatedAt ??
      data.updated_at
  );
  const finalEmail = email || "unknown@chargefinder.app";
  const finalName = name || formatNameFromEmail(finalEmail);

  return {
    id,
    name: finalName,
    email: finalEmail,
    role,
    status,
    lastActive,
  };
};

const nextStatusForUser = (status: AdminUser["status"]) => {
  if (status === "active") return "suspended";
  if (status === "suspended") return "active";
  return "active";
};

const userActionLabel = (status: AdminUser["status"]) => {
  if (status === "active") return "Suspend";
  if (status === "suspended") return "Activate";
  return "Approve";
};

const statusChipStyles = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return {
        backgroundColor: "rgba(0, 200, 83, 0.12)",
        border: "1px solid rgba(0, 200, 83, 0.35)",
        color: UI.text,
      };
    case "BUSY":
      return {
        backgroundColor: "rgba(255, 193, 7, 0.18)",
        border: "1px solid rgba(255, 193, 7, 0.4)",
        color: UI.text,
      };
    case "OFFLINE":
      return {
        backgroundColor: "rgba(244, 67, 54, 0.14)",
        border: "1px solid rgba(244, 67, 54, 0.35)",
        color: UI.text,
      };
    default:
      return {
        backgroundColor: "rgba(10, 10, 16, 0.05)",
        border: `1px solid ${UI.border2}`,
        color: UI.text,
      };
  }
};

const roleChipStyles = (role: string) => {
  switch (role) {
    case "admin":
      return {
        backgroundColor: "rgba(124,92,255,0.12)",
        border: "1px solid rgba(124,92,255,0.35)",
        color: UI.text,
      };
    case "operator":
      return {
        backgroundColor: "rgba(0,229,255,0.12)",
        border: "1px solid rgba(0,229,255,0.35)",
        color: UI.text,
      };
    default:
      return {
        backgroundColor: "rgba(10, 10, 16, 0.05)",
        border: `1px solid ${UI.border2}`,
        color: UI.text,
      };
  }
};

const userStatusChipStyles = (status: AdminUser["status"]) => {
  switch (status) {
    case "active":
      return {
        backgroundColor: "rgba(0, 200, 83, 0.12)",
        border: "1px solid rgba(0, 200, 83, 0.35)",
        color: UI.text,
      };
    case "pending":
      return {
        backgroundColor: "rgba(255, 193, 7, 0.18)",
        border: "1px solid rgba(255, 193, 7, 0.4)",
        color: UI.text,
      };
    case "suspended":
      return {
        backgroundColor: "rgba(244, 67, 54, 0.14)",
        border: "1px solid rgba(244, 67, 54, 0.35)",
        color: UI.text,
      };
    default:
      return {
        backgroundColor: "rgba(10, 10, 16, 0.05)",
        border: `1px solid ${UI.border2}`,
        color: UI.text,
      };
  }
};

export default function AdminPage() {
  const navigate = useNavigate();
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersUpdating, setUsersUpdating] = useState<Record<string, boolean>>(
    {}
  );
  const [usersDeleting, setUsersDeleting] = useState<Record<string, boolean>>(
    {}
  );
  const [userActionError, setUserActionError] = useState<string | null>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [userMenuTarget, setUserMenuTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadStations = async () => {
      setStationsLoading(true);
      setStationsError(null);
      const result = await fetchStations(controller.signal);
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

  const handleUserStatusAction = async (user: AdminUser) => {
    const nextStatus = nextStatusForUser(user.status);
    setUserActionError(null);
    setUsersUpdating((prev) => ({ ...prev, [user.id]: true }));

    const result = await patchUser({
      userId: user.id,
      data: { status: nextStatus },
    });

    if (!result.ok) {
      setUserActionError(result.error || "Could not update user.");
      setUsersUpdating((prev) => ({ ...prev, [user.id]: false }));
      return;
    }

    const normalized = result.user ? normalizeAdminUser(result.user) : null;
    setUsers((prev) =>
      prev.map((existing) => {
        if (existing.id !== user.id) return existing;
        if (normalized) return normalized;
        return { ...existing, status: nextStatus, lastActive: "Just now" };
      })
    );
    setUsersUpdating((prev) => ({ ...prev, [user.id]: false }));
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Delete user ${user.name || user.email}? This cannot be undone.`
      );
      if (!confirmed) return;
    }
    setUserActionError(null);
    setUsersDeleting((prev) => ({ ...prev, [user.id]: true }));

    const result = await deleteUser(user.id);
    if (!result.ok) {
      setUserActionError(result.error || "Could not delete user.");
      setUsersDeleting((prev) => ({ ...prev, [user.id]: false }));
      return;
    }

    setUsers((prev) => prev.filter((existing) => existing.id !== user.id));
    setUsersDeleting((prev) => ({ ...prev, [user.id]: false }));
  };

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

  const openStationMenu = (
    event: MouseEvent<HTMLElement>,
    station: Station
  ) => {
    setStationMenuAnchorEl(event.currentTarget);
    setStationMenuTarget(station);
  };

  const closeStationMenu = () => {
    setStationMenuAnchorEl(null);
    setStationMenuTarget(null);
  };

  const openUserMenu = (event: MouseEvent<HTMLElement>, user: AdminUser) => {
    setUserMenuAnchorEl(event.currentTarget);
    setUserMenuTarget(user);
  };

  const closeUserMenu = () => {
    setUserMenuAnchorEl(null);
    setUserMenuTarget(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      const result = await fetchUsers(controller.signal);
      if (!active) return;
      if (result.ok) {
        const normalized = result.users
          .map(normalizeAdminUser)
          .filter(Boolean) as AdminUser[];
        setUsers(normalized);
      } else {
        setUsers([]);
        setUsersError(result.error || "Could not load users.");
      }
      setUsersLoading(false);
    };

    loadUsers();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const stationFiltersActiveCount = useMemo(() => {
    let count = 0;
    if (stationStatusFilter) count += 1;
    if (stationConnectorSet.size) count += 1;
    if (stationMinKW > 0) count += 1;
    return count;
  }, [stationStatusFilter, stationConnectorSet, stationMinKW]);

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

  const handleToggleStationConnector = (connector: ConnectorType) => {
    setStationConnectorSet((prev) => {
      const next = new Set(prev);
      if (next.has(connector)) next.delete(connector);
      else next.add(connector);
      return next;
    });
  };

  const handleResetStationFilters = () => {
    setStationStatusFilter("");
    setStationConnectorSet(new Set());
    setStationMinKW(0);
  };

  const stats = useMemo(() => {
    const totalStations = stations.length;
    const availableStations = stations.filter(
      (s) => s.status === "AVAILABLE"
    ).length;
    const offlineStations = stations.filter(
      (s) => s.status === "OFFLINE"
    ).length;
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const adminCount = users.filter((u) => u.role === "admin").length;
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
  }, [stations, users]);

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontWeight: 950, color: UI.text, fontSize: 30 }}
              >
                Admin Control Center
              </Typography>
              <Typography sx={{ color: UI.text2 }}>
                Manage stations, users, and operational health in one place.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                icon={<AdminPanelSettingsIcon />}
                label="Role: Admin"
                sx={{
                  borderRadius: 999,
                  backgroundColor: "rgba(124,92,255,0.12)",
                  border: "1px solid rgba(124,92,255,0.35)",
                  color: UI.text,
                  fontWeight: 700,
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate("/admin/stations/new")}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: UI.text,
                  backgroundColor: "rgba(10,10,16,0.01)",
                }}
              >
                Add station
              </Button>
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate("/admin/users/new")}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  background: UI.brandGrad,
                  boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
                }}
              >
                Invite user
              </Button>
            </Stack>
          </Stack>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: UI.border2,
              background: UI.surface,
              boxShadow: UI.shadow,
              overflow: "hidden",
            }}
          >
            <Box sx={{ height: 6, background: UI.brandGradStrong }} />
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ md: "center" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{ fontWeight: 800, color: UI.text, fontSize: 20 }}
                  >
                    Operational snapshot
                  </Typography>
                  <Typography sx={{ color: UI.text2 }}>
                    Review key signals and keep the network healthy.
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                >
                  <Chip
                    label="Stations synced"
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(0,229,255,0.12)",
                      border: "1px solid rgba(0,229,255,0.35)",
                      color: UI.text,
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label="Security checks passed"
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(10,10,16,0.05)",
                      border: `1px solid ${UI.border2}`,
                      color: UI.text,
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label="Last sync 5m ago"
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(124,92,255,0.12)",
                      border: "1px solid rgba(124,92,255,0.35)",
                      color: UI.text,
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {stats.map((stat) => (
              <Card
                key={stat.label}
                variant="outlined"
                sx={{
                  borderRadius: 4,
                  borderColor: UI.border2,
                  background: UI.surface,
                  boxShadow: "0 12px 30px rgba(10,10,16,0.08)",
                }}
              >
                <CardContent sx={{ p: 2.25 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2.5,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(124,92,255,0.12)",
                        color: UI.text,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography
                      sx={{ fontWeight: 900, fontSize: 22, color: UI.text }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography sx={{ color: UI.text2, fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{ color: UI.text3, fontSize: 13 }}>
                      {stat.caption}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", lg: "1.35fr 1fr" },
            }}
          >
            <Card
              variant="outlined"
              sx={{
                borderRadius: 5,
                borderColor: UI.border2,
                background: UI.surface,
                boxShadow: UI.shadow,
              }}
            >
              <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ sm: "center" }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, color: UI.text }}>
                        Station management
                      </Typography>
                      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                        Review availability, edit details, and resolve issues.
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }} />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<TuneIcon />}
                        onClick={() => setStationFiltersOpen((prev) => !prev)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 3,
                          borderColor: UI.border,
                          color: UI.text,
                          backgroundColor: stationFiltersOpen
                            ? "rgba(124,92,255,0.08)"
                            : "transparent",
                        }}
                      >
                        {stationFiltersActiveCount
                          ? `Filters (${stationFiltersActiveCount})`
                          : "Filters"}
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/admin/stations/new")}
                        sx={{
                          textTransform: "none",
                          borderRadius: 3,
                          background: UI.brandGrad,
                        }}
                      >
                        New station
                      </Button>
                    </Stack>
                  </Stack>

                  <TextField
                    placeholder="Search stations, IDs, or cities"
                    size="small"
                    fullWidth
                    value={stationQuery}
                    onChange={(event) => setStationQuery(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Collapse in={stationFiltersOpen}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: `1px solid ${UI.border2}`,
                        backgroundColor: "rgba(10,10,16,0.02)",
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: UI.text3 }}
                          >
                            Filters
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            onClick={handleResetStationFilters}
                            disabled={!stationFiltersActiveCount}
                            sx={{
                              textTransform: "none",
                              borderRadius: 3,
                              color: UI.text2,
                            }}
                          >
                            Reset filters
                          </Button>
                        </Stack>

                        <Box
                          sx={{
                            display: "inline-flex",
                            justifyContent: "space-between",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: UI.text3 }}
                          >
                            Availability
                          </Typography>
                          <ToggleButtonGroup
                            exclusive
                            value={stationStatusFilter}
                            onChange={(_, value) =>
                              setStationStatusFilter(
                                (value ?? "") as StationFilterStatus
                              )
                            }
                            size="small"
                            sx={{
                              mt: 1,
                              flexWrap: "wrap",
                              "& .MuiToggleButton-root": {
                                textTransform: "none",
                                borderColor: UI.border2,
                              },
                            }}
                          >
                            <ToggleButton value="">All</ToggleButton>
                            <ToggleButton value="AVAILABLE">
                              Available
                            </ToggleButton>
                            <ToggleButton value="BUSY">Busy</ToggleButton>
                            <ToggleButton value="OFFLINE">Offline</ToggleButton>
                          </ToggleButtonGroup>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: UI.text3 }}
                          >
                            Connectors
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mt: 1, flexWrap: "wrap" }}
                          >
                            {CONNECTOR_OPTIONS.map((connector) => {
                              const active = stationConnectorSet.has(connector);
                              const chipBg = active
                                ? "rgba(124,92,255,0.12)"
                                : "transparent";
                              const chipBorder = active
                                ? "rgba(124,92,255,0.35)"
                                : UI.border2;
                              return (
                                <Chip
                                  key={connector}
                                  clickable
                                  label={connector}
                                  variant={active ? "filled" : "outlined"}
                                  onClick={() =>
                                    handleToggleStationConnector(connector)
                                  }
                                  sx={{
                                    borderRadius: 999,
                                    backgroundColor: chipBg,
                                    borderColor: chipBorder,
                                    color: UI.text,
                                    fontWeight: 700,
                                  }}
                                />
                              );
                            })}
                          </Stack>
                        </Box>

                        <Box>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: UI.text3 }}
                            >
                              Minimum power
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: UI.text3 }}
                            >
                              {stationMinKW || 0} kW
                            </Typography>
                          </Stack>
                          <Slider
                            value={
                              Number.isFinite(stationMinKW) ? stationMinKW : 0
                            }
                            onChange={(_, value) =>
                              setStationMinKW(
                                Array.isArray(value) ? value[0] : value
                              )
                            }
                            step={10}
                            min={0}
                            max={200}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  </Collapse>

                  {stationActionError ? (
                    <Typography
                      sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}
                    >
                      {stationActionError}
                    </Typography>
                  ) : null}

                  <Stack spacing={2}>
                    {stationsLoading ? (
                      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                        Loading stations\u2026
                      </Typography>
                    ) : filteredStations.length ? (
                      filteredStations.map((station) => {
                        const totalPorts = station.connectors.reduce(
                          (sum, c) => sum + c.ports,
                          0
                        );
                        const availablePorts = station.connectors.reduce(
                          (sum, c) => sum + c.availablePorts,
                          0
                        );
                        const connectorLabels = station.connectors
                          .map((c) => c.type)
                          .join(", ");
                        return (
                          <Box key={station.id}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              spacing={1.5}
                              alignItems={{ md: "center" }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    color: UI.text,
                                    fontSize: 16,
                                  }}
                                >
                                  {station.name}
                                </Typography>
                                <Typography
                                  sx={{ color: UI.text2, fontSize: 13 }}
                                >
                                  {station.address}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  flexWrap="wrap"
                                  sx={{ mt: 0.5 }}
                                >
                                  <Chip
                                    label={`${availablePorts}/${totalPorts} ports`}
                                    size="small"
                                    sx={{
                                      borderRadius: 999,
                                      backgroundColor: "rgba(10,10,16,0.05)",
                                      border: `1px solid ${UI.border2}`,
                                      color: UI.text,
                                    }}
                                  />
                                  <Typography
                                    sx={{ color: UI.text3, fontSize: 12 }}
                                  >
                                    {connectorLabels}
                                  </Typography>
                                  <Typography
                                    sx={{ color: UI.text3, fontSize: 12 }}
                                  >
                                    Updated {minutesAgo(station.lastUpdatedISO)}
                                    m ago
                                  </Typography>
                                </Stack>
                              </Box>
                              <Box sx={{ flex: 1 }} />
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Chip
                                  label={station.status}
                                  size="small"
                                  sx={{
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    ...statusChipStyles(station.status),
                                  }}
                                />
                                <IconButton
                                  onClick={(event) =>
                                    openStationMenu(event, station)
                                  }
                                  sx={{
                                    borderRadius: 2.5,
                                    border: `1px solid ${UI.border2}`,
                                  }}
                                  aria-label="Station actions"
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                            <Divider sx={{ my: 2, borderColor: UI.border2 }} />
                          </Box>
                        );
                      })
                    ) : (
                      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                        {stationsError ||
                          (stations.length
                            ? "No stations match the current filters."
                            : "No stations found.")}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            <Menu
              anchorEl={stationMenuAnchorEl}
              open={Boolean(stationMenuAnchorEl)}
              onClose={closeStationMenu}
              PaperProps={{ sx: { borderRadius: 2.5, minWidth: 160 } }}
            >
              <MenuItem
                onClick={() => {
                  if (stationMenuTarget) {
                    navigate(`/admin/stations/${stationMenuTarget.id}/edit`);
                  }
                  closeStationMenu();
                }}
                disabled={!stationMenuTarget}
              >
                <ListItemIcon>
                  <EditOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (stationMenuTarget) {
                    handleDeleteStation(stationMenuTarget);
                  }
                  closeStationMenu();
                }}
                disabled={
                  !stationMenuTarget || !!stationsDeleting[stationMenuTarget.id]
                }
                sx={{ color: "rgba(244,67,54,0.95)" }}
              >
                <ListItemIcon>
                  <DeleteOutlineIcon
                    fontSize="small"
                    sx={{ color: "rgba(244,67,54,0.95)" }}
                  />
                </ListItemIcon>
                Delete
              </MenuItem>
            </Menu>

            <Stack spacing={2}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 5,
                  borderColor: UI.border2,
                  background: UI.surface,
                  boxShadow: UI.shadow,
                }}
              >
                <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ sm: "center" }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, color: UI.text }}>
                          User management
                        </Typography>
                        <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                          Manage roles, access, and account health.
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }} />
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/admin/users/new")}
                        sx={{
                          textTransform: "none",
                          borderRadius: 3,
                          borderColor: UI.border,
                          color: UI.text,
                        }}
                      >
                        Add user
                      </Button>
                    </Stack>

                    <TextField
                      placeholder="Search users or emails"
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {userActionError ? (
                      <Typography
                        sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}
                      >
                        {userActionError}
                      </Typography>
                    ) : null}

                    <Stack spacing={2}>
                      {usersLoading ? (
                        <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                          Loading users...
                        </Typography>
                      ) : users.length ? (
                        users.map((user) => (
                          <Box key={user.id}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              spacing={1.5}
                              alignItems={{ md: "center" }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    color: UI.text,
                                    fontSize: 15,
                                  }}
                                >
                                  {user.name}
                                </Typography>
                                <Typography
                                  sx={{ color: UI.text2, fontSize: 13 }}
                                >
                                  {user.email}
                                </Typography>
                                <Typography
                                  sx={{ color: UI.text3, fontSize: 12 }}
                                >
                                  Last active: {user.lastActive}
                                </Typography>
                              </Box>
                              <Box sx={{ flex: 1 }} />
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Chip
                                  label={user.role}
                                  size="small"
                                  sx={{
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    textTransform: "capitalize",
                                    ...roleChipStyles(user.role),
                                  }}
                                />
                                <Chip
                                  label={user.status}
                                  size="small"
                                  sx={{
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    textTransform: "capitalize",
                                    ...userStatusChipStyles(user.status),
                                  }}
                                />
                                {user.status !== "active" ? (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleUserStatusAction(user)}
                                    disabled={!!usersUpdating[user.id]}
                                    sx={{
                                      textTransform: "none",
                                      borderRadius: 3,
                                      borderColor: UI.border2,
                                      color: UI.text,
                                    }}
                                  >
                                    {userActionLabel(user.status)}
                                  </Button>
                                ) : null}
                                <IconButton
                                  onClick={(event) => openUserMenu(event, user)}
                                  sx={{
                                    borderRadius: 2.5,
                                    border: `1px solid ${UI.border2}`,
                                  }}
                                  aria-label="User actions"
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                            <Divider sx={{ my: 2, borderColor: UI.border2 }} />
                          </Box>
                        ))
                      ) : (
                        <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                          {usersError || "No users found."}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={closeUserMenu}
                PaperProps={{ sx: { borderRadius: 2.5, minWidth: 160 } }}
              >
                <MenuItem
                  onClick={() => {
                    if (userMenuTarget) {
                      handleDeleteUser(userMenuTarget);
                    }
                    closeUserMenu();
                  }}
                  disabled={
                    !userMenuTarget || !!usersDeleting[userMenuTarget.id]
                  }
                  sx={{ color: "rgba(244,67,54,0.95)" }}
                >
                  <ListItemIcon>
                    <DeleteOutlineIcon
                      fontSize="small"
                      sx={{ color: "rgba(244,67,54,0.95)" }}
                    />
                  </ListItemIcon>
                  Delete
                </MenuItem>
              </Menu>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
