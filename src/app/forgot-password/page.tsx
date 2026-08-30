"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthCard } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
    >
      {state?.success ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Check your inbox for a reset link.
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-neutral-500">
        <Link href="/login" className="text-neutral-900 underline dark:text-white">
          Back to log in
        </Link>
      </p>
    </AuthCard>
  );
}
