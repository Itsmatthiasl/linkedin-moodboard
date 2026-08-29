"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { findUnsupportedChar } from "@/lib/validation";

const GENERIC_UNSUPPORTED_CHAR_MESSAGE =
  "Password contains an unsupported character (like a smart quote or bullet, often inserted by a password manager). Please use only standard letters, numbers, and symbols.";

function describeUnsupportedChar(password: string): string | null {
  const found = findUnsupportedChar(password);
  if (!found) return null;
  return `Password contains "${found.char}" (character code ${found.codePoint}) at position ${found.index + 1}, which isn't supported — this is often inserted silently by a password manager's autofill. Try typing the password manually instead of using autofill, or remove that character.`;
}

function sanitizeAuthErrorMessage(message: string): string {
  if (/ByteString|character at index/i.test(message)) {
    return GENERIC_UNSUPPORTED_CHAR_MESSAGE;
  }
  return message;
}

export type AuthState = { error?: string; success?: boolean } | undefined;

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
  const unsupportedCharMessage = describeUnsupportedChar(password);
  if (unsupportedCharMessage) {
    return { error: unsupportedCharMessage };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: sanitizeAuthErrorMessage(error.message) };
  }

  if (!data.session) {
    return { success: true };
  }

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
  const unsupportedCharMessage = describeUnsupportedChar(password);
  if (unsupportedCharMessage) {
    return { error: unsupportedCharMessage };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: sanitizeAuthErrorMessage(error.message) };
  }

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

  const supabase = await createClient();
  const originHeader = (await headers()).get("origin");
  const origin = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { error: sanitizeAuthErrorMessage(error.message) };
  }

  return { success: true };
}

export async function updatePassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  const unsupportedCharMessage = describeUnsupportedChar(password);
  if (unsupportedCharMessage) {
    return { error: unsupportedCharMessage };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: sanitizeAuthErrorMessage(error.message) };
  }

  redirect("/boards");
}
