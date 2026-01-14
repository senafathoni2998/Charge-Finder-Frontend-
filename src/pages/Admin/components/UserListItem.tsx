import type { MouseEvent } from "react";
import { Box, Button, Chip, Divider, IconButton, Stack, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { AdminUser } from "../types";
import { UI } from "../../../theme/theme";
import { roleChipStyles, userActionLabel, userStatusChipStyles } from "../utils";

type UserListItemProps = {
  user: AdminUser;
  isUpdating: boolean;
  onStatusAction: (user: AdminUser) => void;
  onOpenMenu: (event: MouseEvent<HTMLElement>, user: AdminUser) => void;
};

// Renders a single user row with actions and status badges.
export default function UserListItem({
  user,
  isUpdating,
  onStatusAction,
  onOpenMenu,
}: UserListItemProps) {
  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ md: "center" }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, color: UI.text, fontSize: 15 }}>
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
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
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
              onClick={() => onStatusAction(user)}
              disabled={isUpdating}
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
            onClick={(event) => onOpenMenu(event, user)}
            sx={{ borderRadius: 2.5, border: `1px solid ${UI.border2}` }}
            aria-label="User actions"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Divider sx={{ my: 2, borderColor: UI.border2 }} />
    </Box>
  );
}
