"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const GENERIC_ERROR_MESSAGE =
  "Something went wrong talking to the auth service. Please try again.";

function sanitizeAuthErrorMessage(message: string): string {
  if (/ByteString|character at index/i.test(message)) {
    return GENERIC_ERROR_MESSAGE;
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

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { error: sanitizeAuthErrorMessage(error.message) };
    }

    if (!data.session) {
      return { success: true };
    }
  } catch (err) {
    return { error: sanitizeAuthErrorMessage((err as Error).message) };
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

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: sanitizeAuthErrorMessage(error.message) };
    }
  } catch (err) {
    return { error: sanitizeAuthErrorMessage((err as Error).message) };
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

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      return { error: sanitizeAuthErrorMessage(error.message) };
    }
  } catch (err) {
    return { error: sanitizeAuthErrorMessage((err as Error).message) };
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

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: sanitizeAuthErrorMessage(error.message) };
    }
  } catch (err) {
    return { error: sanitizeAuthErrorMessage((err as Error).message) };
  }

  redirect("/boards");
}
