import { API_URL } from "./env";

export class ApiError extends Error {
  status: number;
  details?: { path: string; message: string }[];

  constructor(
    message: string,
    status: number,
    details?: { path: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

type ClerkGlobal = {
  session?: { getToken: () => Promise<string | null> };
};

/**
 * Grab the current Clerk session token (if the user signed in via Clerk).
 * Returns null when Clerk isn't loaded or there's no session — the request
 * then falls back to the legacy httpOnly `token` cookie via `credentials`.
 */
async function getClerkToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const clerk = (window as unknown as { Clerk?: ClerkGlobal }).Clerk;
  try {
    return (await clerk?.session?.getToken()) ?? null;
  } catch {
    return null;
  }
}

export async function api<T>(
  path: string,
  { method = "GET", body, headers }: RequestOptions = {},
): Promise<T> {
  const token = await getClerkToken();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message ?? `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data?.details);
  }

  return data as T;
}

export const authApi = {
  googleLogin: (idToken: string) =>
    api<{ user: UserPayload }>("/auth/google", {
      method: "POST",
      body: { idToken },
    }),
  logout: () => api<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => api<{ user: UserPayload }>("/auth/me"),
};

type UserPayload = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
};
