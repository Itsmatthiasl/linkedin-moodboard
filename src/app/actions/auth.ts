"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { findUnsupportedChar } from "@/lib/validation";

const UNSUPPORTED_CHAR_MESSAGE =
  "Password contains an unsupported character (like a smart quote or bullet, often inserted by a password manager). Please use only standard letters, numbers, and symbols.";

function sanitizeAuthErrorMessage(message: string): string {
  if (/ByteString|character at index/i.test(message)) {
    return UNSUPPORTED_CHAR_MESSAGE;
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
  if (findUnsupportedChar(password)) {
    return { error: UNSUPPORTED_CHAR_MESSAGE };
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password." };
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
  if (findUnsupportedChar(password)) {
    return { error: UNSUPPORTED_CHAR_MESSAGE };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: sanitizeAuthErrorMessage(error.message) };
  }

  redirect("/boards");
}
