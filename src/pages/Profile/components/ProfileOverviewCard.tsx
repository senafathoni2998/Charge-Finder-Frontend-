import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";

type ProfileOverviewCardProps = {
  displayName: string;
  email: string | null;
  regionLabel: string;
  initials: string;
  avatarUrl?: string | null;
  onEditProfile: () => void;
  onChangePassword: () => void;
};

// Renders the profile summary card with user info and primary actions.
export default function ProfileOverviewCard({
  displayName,
  email,
  regionLabel,
  initials,
  avatarUrl,
  onEditProfile,
  onChangePassword,
}: ProfileOverviewCardProps) {
  const emailLabel = email || "demo@chargefinder.app";

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
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <Avatar
              src={avatarUrl ?? undefined}
              sx={{
                width: 64,
                height: 64,
                background: UI.brandGrad,
                color: "white",
                fontWeight: 900,
                fontSize: 24,
                boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: 20 }}>
                {displayName}
              </Typography>
              <Typography sx={{ color: UI.text2 }}>{emailLabel}</Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Chip
              label="Active"
              size="small"
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(0,229,255,0.12)",
                border: "1px solid rgba(0,229,255,0.3)",
                color: UI.text,
                fontWeight: 800,
              }}
            />
          </Stack>

          <Divider sx={{ borderColor: UI.border2 }} />

          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ color: UI.text3, minWidth: 120 }}>
                Name
              </Typography>
              <Typography sx={{ color: UI.text, fontWeight: 700 }}>
                {displayName}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ color: UI.text3, minWidth: 120 }}>
                Email
              </Typography>
              <Typography sx={{ color: UI.text, fontWeight: 700 }}>
                {emailLabel}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ color: UI.text3, minWidth: 120 }}>
                Plan
              </Typography>
              <Typography sx={{ color: UI.text, fontWeight: 700 }}>
                {"Driver \u2022 Free"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ color: UI.text3, minWidth: 120 }}>
                Region
              </Typography>
              <Typography sx={{ color: UI.text, fontWeight: 700 }}>
                {regionLabel}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: UI.border2 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={onEditProfile}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
                backgroundColor: "rgba(10,10,16,0.01)",
              }}
            >
              Edit profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={onChangePassword}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
                backgroundColor: "rgba(10,10,16,0.01)",
              }}
            >
              Change password
            </Button>
            <Box sx={{ flex: 1 }} />
            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                type="submit"
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  backgroundColor: "rgba(244,67,54,0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(244,67,54,1)",
                  },
                }}
              >
                Sign out
              </Button>
            </Form>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
