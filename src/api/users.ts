type FetchUsersResult = {
  ok: boolean;
  users: unknown[];
  error?: string;
};

// Loads users from the backend, returning an empty list on failures.
export const fetchUsers = async (
  signal?: AbortSignal
): Promise<FetchUsersResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, users: [], error: "Backend URL is not configured." };
  }

  try {
    const response = await fetch(`${baseUrl}/users`, {
      method: "GET",
      credentials: "include",
      signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        users: [],
        error: data.message || "Could not load users.",
      };
    }

    const users = Array.isArray(data?.users) ? data.users : [];
    return { ok: true, users };
  } catch (err) {
    return {
      ok: false,
      users: [],
      error: err instanceof Error ? err.message : "Could not load users.",
    };
  }
};
