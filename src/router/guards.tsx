import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";
import { useAppSelector } from "../app/hooks";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("/login")) {
    return "/";
  }
  return next;
}

export function RequireAuth() {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuth() {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));

  if (isAuthenticated) {
    return <Navigate to={next} replace />;
  }

  return <Outlet />;
}
