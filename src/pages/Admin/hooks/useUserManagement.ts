import { useEffect, useState, type MouseEvent } from "react";
import { deleteUser, fetchUsers, patchUser } from "../../../api/users";
import type { AdminUser } from "../types";
import { nextStatusForUser, normalizeAdminUser } from "../utils";

type UserManagementState = {
  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  usersUpdating: Record<string, boolean>;
  usersDeleting: Record<string, boolean>;
  userActionError: string | null;
  userMenuAnchorEl: HTMLElement | null;
  userMenuTarget: AdminUser | null;
  openUserMenu: (event: MouseEvent<HTMLElement>, user: AdminUser) => void;
  closeUserMenu: () => void;
  handleUserStatusAction: (user: AdminUser) => Promise<void>;
  handleDeleteUser: (user: AdminUser) => Promise<void>;
};

// Manages users, permissions actions, and menus for the admin page.
export default function useUserManagement(): UserManagementState {
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

    // Fetches the user list on mount.
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

  // Updates the status of a user and synchronizes local state.
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

  // Deletes a user after confirmation and updates local state.
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

  // Opens the user action menu for a selected user.
  const openUserMenu = (event: MouseEvent<HTMLElement>, user: AdminUser) => {
    setUserMenuAnchorEl(event.currentTarget);
    setUserMenuTarget(user);
  };

  // Closes the user action menu and clears its target.
  const closeUserMenu = () => {
    setUserMenuAnchorEl(null);
    setUserMenuTarget(null);
  };

  return {
    users,
    usersLoading,
    usersError,
    usersUpdating,
    usersDeleting,
    userActionError,
    userMenuAnchorEl,
    userMenuTarget,
    openUserMenu,
    closeUserMenu,
    handleUserStatusAction,
    handleDeleteUser,
  };
}
