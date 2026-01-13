import { redirect } from "react-router";
import { createUser } from "../../api/users";
import { isValidEmail, isValidName, passwordIssue } from "../../utils/validate";

const ROLE_OPTIONS = new Set(["admin", "user"]);
// Handles add-user submissions for admins.
export async function addUserAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "user")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const region = String(formData.get("region") || "").trim();

  if (!isValidName(name)) {
    return { error: "Name must be 2-50 characters." };
  }
  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!ROLE_OPTIONS.has(role)) {
    return { error: "Select a valid role." };
  }

  const issue = passwordIssue(password);
  if (issue) {
    return { error: issue };
  }
  if (!region) {
    return { error: "Region is required." };
  }

  const result = await createUser({
    name,
    email,
    role,
    password,
    region,
  });
  if (!result.ok) {
    return { error: result.error || "Could not add user." };
  }

  return redirect("/admin");
}
