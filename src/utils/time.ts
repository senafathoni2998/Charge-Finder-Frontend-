export function minutesAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.max(0, Math.round(diffMs / 60_000));
  return m;
}