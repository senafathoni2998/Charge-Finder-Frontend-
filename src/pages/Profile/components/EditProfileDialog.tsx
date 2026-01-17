import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";

type EditProfileDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  nameDraft: string;
  regionDraft: string;
  profileError: string | null;
  email: string | null;
  userId: string | null;
  onNameChange: (value: string) => void;
  onRegionChange: (value: string) => void;
};

// Renders the profile editing dialog and form fields.
export default function EditProfileDialog({
  open,
  onClose,
  onSubmit,
  nameDraft,
  regionDraft,
  profileError,
  email,
  userId,
  onNameChange,
  onRegionChange,
}: EditProfileDialogProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const photoPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreviewRef.current) {
        URL.revokeObjectURL(photoPreviewRef.current);
        photoPreviewRef.current = null;
      }
    };
  }, []);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (photoPreviewRef.current) {
      URL.revokeObjectURL(photoPreviewRef.current);
      photoPreviewRef.current = null;
    }
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      photoPreviewRef.current = objectUrl;
      setPhotoPreview(objectUrl);
    } else {
      setPhotoPreview(null);
    }
  };

  const handlePhotoClear = () => {
    setPhotoFile(null);
    if (photoPreviewRef.current) {
      URL.revokeObjectURL(photoPreviewRef.current);
      photoPreviewRef.current = null;
    }
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleDialogClose = () => {
    handlePhotoClear();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      TransitionProps={{ onExited: handlePhotoClear }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: UI.surface,
          border: `1px solid ${UI.border}`,
          color: UI.text,
          boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 950 }}>Edit profile</DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Form
          id="profile-form"
          method="post"
          encType="multipart/form-data"
          onSubmit={onSubmit}
        >
          <input type="hidden" name="intent" value="profile" />
          <input type="hidden" name="userId" value={userId?.trim() || ""} />
          <Stack spacing={2}>
            <TextField
              label="Full name"
              name="name"
              value={nameDraft}
              onChange={(event) => onNameChange(event.target.value)}
              fullWidth
              required
              error={!!profileError}
              helperText={profileError || "Shown on your profile."}
            />
            <TextField label="Email" value={email || ""} fullWidth disabled />
            <Box>
              <Typography
                sx={{
                  color: UI.text2,
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  mb: 1,
                }}
              >
                Profile photo (optional)
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={photoPreview ?? undefined}
                  sx={{
                    width: 56,
                    height: 56,
                    background: UI.brandGrad,
                    color: "white",
                    fontWeight: 900,
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    type="button"
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      alignSelf: "flex-start",
                      borderColor: UI.border2,
                      color: UI.text,
                    }}
                  >
                    {photoFile ? "Change photo" : "Upload photo"}
                    <input
                      ref={photoInputRef}
                      hidden
                      accept="image/*"
                      name="image"
                      type="file"
                      onChange={handlePhotoChange}
                    />
                  </Button>
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    {photoFile ? photoFile.name : "JPG or PNG recommended."}
                  </Typography>
                </Stack>
                {photoFile ? (
                  <Button
                    type="button"
                    size="small"
                    onClick={handlePhotoClear}
                    sx={{ textTransform: "none", color: UI.text2 }}
                  >
                    Remove
                  </Button>
                ) : null}
              </Stack>
            </Box>
            <TextField
              label="Region"
              name="region"
              value={regionDraft}
              onChange={(event) => onRegionChange(event.target.value)}
              fullWidth
              placeholder="Example: Jakarta, ID"
              helperText="Used for local recommendations."
            />
          </Stack>
        </Form>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={handleDialogClose}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            borderColor: UI.border,
            color: UI.text,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          form="profile-form"
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
