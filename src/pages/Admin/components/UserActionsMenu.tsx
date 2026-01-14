import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { AdminUser } from "../types";

type UserActionsMenuProps = {
  anchorEl: HTMLElement | null;
  user: AdminUser | null;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: (user: AdminUser) => void;
};

// Renders the overflow menu for user actions.
export default function UserActionsMenu({
  anchorEl,
  user,
  isDeleting,
  onClose,
  onDelete,
}: UserActionsMenuProps) {
  const open = Boolean(anchorEl);

  // Handles the delete action and closes the menu.
  const handleDelete = () => {
    if (user) onDelete(user);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 2.5, minWidth: 160 } }}
    >
      <MenuItem
        onClick={handleDelete}
        disabled={!user || isDeleting}
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
  );
}
