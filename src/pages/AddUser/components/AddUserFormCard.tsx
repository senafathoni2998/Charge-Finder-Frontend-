import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Form } from "react-router";
import { UI } from "../../../theme/theme";

export type AddUserFormValues = {
  name: string;
  email: string;
  role: string;
  password: string;
  region: string;
};

type AddUserFormHandlers = {
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRegionChange: (value: string) => void;
};

type AddUserFormCardProps = {
  values: AddUserFormValues;
  handlers: AddUserFormHandlers;
  submitError: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  submittingLabel?: string;
};

const ROLE_OPTIONS = ["admin", "user"];
// Renders the user form card with inputs and actions.
export default function AddUserFormCard({
  values,
  handlers,
  submitError,
  isSubmitting,
  onSubmit,
  onCancel,
  submitLabel = "Create user",
  submittingLabel = "Creating...",
}: AddUserFormCardProps) {
  const [showPw, setShowPw] = useState(false);

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
        <Box component={Form} method="post" onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Full name"
              name="name"
              value={values.name}
              onChange={(event) => handlers.onNameChange(event.target.value)}
              placeholder="e.g. Nadia Putri"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={(event) => handlers.onEmailChange(event.target.value)}
              placeholder="e.g. nadia@chargefinder.app"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
            />
            <TextField
              label="Role"
              name="role"
              value={values.role}
              onChange={(event) => handlers.onRoleChange(event.target.value)}
              select
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
            >
              {ROLE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Password"
              name="password"
              type={showPw ? "text" : "password"}
              value={values.password}
              onChange={(event) => handlers.onPasswordChange(event.target.value)}
              placeholder="Set a temporary password"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((value) => !value)}
                      edge="end"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <VisibilityOffIcon sx={{ color: UI.text3 }} />
                      ) : (
                        <VisibilityIcon sx={{ color: UI.text3 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
            />
            <TextField
              label="Region"
              name="region"
              value={values.region}
              onChange={(event) => handlers.onRegionChange(event.target.value)}
              placeholder="e.g. Jakarta, ID"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.02)",
                },
              }}
            />

            {submitError ? (
              <Box sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
                {submitError}
              </Box>
            ) : null}

            <Divider sx={{ borderColor: UI.border2 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: UI.text,
                  backgroundColor: "rgba(10,10,16,0.01)",
                }}
              >
                Cancel
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  background: UI.brandGrad,
                  boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
                }}
              >
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
