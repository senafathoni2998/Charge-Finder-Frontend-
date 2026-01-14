import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { Station } from "../../../models/model";

type StationActionsMenuProps = {
  anchorEl: HTMLElement | null;
  station: Station | null;
  isDeleting: boolean;
  onClose: () => void;
  onEdit: (station: Station) => void;
  onDelete: (station: Station) => void;
};

// Renders the overflow menu for station actions.
export default function StationActionsMenu({
  anchorEl,
  station,
  isDeleting,
  onClose,
  onEdit,
  onDelete,
}: StationActionsMenuProps) {
  const open = Boolean(anchorEl);

  // Handles the edit action and closes the menu.
  const handleEdit = () => {
    if (station) onEdit(station);
    onClose();
  };

  // Handles the delete action and closes the menu.
  const handleDelete = () => {
    if (station) onDelete(station);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 2.5, minWidth: 160 } }}
    >
      <MenuItem onClick={handleEdit} disabled={!station}>
        <ListItemIcon>
          <EditOutlinedIcon fontSize="small" />
        </ListItemIcon>
        Edit
      </MenuItem>
      <MenuItem
        onClick={handleDelete}
        disabled={!station || isDeleting}
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
