import { useState, type FormEvent } from "react";
import { Box, Stack } from "@mui/material";
import { useActionData, useNavigate, useNavigation } from "react-router";
import { UI } from "../../theme/theme";
import { isValidEmail, isValidName, passwordIssue } from "../../utils/validate";
import type { AddUserActionData } from "./types";
import AddUserHeader from "./components/AddUserHeader";
import AddUserFormCard, {
  AddUserFormValues,
} from "./components/AddUserFormCard";

export { addUserAction } from "./addUserRoute";

// Add user page container that wires form state and layout components.
export default function AddUserPage() {
  const navigate = useNavigate();
  const actionData = useActionData() as AddUserActionData | undefined;
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    if (!isValidName(name)) {
      event.preventDefault();
      setFormError("Name must be 2-50 characters.");
      return;
    }
    if (!isValidEmail(email)) {
      event.preventDefault();
      setFormError("Please enter a valid email address.");
      return;
    }
    const issue = passwordIssue(password);
    if (issue) {
      event.preventDefault();
      setFormError(issue);
      return;
    }
    if (!region.trim()) {
      event.preventDefault();
      setFormError("Region is required.");
      return;
    }
    if (formError) setFormError(null);
  };

  const submitError = formError || actionData?.error || null;
  const isSubmitting = navigation.state === "submitting";

  const formValues: AddUserFormValues = {
    name,
    email,
    role,
    password,
    region,
  };

  const formHandlers = {
    onNameChange: (value: string) => setName(value),
    onEmailChange: (value: string) => setEmail(value),
    onRoleChange: (value: string) => setRole(value),
    onPasswordChange: (value: string) => setPassword(value),
    onRegionChange: (value: string) => setRegion(value),
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack spacing={2.5}>
          <AddUserHeader />
          <AddUserFormCard
            values={formValues}
            handlers={formHandlers}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin")}
          />
        </Stack>
      </Box>
    </Box>
  );
}
