// Ensures a redirect path stays within the app and avoids login loops.
export const safeNextPath = (next: string | null): string => {
  if (!next || !next.startsWith("/") || next.startsWith("/login")) return "/";
  return next;
};
