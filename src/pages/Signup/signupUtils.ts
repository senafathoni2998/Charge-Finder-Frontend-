// Guards redirect targets to known safe internal routes.
export const safeNextPath = (next: string | null): string => {
  if (!next || !next.startsWith("/") || next.startsWith("/login")) return "/";
  if (next.startsWith("/signup")) return "/";
  return next;
};
