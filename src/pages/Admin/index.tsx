import { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AddIcon from "@mui/icons-material/Add";
import EvStationIcon from "@mui/icons-material/EvStation";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { UI } from "../../theme/theme";
import { MOCK_STATIONS } from "../../data/stations";
import { minutesAgo } from "../../utils/time";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending" | "suspended";
  lastActive: string;
};

type AdminQueueItem = {
  id: string;
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

const adminUsers: AdminUser[] = [
  {
    id: "usr-100",
    name: "Nadia Putri",
    email: "nadia@chargefinder.app",
    role: "admin",
    status: "active",
    lastActive: "2m ago",
  },
  {
    id: "usr-101",
    name: "Rafi Ahmad",
    email: "rafi@chargefinder.app",
    role: "operator",
    status: "active",
    lastActive: "18m ago",
  },
  {
    id: "usr-102",
    name: "Maya Putra",
    email: "maya@chargefinder.app",
    role: "support",
    status: "pending",
    lastActive: "Invite sent",
  },
  {
    id: "usr-103",
    name: "Dimas Yusuf",
    email: "dimas@chargefinder.app",
    role: "viewer",
    status: "suspended",
    lastActive: "3d ago",
  },
];

const adminQueue: AdminQueueItem[] = [
  {
    id: "queue-01",
    title: "Station st-003 offline report",
    detail: "Verify outage and notify operator",
    priority: "high",
  },
  {
    id: "queue-02",
    title: "New station submission",
    detail: "Kelapa Gading Supercharge expansion",
    priority: "medium",
  },
  {
    id: "queue-03",
    title: "User role change request",
    detail: "Promote rafi@chargefinder.app to admin",
    priority: "low",
  },
];

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

const queuePriorityStyles = (priority: AdminQueueItem["priority"]) => {
  switch (priority) {
    case "high":
      return {
        backgroundColor: "rgba(244, 67, 54, 0.12)",
        border: "1px solid rgba(244, 67, 54, 0.35)",
        color: UI.text,
      };
    case "medium":
      return {
        backgroundColor: "rgba(255, 193, 7, 0.18)",
        border: "1px solid rgba(255, 193, 7, 0.4)",
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
  const stations = MOCK_STATIONS;

  const stats = useMemo(() => {
    const totalStations = stations.length;
    const availableStations = stations.filter((s) => s.status === "AVAILABLE")
      .length;
    const offlineStations = stations.filter((s) => s.status === "OFFLINE")
      .length;
    const totalUsers = adminUsers.length;
    const activeUsers = adminUsers.filter((u) => u.status === "active").length;
    const adminCount = adminUsers.filter((u) => u.role === "admin").length;
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
  }, [stations]);

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
              <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 30 }}>
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
                        sx={{
                          textTransform: "none",
                          borderRadius: 3,
                          borderColor: UI.border,
                          color: UI.text,
                        }}
                      >
                        Filters
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack spacing={2}>
                    {stations.map((station) => {
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
                              <Typography sx={{ color: UI.text2, fontSize: 13 }}>
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
                                  Updated {minutesAgo(station.lastUpdatedISO)}m
                                  ago
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
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 3,
                                  borderColor: UI.border2,
                                  color: UI.text,
                                }}
                              >
                                Edit
                              </Button>
                              <IconButton
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
                    })}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

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

                    <Stack spacing={2}>
                      {adminUsers.map((user) => (
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
                              <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                                {user.email}
                              </Typography>
                              <Typography sx={{ color: UI.text3, fontSize: 12 }}>
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
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 3,
                                  borderColor: UI.border2,
                                  color: UI.text,
                                }}
                              >
                                Manage
                              </Button>
                              <IconButton
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
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

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
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: UI.text }}>
                        Review queue
                      </Typography>
                      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
                        Pending operational actions for today.
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      {adminQueue.map((item) => (
                        <Box
                          key={item.id}
                          sx={{
                            borderRadius: 3,
                            border: `1px solid ${UI.border2}`,
                            backgroundColor: "rgba(10,10,16,0.02)",
                            p: 1.5,
                          }}
                        >
                          <Stack spacing={0.75}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                sx={{ fontWeight: 700, color: UI.text }}
                              >
                                {item.title}
                              </Typography>
                              <Box sx={{ flex: 1 }} />
                              <Chip
                                label={item.priority}
                                size="small"
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 700,
                                  textTransform: "capitalize",
                                  ...queuePriorityStyles(item.priority),
                                }}
                              />
                            </Stack>
                            <Typography sx={{ color: UI.text2, fontSize: 13 }}>
                              {item.detail}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 3,
                                  borderColor: UI.border2,
                                  color: UI.text,
                                }}
                              >
                                Review
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 3,
                                  background: UI.brandGrad,
                                }}
                              >
                                Resolve
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
