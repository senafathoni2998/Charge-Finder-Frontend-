import type { MouseEvent } from "react";
import { Stack, Typography } from "@mui/material";
import type { AdminUser } from "../types";
import { UI } from "../../../theme/theme";
import UserListItem from "./UserListItem";

type UserListProps = {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  updatingMap: Record<string, boolean>;
  onStatusAction: (user: AdminUser) => void;
  onOpenMenu: (event: MouseEvent<HTMLElement>, user: AdminUser) => void;
};

// Displays the user list, loading state, or empty message.
export default function UserList({
  users,
  isLoading,
  error,
  updatingMap,
  onStatusAction,
  onOpenMenu,
}: UserListProps) {
  if (isLoading) {
    return (
      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
        Loading users...
      </Typography>
    );
  }

  if (!users.length) {
    return (
      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
        {error || "No users found."}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {users.map((user) => (
        <UserListItem
          key={user.id}
          user={user}
          isUpdating={!!updatingMap[user.id]}
          onStatusAction={onStatusAction}
          onOpenMenu={onOpenMenu}
        />
      ))}
    </Stack>
  );
}
