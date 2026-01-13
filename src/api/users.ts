type FetchUsersResult = {
  ok: boolean;
  users: unknown[];
  error?: string;
};

type PatchUserResult = {
  ok: boolean;
  user: unknown | null;
  error?: string;
};

type CreateUserResult = {
  ok: boolean;
  user: unknown | null;
  error?: string;
};

type DeleteUserResult = {
  ok: boolean;
  error?: string;
};

type CreateUserPayload = {
  name: string;
  email: string;
  role: string;
  password?: string;
  region?: string;
  signal?: AbortSignal;
};

type PatchUserPayload = {
  userId: string;
  data: Record<string, unknown>;
  signal?: AbortSignal;
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
    const response = await fetch(`${baseUrl}/admin/users`, {
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

// Updates a user using admin credentials.
export const patchUser = async ({
  userId,
  data,
  signal,
}: PatchUserPayload): Promise<PatchUserResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, user: null, error: "Backend URL is not configured." };
  }

  if (!userId) {
    return { ok: false, user: null, error: "User ID is missing." };
  }

  try {
    const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
      method: "PATCH",
      credentials: "include",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        user: null,
        error: responseData.message || "Could not update user.",
      };
    }

    const user = responseData?.user ?? responseData?.updatedUser ?? null;
    return { ok: true, user };
  } catch (err) {
    return {
      ok: false,
      user: null,
      error: err instanceof Error ? err.message : "Could not update user.",
    };
  }
};

// Deletes a user using admin credentials.
export const deleteUser = async (
  userId: string,
  signal?: AbortSignal
): Promise<DeleteUserResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!userId) {
    return { ok: false, error: "User ID is missing." };
  }

  try {
    const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
      signal,
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: responseData.message || "Could not delete user.",
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not delete user.",
    };
  }
};

// Creates a user using admin credentials.
export const createUser = async ({
  name,
  email,
  role,
  password,
  region,
  signal,
}: CreateUserPayload): Promise<CreateUserResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, user: null, error: "Backend URL is not configured." };
  }

  try {
    const response = await fetch(`${baseUrl}/admin/users`, {
      method: "POST",
      credentials: "include",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        role,
        password,
        region,
      }),
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        user: null,
        error: responseData.message || "Could not create user.",
      };
    }

    const user = responseData?.user ?? responseData?.createdUser ?? null;
    return { ok: true, user };
  } catch (err) {
    return {
      ok: false,
      user: null,
      error: err instanceof Error ? err.message : "Could not create user.",
    };
  }
};
