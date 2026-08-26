"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";
import { AuthCard } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(updatePassword, undefined);

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form action={action} className="flex flex-col gap-4">
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
        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <SubmitButton pendingText="Saving…">Save new password</SubmitButton>
      </form>
    </AuthCard>
  );
}
