"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  rawSignUp,
  rawSignInWithPassword,
  rawRequestPasswordReset,
  rawUpdatePassword,
} from "@/lib/supabase/rawAuth";

export type AuthState = { error?: string; success?: boolean } | undefined;

// setSession() re-validates the token with one extra network call, but that
// call runs on our server (like every getUser() call elsewhere in this app,
// which has been reliable throughout) rather than in the browser, so it
// isn't exposed to the browser-extension interference rawAuth.ts works
// around for the mutating auth calls themselves.
async function persistSession(tokens: { access_token: string; refresh_token: string }) {
  const supabase = await createClient();
  await supabase.auth.setSession(tokens);
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const result = await rawSignUp(email, password);

  if ("error" in result) {
    return { error: result.error };
  }
  if ("needsConfirmation" in result) {
    return { success: true };
  }

  await persistSession(result.session);
  redirect("/boards");
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const result = await rawSignInWithPassword(email, password);

  if ("error" in result) {
    return { error: "Invalid email or password." };
  }

  await persistSession(result.session);
  redirect("/boards");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Enter your email address." };
  }

  const originHeader = (await headers()).get("origin");
  const origin = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const result = await rawRequestPasswordReset(email, `${origin}/reset-password`);

  if ("error" in result) {
    return { error: result.error };
  }

  return { success: true };
}

export type RecoverySession = {
  access_token: string;
  refresh_token: string;
};

export async function completePasswordReset(
  session: RecoverySession,
  password: string
): Promise<{ error?: string }> {
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const result = await rawUpdatePassword(session.access_token, password);
  if ("error" in result) {
    return { error: result.error };
  }

  await persistSession(session);
  return {};
}
