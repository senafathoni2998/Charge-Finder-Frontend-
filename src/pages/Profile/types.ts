// Shared types for profile page data loaders/actions.
export type ProfileLoaderData = {
  user: {
    name?: string | null;
    region?: string | null;
    role?: string | null;
  } | null;
  vehicles: unknown[] | null;
  activeCarId: string | null;
};

// Action payloads returned by profile form submissions.
export type ProfileActionData = {
  intent: "profile" | "password";
  ok?: boolean;
  error?: string;
  name?: string | null;
  region?: string | null;
};
