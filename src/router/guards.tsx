import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";
import { useAppSelector } from "../app/hooks";

function safeNextPath(next: string | null): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("/login") ||
    next.startsWith("/signup")
  ) {
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
    if (typeof window !== "undefined") {
      try {
        const logoutRedirect = window.sessionStorage.getItem(
          "cf_logout_redirect"
        );
        if (logoutRedirect) {
          window.sessionStorage.removeItem("cf_logout_redirect");
          return <Navigate to="/" replace />;
        }
      } catch {
        // ignore
      }
    }
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

export function RequireAdmin() {
  const role = useAppSelector((state) => state.auth.role);
  const isAdmin = role === "admin";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
