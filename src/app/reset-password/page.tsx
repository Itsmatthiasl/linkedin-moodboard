"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completePasswordReset, type RecoverySession } from "@/app/actions/auth";
import { AuthCard } from "@/components/AuthCard";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [session, setSession] = useState<RecoverySession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Supabase's recovery link redirects here with the session in the URL
    // fragment. We read it directly rather than through supabase-js's
    // client-side session detection, which still makes a network call
    // through the same request path that's been unreliable for some users.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");

    if (accessToken && refreshToken) {
      setSession({ access_token: accessToken, refresh_token: refreshToken });
      window.history.replaceState(null, "", window.location.pathname);
    }
    setChecked(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    if (!session) {
      setError("This reset link has expired. Request a new one from the login page.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");

    setPending(true);
    const result = await completePasswordReset(session, password);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/boards");
    router.refresh();
  }

  if (!checked) return null;

  if (!session) {
    return (
      <AuthCard title="Link expired" subtitle="This reset link is no longer valid.">
        <p className="text-sm text-neutral-500">
          Request a new one from the login page.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
          <p className="text-xs text-neutral-500">At least 8 characters.</p>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {pending ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthCard>
  );
}
