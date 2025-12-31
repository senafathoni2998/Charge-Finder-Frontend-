export function isValidEmail(input: string) {
  const v = String(input || "").trim();
  // simple and safe for UI validation (not RFC-perfect)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function passwordIssue(pw: string) {
  const v = String(pw || "");
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(v) && !/[a-z]/.test(v))
    return "Use letters in your password.";
  if (!/\d/.test(v)) return "Add at least one number.";
  return null;
}

export function strengthLabel(pw: string): {
  label: string;
  tone: "weak" | "ok" | "strong";
} {
  const v = String(pw || "");
  let score = 0;
  if (v.length >= 8) score += 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v)) score += 1;

  if (score <= 1) return { label: "Weak", tone: "weak" };
  if (score <= 2) return { label: "Okay", tone: "ok" };
  return { label: "Strong", tone: "strong" };
}

export function toneChipSx(tone: "weak" | "ok" | "strong") {
  if (tone === "strong") {
    return {
      borderColor: "rgba(0, 229, 255, 0.45)",
      backgroundColor: "rgba(0, 229, 255, 0.12)",
    };
  }
  if (tone === "ok") {
    return {
      borderColor: "rgba(255, 193, 7, 0.45)",
      backgroundColor: "rgba(255, 193, 7, 0.12)",
    };
  }
  return {
    borderColor: "rgba(244, 67, 54, 0.45)",
    backgroundColor: "rgba(244, 67, 54, 0.10)",
  };
}
