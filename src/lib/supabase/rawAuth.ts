import "server-only";

/**
 * Raw REST calls to Supabase's Auth API, bypassing supabase-js's GoTrueClient
 * request path entirely. We hit this repeatedly: GoTrueClient's own header
 * construction has produced "Cannot convert argument to a ByteString" /
 * "String contains non ISO-8859-1 code point" failures for both the anon-key
 * header (server-side, on Vercel's Node runtime) and, separately, in a real
 * user's browser (almost certainly a browser extension mangling the request
 * once auth calls ran client-side). A hand-built request with a fresh plain
 * object, made from the server, has been reliable in every test. Reads
 * (getUser, RLS-scoped queries) are untouched — they already work.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type RawSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: RawUser;
};

export type RawUser = {
  id: string;
  email?: string;
  [key: string]: unknown;
};

async function authFetch(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (typeof data?.msg === "string" && data.msg) ||
      (typeof data?.error_description === "string" && data.error_description) ||
      (typeof data?.message === "string" && data.message) ||
      `Request failed (${res.status})`;
    return { error: message as string };
  }

  return data;
}

export async function rawSignUp(
  email: string,
  password: string
): Promise<{ session: RawSession } | { needsConfirmation: true } | { error: string }> {
  const data = await authFetch("signup", { email, password });
  if (data.error) return { error: data.error };
  if (data.access_token) return { session: data as RawSession };
  return { needsConfirmation: true };
}

export async function rawSignInWithPassword(
  email: string,
  password: string
): Promise<{ session: RawSession } | { error: string }> {
  const data = await authFetch("token?grant_type=password", { email, password });
  if (data.error) return { error: data.error };
  return { session: data as RawSession };
}

export async function rawUpdatePassword(
  accessToken: string,
  password: string
): Promise<{ user: RawUser } | { error: string }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (typeof data?.msg === "string" && data.msg) ||
      (typeof data?.error_description === "string" && data.error_description) ||
      (typeof data?.message === "string" && data.message) ||
      `Request failed (${res.status})`;
    return { error: message };
  }

  return { user: data as RawUser };
}

export async function rawRequestPasswordReset(
  email: string,
  redirectTo: string
): Promise<{ ok: true } | { error: string }> {
  const query = new URLSearchParams({ redirect_to: redirectTo }).toString();
  const data = await authFetch(`recover?${query}`, { email, gotrue_meta_security: {} });
  if (data && data.error) return { error: data.error };
  // Supabase always responds 200 here even for unknown emails, by design.
  return { ok: true };
}
